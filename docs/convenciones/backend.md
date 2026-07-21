# Estructura y convenciones — Backend (NestJS)

> Este documento describe **cómo está construido actualmente** el backend de Dentissa: organización de carpetas y convención de nombres. Complementa a `CONTRIBUTING.md` con el detalle específico de este proyecto. El backend sigue las convenciones estándar de NestJS salvo donde se indique explícitamente lo contrario.

---

## 1. Estructura de carpetas

```
backend-consultorio-dental/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts                  # Crea los usuarios iniciales (ej. administrador)
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── infrastructure/          # Piezas compartidas por toda la app, separadas por responsabilidad
│   │   ├── common/              # Interceptors y excepciones que normalizan toda respuesta
│   │   │                        # del backend al formato { success, message, data }
│   │   ├── prisma/              # PrismaModule y PrismaService
│   │   └── security/            # Guards y decoradores (autenticación/autorización)
│   │
│   └── modules/                 # Módulos de dominio de la aplicación
│       ├── appointment/
│       ├── auth/
│       ├── users/
│       ├── patients/
│       └── services/
│                                  # ⚠️ Módulos pendientes por agregar conforme avance
│                                  # el proyecto: consultations, offers, notifications,
│                                  # faqs, dental-chart (odontograma)
```

> No existe una capa explícita de "entidades" en la estructura de carpetas: **los modelos de Prisma (`schema.prisma`) cumplen ese rol de forma implícita**. No se duplican como clases de entidad adicionales dentro de `src/`.

---

## 2. Estructura interna de un módulo de dominio

Cada carpeta dentro de `modules/` sigue esta composición (no todos los módulos tienen las tres carpetas — solo donde aplica):

```
modules/appointment/
├── dto/                    # DTOs de entrada, validados con class-validator
│   ├── create-appointment.dto.ts
│   └── update-appointment.dto.ts
├── repositories/            # Acceso a datos: métodos que hablan directo con Prisma
│   └── appointment.repository.ts
├── enums/                   # Solo en los módulos que lo requieren (ej. users/enums/role.enum.ts)
├── appointment.controller.ts
├── appointment.service.ts
└── appointment.module.ts
```

### Por qué existe la carpeta `repositories/` (patrón Repository)

NestJS con Prisma permite llamar a `this.prisma.appointment.findMany(...)` directamente desde el `service`. Aquí se agrega una capa intermedia (`repository`) a propósito: el `service` contiene la **lógica de negocio** (ej. "validar que el horario no choque con otra cita"), mientras que el `repository` contiene únicamente **las consultas a la base de datos**. Esto separa dos responsabilidades que cambian por razones distintas: si mañana cambia una regla de negocio, se toca el `service`; si cambia cómo se consulta la base de datos (ej. una optimización de query), se toca el `repository` sin arriesgar la lógica de negocio. También hace que el `service` sea más fácil de testear unitariamente, mockeando el `repository` en vez de mockear Prisma directamente.

---

## 3. Convención de nombres de archivos

**Regla general: todos los nombres de archivo están en `kebab-case`**, siguiendo la convención estándar del CLI de NestJS.

| Elemento | Archivo | Clase | Ejemplo |
|---|---|---|---|
| Module | `kebab-case.module.ts` | `PascalCaseModule` | `appointment.module.ts` → `AppointmentModule` |
| Controller | `kebab-case.controller.ts` | `PascalCaseController` | `appointment.controller.ts` → `AppointmentController` |
| Service | `kebab-case.service.ts` | `PascalCaseService` | `appointment.service.ts` → `AppointmentService` |
| Repository | `kebab-case.repository.ts` | `PascalCaseRepository` | `appointment.repository.ts` → `AppointmentRepository` |
| DTO | `verbo-entidad.dto.ts` | `PascalCaseDto` | `create-appointment.dto.ts` → `CreateAppointmentDto` |
| Enum | `kebab-case.enum.ts` | `PascalCase` | `role.enum.ts` → `Role` |
| Guard | `kebab-case.guard.ts` | `PascalCaseGuard` | `roles.guard.ts` → `RolesGuard` |
| Decorator | `kebab-case.decorator.ts` | `camelCase` (función) | `current-user.decorator.ts` → `CurrentUser` |
| Interceptor | `kebab-case.interceptor.ts` | `PascalCaseInterceptor` | `response.interceptor.ts` → `ResponseInterceptor` |
| Test unitario | `mismo-nombre.spec.ts` | — | `appointment.service.spec.ts` |

---

## 4. Idioma del código

- **Todo el código está en inglés**: nombres de carpetas, archivos, clases, variables, funciones, métodos.
- **Excepción explícita:** los mensajes de respuesta al cliente (mensajes de error/éxito, mensajes de validación de `class-validator` en los DTOs) están en **español**, porque son lo que eventualmente llega a la interfaz que ve el usuario final.

**Ejemplo — `create-appointment.dto.ts`:**

```ts
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString({}, { message: 'La fecha y hora programada no es válida' })
  scheduled_at: string;

  @IsInt({ message: 'El paciente es requerido' })
  patient_id: number;

  @IsInt({ message: 'El servicio es requerido' })
  service_id: number;

  @IsOptional()
  @IsString({ message: 'El motivo debe ser texto' })
  reason?: string;
}
```

---

## 5. Convención de base de datos (Prisma / PostgreSQL)

- Nombres de tablas y columnas: **inglés** y **`snake_case`**.
- Los nombres de tabla se mapean explícitamente con `@@map(...)` y las columnas con `@map(...)` cuando el nombre del campo en el modelo de Prisma no coincide 1:1 con el de la columna.

**Decisión confirmada:** los campos del modelo de Prisma se declaran directamente en `snake_case`, igual que la columna de base de datos. No se usa `@map` para traducir nombres de campo, porque el nombre del campo y el de la columna son el mismo. Esto significa que el objeto que devuelve Prisma Client ya llega en `snake_case`, sin necesidad de una capa de traducción antes de responder al cliente — el mismo shape viaja desde la base de datos hasta el DTO de respuesta que consume el frontend.

**Ejemplo:**

```prisma
model Appointment {
  id                Int      @id @default(autoincrement())
  scheduled_at      DateTime
  duration_minutes  Int
  status            String
  notes             String?
  reason            String?
  patient_id        Int
  service_id        Int

  @@map("appointments")
}
```

> `@@map("appointments")` se mantiene porque el nombre del **modelo** (`Appointment`, singular `PascalCase`, convención de Prisma) es distinto al nombre de la **tabla** (`appointments`, plural `snake_case`, convención de PostgreSQL). Los nombres de *campo* no necesitan `@map` porque ya coinciden con el de columna.

> 📄 Esta decisión debe registrarse como un ADR (`docs/adr/000X-nomenclatura-snake-case-end-to-end.md`), documentando el trade-off: se prioriza consistencia end-to-end (BD → Prisma → DTO → frontend) sobre la convención idiomática de `camelCase` en TypeScript.