# Backend — Dentissa (`backend-consultorio-dental/`)

Guía de trabajo para personas y agentes. Describe **cómo está construido hoy** el backend, las reglas que hay que respetar y cómo agregar código nuevo sin romper lo existente. Todas las rutas de este documento son relativas a `backend-consultorio-dental/` salvo que se indique lo contrario.

> Contexto funcional (qué debe hacer el sistema): `../docs/requerimientos/requerimientos.md` (RF-001…RF-031, RNF-001…RNF-006) y el diagrama ER en `../docs/requerimientos/diagramas.md`. El frontend que consume esta API vive en `../frontend-consultorio-dental/` y tiene su propia guía.

---

## 1. Resumen rápido

| Tema | Valor |
|---|---|
| Qué es | API REST de un sistema de gestión para un consultorio dental (usuarios, pacientes, servicios, citas; pendientes: consultas, ofertas, notificaciones, FAQs, odontograma) |
| Framework | NestJS 11 (Express) + TypeScript 5.7 |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 con driver adapter `@prisma/adapter-pg` (cliente en `@prisma/client`, formato CJS) |
| Validación | `class-validator` + `class-transformer` vía `ValidationPipe` global |
| Autenticación | JWT (access token, 15 min) + refresh token opaco rotativo (7 días), ambos en cookies `httpOnly` |
| Hash de contraseñas | `bcrypt` (10 rondas) |
| Puerto | `process.env.PORT ?? 3000` |
| CORS | Solo `http://localhost:5173` con `credentials: true` (hardcodeado en `src/main.ts`) |
| Gestor de paquetes | npm |

---

## 2. Comandos

```bash
npm run setup            # npm install + prisma generate + migrate dev + seed (primera vez)
npm run start:dev        # servidor en modo watch
npm run build            # compila a dist/
npm run start:prod       # node dist/main
npm run lint             # eslint --fix (¡modifica archivos!)
npm run format           # prettier --write (¡modifica archivos!)
npm run test             # jest (unit, *.spec.ts dentro de src/)
npm run test:e2e         # jest con test/jest-e2e.json

npm run migrate:dev          # crea y aplica una migración a partir de schema.prisma
npm run migrate:dev:create   # solo crea el SQL de la migración, sin aplicarla
npm run migrate:deploy       # aplica migraciones pendientes (producción)
npm run prisma:generate      # regenera el cliente de Prisma
npm run prisma:studio        # UI para explorar la BD
npm run prisma:seed          # crea roles y el admin inicial
```

Verificación de tipos sin generar archivos:

```bash
npx tsc --noEmit --incremental false -p tsconfig.json
```

> Estado actual de la línea base: el código de `src/` compila sin errores. Los únicos errores de tipos vienen de `users.controller.spec.ts` y `users.service.spec.ts` (importan `UsuariosController` / `UsuariosService`, nombres antiguos). Los `*.spec.ts` son el scaffold que genera el CLI de Nest: no tienen mocks de dependencias, así que **los tests unitarios no pasan hoy**. No asumas que `npm run test` en verde es la línea base.

### Variables de entorno (`.env`, ver `.env.example`)

| Variable | Uso real en el código |
|---|---|
| `DATABASE_URL` | **Obligatoria.** La lee `PrismaService` (lanza `Error('DATABASE_URL no definida')` si falta) y `prisma.config.ts` |
| `JWT_SECRET` | **Obligatoria.** Firma de los JWT (`SecurityModule`) |
| `PORT` | Opcional, por defecto `3000` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `ON_PRODUCTION`, `FRONTEND_URL` | Declaradas pero **no se usan** en el código actualmente |

Nunca subas `.env` ni pegues sus valores en código, logs o documentación.

Credenciales del admin que crea el seed (solo desarrollo): `administrador@gmail.com` / `12345678`.

---

## 3. Estructura de carpetas

```
backend-consultorio-dental/
├── prisma/
│   ├── schema.prisma            # Modelo de datos (fuente de verdad de las "entidades")
│   ├── migrations/              # Migraciones SQL generadas por Prisma (no editar a mano las ya aplicadas)
│   └── seed.ts                  # Crea los roles (desde el enum Role) y el usuario administrador
├── prisma.config.ts             # Config de Prisma 7: schema, migraciones, seed (tsx) y DATABASE_URL
├── src/
│   ├── main.ts                  # Bootstrap: cookie-parser, CORS, ValidationPipe e interceptor globales
│   ├── app.module.ts            # Módulo raíz: importa todos los módulos
│   ├── app.controller.ts / app.service.ts   # "Hello World" de plantilla (GET /)
│   │
│   ├── infrastructure/          # Piezas transversales, sin lógica de dominio
│   │   ├── common/
│   │   │   ├── common.module.ts                          # Vacío por ahora
│   │   │   └── interceptors/transform-response.interceptor.ts   # Envuelve respuestas exitosas
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts   # @Global(): PrismaService disponible en toda la app
│   │   │   └── prisma.service.ts  # PrismaClient + adapter pg + omit global de user.password
│   │   └── security/
│   │       ├── security.module.ts               # JwtModule + guards, exportados
│   │       ├── guards/auth.guard.ts             # Valida cookie access_token
│   │       ├── guards/is-active-user.guard.ts   # Verifica en BD que el usuario siga activo
│   │       └── decorators/public.decorator.ts   # @Public() salta ambos guards
│   │
│   └── modules/                 # Un módulo por dominio de negocio
│       ├── auth/          (controller, service, dto/, repositories/refresh-tokens.repository.ts)
│       ├── users/         (controller, service, dto/, enums/rol.enum.ts, repositories/)
│       ├── patients/      (controller, service, dto/, repositories/)
│       ├── services/      (controller, service, dto/, repositories/)   ← "servicios dentales"
│       └── appointments/  (controller, service, dto/, enums/, repositories/)
└── test/                        # e2e (plantilla)
```

Módulos pendientes según los requerimientos: `consultations`, `offers`, `notifications`, `faqs`, `dental-chart` (odontograma), horarios disponibles/no disponibles. Sus tablas **ya existen** en `schema.prisma` (`Consultation`, `ConsultationImage`, `Offer`, `ServiceOffer`, `AvailableTimeSlots`, `UnavailableTimeSlots`, `FrequentlyAskedQuestion`, `Notification`, `ServiceImage`).

No existe una capa de "entidades" en `src/`: los modelos de Prisma cumplen ese rol. No dupliques modelos como clases.

---

## 4. Arquitectura

### 4.1 Capas dentro de un módulo

```
HTTP request
   │
   ▼
Controller   → solo HTTP: rutas, @Body/@Query/@Param, pipes (ParseIntPipe), guards. Sin lógica.
   │
   ▼
Service      → lógica de negocio y reglas (validaciones de dominio, conflictos, transacciones,
   │            excepciones HTTP de Nest con mensajes en español, armado del shape de respuesta).
   ▼
Repository   → única capa que habla con Prisma. Solo consultas (where/select/include). Sin reglas.
   │
   ▼
PrismaService (global) → PostgreSQL
```

Reglas:

- **El controller nunca llama a Prisma ni a un repository.** Llama a su service.
- **El service no construye queries de Prisma** (salvo `this.prisma.$transaction(...)` para orquestar una transacción, como en `UsersService.createUserAndPatient`). Las queries van en el repository.
- **El repository no lanza reglas de negocio.** (Excepción existente: `UsersRepository.create` lanza `NotFoundException('Rol no encontrado')`; no repliques ese patrón.)
- El service puede inyectar repositories de otros dominios cuando necesita leer datos ajenos (ej. `AppointmentsService` usa `ServicesRepository` y `PatientsRepository`).

### 4.2 Ciclo de vida de una petición

1. `cookieParser()` parsea cookies (`request.cookies`).
2. CORS (`origin: http://localhost:5173`, `credentials: true`).
3. Guards del controller: `@UseGuards(AuthGuard, IsActiveUserGuard)`.
   - `AuthGuard`: si el handler/clase tiene `@Public()`, deja pasar. Si no, lee `request.cookies['access_token']`, lo verifica con `JwtService.verifyAsync` y guarda el payload en `request.user`. Cualquier fallo → `401 'No tienes permitido realizar esta acción'`.
   - `IsActiveUserGuard`: si es `@Public()`, deja pasar. Si no, cuenta en BD `user.id = request.user.id AND status = true`; si no existe → `401 'No tienes permitido acceder a este recurso'`.
4. `ValidationPipe` global (`transform: true`, `whitelist: true`, `stopAtFirstError: true`): convierte y valida `@Body()`/`@Query()` contra el DTO y **elimina propiedades no declaradas** en el DTO.
5. Controller → Service → Repository.
6. `TransformResponseInterceptor` envuelve la respuesta exitosa.

### 4.3 Contrato de respuesta (importante para el frontend)

**Éxito** — siempre envuelto por el interceptor global:

```json
{ "success": true, "message": "OK", "data": <lo que retorne el controller> }
```

**Error** — NO hay exception filter; se usa el formato por defecto de Nest:

```json
{ "statusCode": 400, "message": "Este correo ya esta registrado", "error": "Bad Request" }
```

Con errores de `ValidationPipe`, `message` es un **arreglo** de strings (uno por campo, por `stopAtFirstError`).

**Regla crítica:** el cliente HTTP del frontend (`src/services/api.ts`) rechaza cualquier respuesta exitosa cuyo `data` sea *falsy* (`null`, `undefined`, `false`, `0`, `""`) y la convierte en error genérico. Por eso:

- Un endpoint exitoso **siempre debe devolver un valor truthy**: un objeto, un arreglo (aunque esté vacío `[]`, que es truthy) o `true`.
- No devuelvas `null`/`undefined` para "no encontrado": lanza `NotFoundException` en el service.
- Por esa razón los endpoints de acción devuelven objetos como `{ refreshed: true }` o `{ loggedOut: true }`.

### 4.4 Autenticación y sesión

Implementada en `src/modules/auth/auth.service.ts`.

- **Login** (`POST /auth/login`): busca el usuario con contraseña (`getUserByEmailWithPassword`), compara con bcrypt. Credenciales inválidas → `404 'Las credenciales son incorrectas'`; usuario inactivo → `401 'Tu cuenta ha sido desactivada'`. Emite tokens y devuelve `{ logged: true, user: { id, name, lastname, email, phone, role } }` (`role` es el string, p. ej. `"ADMINISTRADOR"`).
- **Emisión de tokens** (`issueTokens`):
  - `access_token`: JWT con payload `{ id, name, lastname, email, phone, role, status }`, expira en 15 min. Cookie `httpOnly`, `secure: false`, `maxAge` 15 min.
  - `refresh_token`: 64 bytes aleatorios en hex. En BD se guarda **solo el hash SHA-256** (`refresh_tokens.token_hash`) con `expires_at` a 7 días. Cookie `httpOnly`, `path: '/auth'` (solo viaja a rutas `/auth/*`).
- **Refresh** (`POST /auth/refresh`): busca el hash válido (no revocado, no expirado), lo **revoca (rotación)** y emite un par nuevo. Sin cookie o token inválido → `401`.
- **Logout** (`DELETE /auth/logout`): revoca el refresh token si viene y limpia ambas cookies.
- **Registro público** (`POST /auth/register`): usa `RegisterUserDto` (= `CreateUserDto` sin `role`) y fuerza `role = PACIENTE`; requiere el objeto `patient`.
- `request.user` (en endpoints protegidos) contiene el payload del JWT.
- **No existe autorización por rol todavía** (no hay `RolesGuard` ni decorador `@Roles`). Cualquier usuario autenticado y activo puede llamar a cualquier endpoint protegido. Si implementas roles, crea `infrastructure/security/guards/roles.guard.ts` y `decorators/roles.decorator.ts` siguiendo el mismo patrón de `Reflector` que `@Public()`.
- `JwtModule.register` en `SecurityModule` define `expiresIn: '1d'` por defecto, pero `AuthService.createToken` lo sobrescribe a 15 min.

### 4.5 Inyección de dependencias entre módulos

- `PrismaModule` es `@Global()`: no hace falta importarlo para inyectar `PrismaService`.
- Todo módulo con endpoints protegidos importa `SecurityModule` (provee `AuthGuard`, `IsActiveUserGuard` y `JwtModule`).
- Para usar un repository de otro dominio, la forma preferida es que el módulo dueño lo **exporte** y el consumidor **importe el módulo** (así lo hace `UsersModule` con `PatientsModule`, que exporta `PatientsRepository`). `AppointmentsModule` hoy re-declara `ServicesRepository` y `PatientsRepository` en sus `providers` (funciona porque no tienen estado, pero crea instancias duplicadas); para código nuevo, importa el módulo.

---

## 5. Modelo de datos (Prisma)

Archivo: `prisma/schema.prisma`. Resumen de lo que hoy usa la API:

| Modelo (tabla) | Campos relevantes | Notas |
|---|---|---|
| `User` (`users`) | `id, name, lastname, email @unique, password, phone?, created_at, role_id, status (default true)` | `password` se omite globalmente en `PrismaService` |
| `Role` (`roles`) | `id, role @unique` | Valores: `ADMINISTRADOR`, `ASISTENTE`, `PACIENTE` (enum TS `src/modules/users/enums/rol.enum.ts`, sembrados por el seed) |
| `Patient` (`patients`) | `id, address, birth_date, emergency_phone?, user_id @unique` | 1 a 1 con `User`. Nombre, email, teléfono y estado viven en `User` |
| `Service` (`services`) | `id, name, durationMinutes, price Decimal(10,2), description, status (default true)` | `price` llega al cliente como **string** (Decimal serializado) |
| `Appointment` (`appointments`) | `id, scheduled_at, durationMinutes, status AppointmentStatus (default PENDIENTE), notes, reason?, created_at, updated_at, patient_id, service_id` | `durationMinutes` se copia del servicio al crear |
| `RefreshToken` (`refresh_tokens`) | `id, token_hash @unique, user_id, expires_at, revoked_at?, created_at` | |

Enum de BD `AppointmentStatus`: `PENDIENTE | COMPLETADA | CANCELADA | REPROGRAMADA | CONFIRMADA`. Úsalo importándolo de `@prisma/client` (como `GetAppointmentsDto`). El archivo `src/modules/appointments/enums/appointment-status.enum.ts` es una interfaz obsoleta con valores que no coinciden con la BD: **no lo uses**.

### 5.1 Convenciones de esquema

- Modelos en `PascalCase` singular; tablas en `snake_case` plural mediante `@@map("...")`.
- Campos en **inglés** y **`snake_case`**, declarados directamente así (sin `@map` de campos). El mismo nombre viaja BD → Prisma → respuesta JSON → frontend.
- **Excepción histórica:** `durationMinutes` (en `Service` y `Appointment`) está en camelCase. No lo renombres de forma aislada (rompería el frontend y requiere migración); para campos nuevos usa siempre `snake_case`.
- Relaciones: campo FK `<entidad>_id` + campo de relación con el nombre de la entidad (`patient`, `service`, `user`, `role`).
- Timestamps: `created_at DateTime @default(now())`, `updated_at DateTime @updatedAt` cuando aplique.
- Estados activo/inactivo: `status Boolean @default(true)`.

### 5.2 Migraciones

1. Edita `prisma/schema.prisma`.
2. `npm run migrate:dev` (o `migrate:dev:create` para revisar el SQL antes). Nombra la migración en inglés y `snake_case` describiendo el cambio (ej. `add_refresh_tokens`, `merge_date_and_time_into_scheduled_at`).
3. Prisma regenera el cliente; si no, `npm run prisma:generate`.
4. **Nunca** edites ni borres migraciones ya aplicadas/commiteadas. Si necesitas corregir algo, crea una migración nueva.
5. Si el cambio afecta datos iniciales, actualiza `prisma/seed.ts` (debe seguir siendo idempotente: `createMany({ skipDuplicates: true })`, `upsert`).

---

## 6. Endpoints actuales

Prefijo base: ninguno (`http://localhost:3000`). 🔒 = requiere `AuthGuard` + `IsActiveUserGuard`.

| Método | Ruta | Acceso | Entrada | Devuelve (`data`) |
|---|---|---|---|---|
| GET | `/` | público | — | `"Hello World!"` (plantilla) |
| POST | `/auth/login` | público | `LoginDto { email, password }` | `{ logged, user }` + cookies |
| POST | `/auth/refresh` | público (cookie `refresh_token`) | — | `{ refreshed: true }` + cookies nuevas |
| DELETE | `/auth/logout` | público | — | `{ loggedOut: true }` |
| POST | `/auth/register` | público | `RegisterUserDto` (con `patient`) | usuario creado |
| GET | `/users` | 🔒 | query `GetUsersDto { role?, status?, search? }` | `User[]` con `role: { id, role }` |
| GET | `/users/:id` | 🔒 | — | `User` con `role` (404 si no existe) |
| POST | `/users` | 🔒 | `CreateUserDto` (si `role = PACIENTE`, `patient` obligatorio) | usuario creado (`select` sin password) |
| PATCH | `/users/status/:id` | 🔒 | body `{ estado: boolean }` ⚠️ | `true` |
| GET | `/patients` | 🔒 | query `GetPatientsDto { status?, search? }` | `Patient[]` con `user: { name, lastname, email, phone, status }` |
| GET | `/patients/:id` | 🔒 | — | `Patient` con `user` (404 si no existe) |
| GET | `/services` | **público** (`@Public()`) | query `GetServicesDto { status?, search? }` | `Service[]` |
| POST | `/services` | 🔒 | `CreateServiceDto { name, durationMinutes, description, price }` | servicio creado |
| PATCH | `/services/status/:id` | 🔒 | body `{ status: boolean }` | `true` |
| GET | `/appointments` | 🔒 | query `GetAppointmentsDto { patient_id?, status?, search? }` | `Appointment[]` con `patient: { name, lastname }`, `service: { name }` |
| GET | `/appointments/:id` | 🔒 | — | registro plano de la cita |
| POST | `/appointments` | 🔒 | `CreateAppointmentDto { scheduled_at, notes, patient_id, service_id }` | cita creada (mismo shape que el listado) |

⚠️ Inconsistencia conocida: `PATCH /users/status/:id` espera `{ estado }` y `PATCH /services/status/:id` espera `{ status }` (ambos tipados inline, sin DTO). El frontend ya envía cada uno así. Si lo unificas, cambia backend y frontend en el mismo PR.

### 6.1 Convención de filtros en listados (query params)

- `status`: el cliente envía `ACTIVO` o `INACTIVO`; el DTO lo convierte a boolean con `@Transform(({ value }) => value === 'ACTIVO')`. Si no se envía, no se filtra. (`TODOS` nunca llega: el frontend lo omite.)
- `role`: valor del enum `Role` validado con `@IsEnum`.
- Citas `status`: se pasa a mayúsculas con `@Transform` y se valida contra `AppointmentStatus`.
- `search`: texto libre; el repository arma un `OR` de `contains` con `mode: 'insensitive'` sobre los campos de texto relevantes (y comparación exacta para campos numéricos/decimales, ver `ServicesRepository.getAll`).
- En el repository, un filtro ausente se pasa como `undefined` para que Prisma lo ignore (`OR: filters.search ? [...] : undefined`).
- La paginación (RNF-002) **no está implementada** aún.

### 6.2 Reglas de negocio implementadas

- **Usuarios**: email y teléfono únicos (`400` con mensaje en español). Contraseña hasheada con bcrypt antes de guardar. Si el rol es `PACIENTE`, usuario y paciente se crean en una **transacción** (`prisma.$transaction`), pasando `tx` a los repositories.
- **Servicios**: duración entre 15 y 120 minutos; nombre único.
- **Citas**: el paciente y el servicio deben existir (`404`). `durationMinutes` se toma del servicio. Se rechaza (`409`) si choca con otra cita del mismo día. `scheduled_at` debe ser futura (`@MinDate`).

---

## 7. Convenciones de código

### 7.1 Idioma

- **Todo el código en inglés**: carpetas, archivos, clases, métodos, variables, campos de BD.
- **Mensajes para el usuario final en español**: mensajes de excepciones (`new BadRequestException('...')`) y mensajes de `class-validator` en los DTOs.
- Comentarios: el proyecto usa español. Los comentarios explicativos llevan el prefijo `INDICACIÓN:` (o `INDICACION:`) y los pendientes `TODO:`. Respeta ese estilo.
- Deuda existente: algunas clases conservan nombres en español (`PacientesController`, `ServiciosController`, `ModificarCitaDto`). No las renombres como efecto colateral de otra tarea; hazlo en un `refactor` dedicado que actualice también módulos y specs.

### 7.2 Nombres de archivos y clases

Todo archivo en `kebab-case`, siguiendo el CLI de Nest:

| Elemento | Archivo | Clase / export | Ejemplo real |
|---|---|---|---|
| Module | `<dominio>.module.ts` | `PascalCaseModule` | `appointments.module.ts` → `AppointmentsModule` |
| Controller | `<dominio>.controller.ts` | `PascalCaseController` | `users.controller.ts` → `UsersController` |
| Service | `<dominio>.service.ts` | `PascalCaseService` | `patients.service.ts` → `PatientsService` |
| Repository | `repositories/<dominio>.repository.ts` | `PascalCaseRepository` | `services.repository.ts` → `ServicesRepository` |
| DTO de entrada | `dto/<verbo>-<entidad>.dto.ts` | `PascalCaseDto` | `create-appointment.dto.ts` → `CreateAppointmentDto` |
| DTO de query | `dto/get-<entidad>.dto.ts` | `Get<Entidades>Dto` | `get-users.dto.ts` → `GetUsersDto` |
| Enum | `enums/<nombre>.enum.ts` | `PascalCase` | `rol.enum.ts` → `Role` |
| Guard | `guards/<nombre>.guard.ts` | `PascalCaseGuard` | `is-active-user.guard.ts` → `IsActiveUserGuard` |
| Decorator | `decorators/<nombre>.decorator.ts` | función `PascalCase` | `public.decorator.ts` → `Public` |
| Interceptor | `interceptors/<nombre>.interceptor.ts` | `PascalCaseInterceptor` | `TransformResponseInterceptor` |
| Test | `<mismo-nombre>.spec.ts` | — | `auth.service.spec.ts` |

Nombres de dominio en **plural** (`users`, `patients`, `services`, `appointments`) tanto en carpeta como en ruta del controller (`@Controller('appointments')`).

### 7.3 Estilo

- Prettier: comillas simples, `trailingComma: "all"`. ESLint: `typescript-eslint` recommendedTypeChecked + prettier (`no-explicit-any` desactivado; `no-floating-promises` y `no-unsafe-argument` como warning).
- `tsconfig`: `strictNullChecks: true`, `noImplicitAny: false`. Propiedades de DTO con `!` (definite assignment): `email!: string;`.
- Imports: el código mezcla rutas relativas (`'../../infrastructure/...'`) y absolutas desde la raíz (`'src/infrastructure/...'`, resuelto por `baseUrl: ./`). Dentro del mismo módulo usa relativas; para `infrastructure/` cualquiera de las dos es aceptada, sé consistente dentro del archivo.
- Métodos de controller y service `async` con `return await ...`.
- Inyección por constructor con `private` (o `private readonly`).

### 7.4 DTOs y validación

- Un DTO por operación en `dto/`. Clases (no interfaces) para que `ValidationPipe` funcione.
- Para campos requeridos, el patrón del proyecto es apilar: `@IsDefined` + `@IsNotEmpty` + validador de tipo, **todos con `message` en español**:

  ```ts
  @IsDefined({ message: 'El nombre del servicio es requerido' })
  @IsNotEmpty({ message: 'El nombre del servicio es requerido' })
  @IsString({ message: 'El nombre del servicio debe ser un texto plano' })
  name!: string;
  ```

- Fechas en body: `@Type(() => Date)` + `@IsDate` (ver `CreateAppointmentDto`) o `@IsDateString` si se guarda como string ISO.
- Query params numéricos: `@Type(() => Number)` + `@IsInt`.
- Objetos anidados: `@ValidateNested()` + `@Type(() => OtroDto)`.
- Variantes de DTO: usa `@nestjs/mapped-types` (`OmitType`, `PartialType`, `PickType`) en lugar de duplicar (ej. `RegisterUserDto extends OmitType(CreateUserDto, ['role'])`).
- Campos que **asigna el servidor** (ej. `user_id`, `durationMinutes`, `status`) se declaran `@IsOptional()` con un comentario `INDICACIÓN:` aclarando que no deben venir del cliente, y el service los sobrescribe.
- Recuerda que `whitelist: true` borra cualquier propiedad sin decorador: **todo campo que quieras recibir debe tener al menos un decorador de class-validator**.

### 7.5 Repositories y Prisma

- Inyectan `PrismaService` (`constructor(private prisma: PrismaService) {}`) y se anotan con `@Injectable()`.
- Nombres de métodos: `getAll(filters?)`, `getById(id)`, `create(dto, transaction?)`, `updateStatus(id, status)`, `existById(id)` (devuelve boolean vía `count > 0`), `existByName`, etc.
- Usa `select` para devolver solo lo que el cliente necesita (sobre todo en relaciones anidadas). Nunca devuelvas `password`.
- `PrismaService` omite `user.password` en todas las consultas. Para obtenerla (solo login) usa `omit: { password: false }` como `UsersRepository.getUserByEmailWithPassword`.
- Soporte de transacciones: los métodos de escritura que puedan participar en una transacción aceptan un parámetro opcional y lo usan así:

  ```ts
  async create(dto: CreatePatientDto, transaction?: Prisma.TransactionClient) {
      const client = transaction ?? this.prisma;
      return await client.patient.create({ data: { ... } });
  }
  ```

- Mapea explícitamente los campos en `data: { ... }` en lugar de esparcir el DTO completo.

### 7.6 Services y errores

- Lanza excepciones HTTP de `@nestjs/common` con mensaje en español: `NotFoundException` (no existe), `BadRequestException` (regla de negocio/duplicado), `ConflictException` (choque de horario), `UnauthorizedException` (auth), `UnprocessableEntityException` (fallo inesperado al guardar).
- Valida existencia antes de actualizar (`if (!await repo.getById(id)) throw new NotFoundException(...)`).
- Cuando el shape de la respuesta difiere del de Prisma, el service lo arma explícitamente (ver `AppointmentsService.getAllAppointments`, aplana `patient.user` → `patient`). Mantén ese shape sincronizado con `features/<dominio>/types/<entidad>.response.ts` del frontend.
- Usa `Promise.all` para consultas independientes.

### 7.7 Controllers

```ts
@UseGuards(AuthGuard, IsActiveUserGuard)
@Controller('appointments')
export class AppointmentsController {
    constructor(private appointmentsService: AppointmentsService) { }

    @Get()
    async getAll(@Query() filters: GetAppointmentsDto) {
        return await this.appointmentsService.getAllAppointments(filters);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) { ... }
}
```

- Guards a nivel de clase; endpoints abiertos con `@Public()` en el método.
- IDs de ruta siempre con `ParseIntPipe`.
- Cambios de estado: `PATCH /<dominio>/status/:id`.
- Para tocar cookies usa `@Res({ passthrough: true }) response: Response` (así el interceptor sigue funcionando) e importa los tipos con `import type { Request, Response } from 'express'`.

---

## 8. Receta: agregar un módulo de dominio nuevo

Ejemplo: `faqs` (tabla `FrequentlyAskedQuestion` ya existe).

1. Si hace falta, ajusta `prisma/schema.prisma` y crea la migración (§5.2).
2. Crea `src/modules/faqs/` con:
   - `dto/create-faq.dto.ts`, `dto/get-faqs.dto.ts` (y `update-faq.dto.ts` con `PartialType` si aplica).
   - `repositories/faqs.repository.ts` (`@Injectable`, inyecta `PrismaService`).
   - `faqs.service.ts` (inyecta `FaqsRepository`, reglas + excepciones en español).
   - `faqs.controller.ts` (`@UseGuards(AuthGuard, IsActiveUserGuard)`, `@Controller('faqs')`, `@Public()` en lecturas públicas).
   - `faqs.module.ts`:

     ```ts
     @Module({
       imports: [SecurityModule],
       controllers: [FaqsController],
       providers: [FaqsService, FaqsRepository],
       exports: [FaqsRepository], // solo si otro módulo lo necesita
     })
     export class FaqsModule {}
     ```
3. Registra el módulo en `imports` de `src/app.module.ts`.
4. Asegúrate de que cada endpoint exitoso devuelva un valor truthy (§4.3).
5. Verifica: `npx tsc --noEmit --incremental false -p tsconfig.json`, levanta `npm run start:dev` y prueba con curl usando cookies (ver §9).
6. Documenta el endpoint en la tabla del §6 de este archivo y avisa/actualiza los tipos `*.response.ts` del frontend.

---

## 9. Probar la API manualmente

```bash
# Login (guarda cookies)
curl -s -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"administrador@gmail.com","password":"12345678"}'

# Endpoint protegido
curl -s -b cookies.txt http://localhost:3000/users

# Refresh (rota los tokens)
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/refresh

# Logout
curl -s -b cookies.txt -X DELETE http://localhost:3000/auth/logout
```

Borra `cookies.txt` al terminar; no lo commitees.

---

## 10. Deuda técnica y trampas conocidas

Tenlas en cuenta para no "arreglarlas" por accidente dentro de otra tarea ni sorprenderte con ellas:

- **Respuestas de error sin envolver**: no hay exception filter; el contrato de error es el de Nest (`statusCode`, `message`, `error`). Hay un pendiente explícito para definir un contrato de errores.
- **Sin autorización por rol** (§4.4).
- **Sin paginación** en listados (RNF-002).
- **Zonas horarias en citas**: `scheduled_at` se guarda en UTC (el frontend envía ISO). `AppointmentsRepository.getAppointmentsByDate` calcula el inicio/fin del día con la hora local del servidor (`setHours`), por lo que el "día" depende del TZ del proceso.
- **`existsScheduleConflict`** (`appointments.service.ts`) muta `appointment.scheduled_at` dentro del bucle y compara con rangos inclusivos (una cita que empieza justo cuando termina otra se considera conflicto). Además solo revisa si el inicio o el fin de la cita nueva caen dentro de una existente, así que **no detecta** una cita nueva que envuelve por completo a otra. Si tocas esta lógica, agrega tests.
- **`createAppointment` no valida** que el servicio esté activo ni que el horario esté dentro de `AvailableTimeSlots`.
- **`GET /appointments/:id`** devuelve el registro plano (sin `patient`/`service`), a diferencia del listado.
- `CORS` y cookies (`secure: false`) están pensados para desarrollo local; para producción hay que parametrizarlos (`FRONTEND_URL`, `ON_PRODUCTION` existen en `.env` pero no se leen).
- `PrismaModule` aparece dos veces en `AppModule.imports` (inofensivo).
- `appointments/enums/appointment-status.enum.ts` y `appointments/dto/update-appointment.dto.ts` (`ModificarCitaDto`, en español y con campos antiguos) están obsoletos.
- `package.json` define el seed con `ts-node` y `prisma.config.ts` con `tsx`; Prisma 7 usa el de `prisma.config.ts`.
- Specs desactualizadas (ver §2).

---

## 11. Flujo de trabajo con git

- Rama principal: `master`. Trabaja en ramas: `feature/<tema>`, `refactor/<tema>`, `fix/<tema>` (ej. `feature/refresh-token`, `refactor/reorganize-into-feature-folder-architecture`).
- Commits estilo Conventional Commits con alcance `<proyecto>/<área>`, en inglés y en minúsculas:

  ```
  feat(backend/auth): implement refresh token logic
  refactor(backend/patients): filter patients by status and search
  fix(backend/services): fix description max lenght validation in create-service.dto
  feat(backend/prisma): add RefreshToken table
  ```

  Tipos usados: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`. Si un cambio toca ambos proyectos: `refactor(frontend,backend/appointments): ...`, aunque lo habitual es un commit por proyecto (primero backend, luego el frontend que lo consume).
- Un commit = un cambio lógico. No mezcles refactors de nombres con features.

---

## 12. Checklist antes de dar una tarea por terminada

- [ ] Respeté las capas Controller → Service → Repository.
- [ ] Código en inglés; mensajes de excepciones y validaciones en español.
- [ ] Archivos en `kebab-case` con el sufijo correcto; campos nuevos en `snake_case`.
- [ ] Cada campo del body/query tiene decoradores de `class-validator` (si no, `whitelist` lo borra).
- [ ] Los endpoints exitosos devuelven valores truthy; los "no encontrado" lanzan `NotFoundException`.
- [ ] No expongo `password` ni hashes de tokens.
- [ ] Endpoints nuevos protegidos con `@UseGuards(AuthGuard, IsActiveUserGuard)` salvo que sean públicos a propósito (`@Public()`).
- [ ] Si cambié `schema.prisma`, creé una migración nueva (sin editar las anteriores) y revisé el seed.
- [ ] `npx tsc --noEmit --incremental false -p tsconfig.json` no agrega errores nuevos respecto a la línea base.
- [ ] Si cambió el shape de una respuesta, el frontend (`*.response.ts` / mappers) está alineado.
- [ ] Actualicé este documento si cambié arquitectura, endpoints o convenciones.
