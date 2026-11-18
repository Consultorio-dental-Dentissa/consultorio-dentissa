# Frontend — Dentissa (`frontend-consultorio-dental/`)

Guía de trabajo para personas y agentes. Describe **cómo está construido hoy** el frontend, las reglas que hay que respetar y cómo agregar código nuevo siguiendo los patrones existentes. Todas las rutas son relativas a `frontend-consultorio-dental/` salvo que se indique lo contrario.

> Contexto funcional: `../docs/requerimientos/requerimientos.md` (RF/RNF) y prototipos de diseño en `../docs/prototipos/` (`admin/*.dc.html` para el panel, `Sitio Web`, `Iniciar sesion`, `Registrarse` para lo público). La API que consume vive en `../backend-consultorio-dental/` y tiene su propia guía.

---

## 1. Resumen rápido

| Tema | Valor |
|---|---|
| Qué es | SPA con dos zonas: **sitio público** (landing, login, registro) y **panel privado** de administración del consultorio (dashboard, usuarios, pacientes, citas, servicios, consultas) |
| Framework | React 19 + TypeScript 5.9 + Vite 7 |
| React Compiler | Activado (`babel-plugin-react-compiler` en `vite.config.ts`) |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`), tema y tokens en `src/index.css` |
| Componentes base | shadcn/ui (estilo `radix-nova`, sobre `radix-ui`) en `src/components/ui/` |
| Estado del servidor | TanStack Query v5 (`@tanstack/react-query`) + Devtools en desarrollo |
| Tablas | TanStack Table v8 vía el componente compartido `DataTable` |
| Formularios | `react-hook-form` + `zod` v4 + `@hookform/resolvers/zod` |
| HTTP | `axios` centralizado en `src/services/api.ts` (`withCredentials: true`) |
| Rutas | `react-router-dom` v7 (modo declarativo: `BrowserRouter` + `Routes`) |
| Notificaciones | `react-hot-toast` (`<Toaster position="top-right" />` en `App.tsx`) |
| Iconos | `lucide-react` (preferido) y `react-icons` |
| Fuente | Plus Jakarta Sans (`@fontsource`), importada en `main.tsx` |
| Alias | `@/` → `src/` |

Dependencias instaladas pero **sin uso** en el código: `sweetalert2`, `js-cookie`, `react-react`. No las uses para código nuevo sin acordarlo (los avisos se hacen con `react-hot-toast`).

---

## 2. Comandos

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173 (el backend solo acepta CORS desde aquí)
npm run typecheck    # tsc --noEmit -p tsconfig.app.json
npm run lint         # eslint .
npm run build        # tsc -b && vite build
npm run preview      # sirve el build
```

Variable de entorno (`.env`): `VITE_API_URL` — URL base del backend (en local, `http://localhost:3000`). Se lee en `src/services/api.ts` con `import.meta.env.VITE_API_URL`.

> **Línea base actual:** `npm run typecheck` falla con ~11 errores preexistentes (imports/variables sin usar en `select.component.tsx`, `use-services.ts`, `use-users.ts`, `consultations-page.tsx`; `useAppointments('patient_id=...')` recibiendo un string en `patient-profile-page.tsx` y `appointment-small-table.component.tsx`; `status: string` asignado a `STATUS_APPOINTMENT` en `appointment.mapper.ts`). Por eso `npm run build` también falla hoy. **Regla:** tu cambio no debe agregar errores nuevos; compara la salida de `typecheck` antes y después.

Para probar con datos reales, el backend debe estar corriendo (`npm run start:dev` en `../backend-consultorio-dental`). Usuario de desarrollo: `administrador@gmail.com` / `12345678`.

---

## 3. Estructura de carpetas

```
src/
├── main.tsx                 # createRoot + StrictMode + fuentes
├── App.tsx                  # QueryClientProvider → Toaster → AuthProvider → Router (+ Devtools en DEV)
├── index.css                # Tailwind v4, tokens de tema (@theme inline), scrollbar, estilos base
├── assets/                  # Imágenes (logo, foto del consultorio)
│
├── features/                # Un módulo por dominio de negocio
│   ├── appointments/
│   ├── auth/
│   ├── patients/
│   ├── services/            # dominio "servicios dentales" (no confundir con la capa services/)
│   └── users/
│       ├── components/      # UI que conoce el dominio: tablas, columnas, formularios, modales, schemas zod
│       ├── hooks/           # Hooks de TanStack Query (useX, useCreateX, useUpdateXStatus)
│       ├── services/        # Funciones que llaman a la API usando @/services/api
│       └── types/           # model, response, dto, mapper, filters, enum
│
├── components/
│   ├── shared/              # Componentes reutilizables entre dominios (sufijo .component.tsx)
│   └── ui/                  # shadcn/ui (generados por su CLI; convención propia de nombres)
│
├── hooks/                   # Hooks sin dominio: use-debounce, use-debounced-search, use-mobile
├── layouts/                 # private-layout.tsx (panel), public-layout.tsx (sitio)
├── pages/
│   ├── private/             # Vistas del panel (usan PrivateLayout)
│   └── public/              # Vistas públicas (usan PublicLayout)
├── router/router.tsx        # Definición de rutas
├── services/api.ts          # Cliente axios + interceptores + helpers get/post/put/patch/deleteR
├── types/api.response.ts    # ApiResponse<T> genérico
├── lib/utils.ts             # cn() (clsx + tailwind-merge), usado por shadcn
└── utils/formatters.ts      # Formateadores sin dominio (fechas, teléfonos, duración, capitalización)
```

> Nota: `../docs/convenciones/frontend.md` menciona `components/common/`; la carpeta real es **`components/shared/`**. `components.json` apunta el CSS de shadcn a `src/styles/globals.css`, pero el archivo real es **`src/index.css`** (tenlo en cuenta si usas `npx shadcn add`, revisa dónde inserta variables).

### 3.1 Dónde va cada archivo nuevo

- ¿Conoce el modelo de negocio de un dominio (sabe qué es una cita, un paciente)? → `features/<dominio>/...`
- ¿Es genérico y lo usarían 2+ dominios (input, select, modal, tabla, tarjeta)? → `components/shared/`
- ¿Es un primitivo de shadcn? → `components/ui/` (agrégalo con la CLI de shadcn, no lo escribas a mano)
- ¿Es una vista asociada a una ruta? → `pages/private/` o `pages/public/`, y regístrala en `router/router.tsx`.
- ¿Hook sin dominio? → `src/hooks/`. ¿Función pura de formato? → `src/utils/formatters.ts`.
- Un dominio nunca debe meter lógica de otro dominio en sus carpetas; puede **importar** hooks/componentes de otro dominio (ej. `create-appointment-form` usa `usePatients` y `useServices`).

---

## 4. Arquitectura y flujo de datos

### 4.1 Capas

```
Page (pages/)                  → compone la vista, guarda estado de filtros (status, search), layout de la página
  │
  ▼
Feature component              → tabla / lista / modal / formulario autocontenido del dominio
(features/<d>/components)
  │
  ▼
Hook (features/<d>/hooks)      → useQuery / useMutation; define queryKey e invalidaciones
  │
  ▼
Service (features/<d>/services)→ arma la URL y query params, llama a get/post/patch… y aplica el mapper
  │
  ▼
api.ts (src/services)          → axios: baseURL, cookies, desempaqueta ApiResponse, refresh automático, errores
  │
  ▼
Backend NestJS
```

Reglas:

- **Los componentes nunca llaman a axios ni a `api.ts` directamente**: usan hooks del dominio.
- **Los hooks no arman URLs**: delegan en la función del service.
- **Los services siempre devuelven modelos** (`Patient`, `Service`...), nunca el `Response` crudo: aplican el mapper.
- Los componentes de presentación genéricos (`components/shared`) no conocen hooks de dominio (excepción existente: `span.component.tsx` importa enums de citas y roles para elegir variantes de badge).

### 4.2 Tipos por dominio (`features/<d>/types/`)

| Archivo | Qué contiene | Ejemplo |
|---|---|---|
| `<entidad>.response.ts` | Interface **exacta** de lo que devuelve el backend en `data` (fechas como `string`, relaciones anidadas) | `PatientResponse { id, address, birth_date: string, user: { name, ... } }` |
| `<entidad>.model.ts` | Interface que usa la UI (aplanada, fechas como `Date`, campos derivados) | `Patient { id, name, lastname, birth_date: Date, status, ... }` |
| `<entidad>.mapper.ts` | Función `Response → Model` | `patientMap(res): Patient` (aplana `user`, convierte fechas); `AppointmentMap` calcula `scheduled_at_end` |
| `create-<entidad>.dto.ts` | Interface del body que se envía al backend | `CreateAppointmentDto { scheduled_at: string, notes, patient_id, service_id }` |
| `<entidad>.filters.ts` | Filtros que acepta el listado | `PatientFilters { status?: string; search?: string }` |
| `<nombre>.enum.ts` | "Enums" como objeto `as const` + tipo derivado | `Role`, `STATUS_APPOINTMENT` |

- Propiedades en **`snake_case`** igual que el backend (`birth_date`, `emergency_phone`, `scheduled_at`, `patient_id`). Excepción heredada del backend: `durationMinutes`.
- Si el backend cambia el shape de una respuesta, actualiza `*.response.ts` y el mapper; el model idealmente no cambia.

### 4.3 Cliente HTTP (`src/services/api.ts`)

- Instancia axios con `baseURL: VITE_API_URL` y `withCredentials: true` (los tokens viajan en cookies `httpOnly`; el frontend **nunca** lee ni guarda tokens).
- Helpers exportados: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `deleteR<T>` — devuelven `Promise<ApiResponse<T>>`; el valor útil está en `.data`.
- **Interceptor de éxito:** exige que el backend responda `{ success: true, data: <truthy> }`. Si `data` es falsy (`null`, `false`, `0`, `""`) lanza `Error('Hubo un problema inesperado. Espera porfavor')`. Por eso el backend siempre devuelve objetos, arreglos o `true`.
- **Interceptor de error:**
  - Ante un `401` (que no sea de `/auth/login` ni `/auth/refresh`) intenta **una vez** `POST /auth/refresh` y reintenta la petición original. Peticiones concurrentes comparten la misma promesa de refresh.
  - Si el refresh falla, dispara `window.dispatchEvent(new Event('auth:session-expired'))`; `AuthProvider` lo escucha y limpia la sesión, y `PrivateLayout` redirige a `/login`.
  - Si el backend mandó `message`, lanza `new Error(message)` (los mensajes vienen en español desde el backend y se muestran tal cual en toasts). Si no, `Error('Error al comunicarse con el servidor')`.
  - Cuando el error viene de validación del backend, `message` es un arreglo; `new Error(array)` lo convierte a texto separado por comas.

Consecuencia práctica: en los componentes, el manejo de error estándar es `onError: (error) => toast.error(error.message)`.

### 4.4 Autenticación en el cliente

- `features/auth/context/auth-context.ts` define el contexto; `auth-context-provider.tsx` exporta `AuthProvider` y el hook `useAuth()` → `{ user, isAuthenticated, loading, saveUserData, logOut }`.
- Tras login exitoso, `LoginForm` llama `saveUserData(data.user)` (guarda en estado y en `localStorage` las claves `user` e `isAuthenticated`) y navega a `/dashboard`.
- Al montar, el provider rehidrata `user` desde `localStorage`. `localStorage` solo guarda datos de perfil para la UI; **la sesión real es la cookie**.
- `logOut()` limpia estado y `localStorage` y llama `DELETE /auth/logout`.
- `PrivateLayout` protege todas las rutas privadas: muestra spinner mientras `loading`, y si no hay usuario redirige a `/login`.
- **No hay control por rol en el frontend** todavía (el `user.role` es `'ADMINISTRADOR' | 'ASISTENTE' | 'PACIENTE'`; todos ven el mismo panel).

### 4.5 TanStack Query

- Un único `QueryClient` en `App.tsx`, con opciones por defecto.
- **Query keys** (respétalas para que las invalidaciones funcionen):

  | Hook | queryKey |
  |---|---|
  | `useAppointments(filters?)` | `['appointments', filters]` |
  | `usePatients(filters?)` | `['patients', filters]` |
  | `useActualPatient(id)` | `['patient', id]` |
  | `useServices(filters?)` | `['services', filters]` |
  | `useUsers(filters?)` | `['users', filters]` |

  Patrón: `['<dominio-en-plural>', filters]`. **Los filtros siempre forman parte de la key.**
- Mutaciones de creación: `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['<dominio>'] })` (invalida todas las combinaciones de filtros).
- Mutaciones de cambio de estado (switch activo/inactivo): actualizan la caché sin refetch con `queryClient.setQueriesData<Model[]>({ queryKey: ['<dominio>'] }, prev => prev?.map(...))` — plural `setQueriesData` para tocar todas las combinaciones de filtros.
- Nombres: `useX` (lista), `useActualX(id)` (detalle), `useCreateX`, `useUpdateXStatus`. Los hooks de mutación de un dominio viven en el mismo archivo `use-<dominio>.ts`.
- Los callbacks de UI (toast, cerrar modal) van en el `mutate(data, { onSuccess, onError })` del componente; la invalidación de caché va en el hook.

### 4.6 Rutas (`src/router/router.tsx`)

| Layout | Ruta | Página |
|---|---|---|
| Public | `/` | `home-page.tsx` |
| Public | `/sobre-nosotros` | `about-us-page.tsx` (contenido de plantilla, ver §9) |
| Public | `/nuestros-servicios` | `public-services-page.tsx` (contenido de plantilla, ver §9) |
| Public | `/login` | `login-page.tsx` |
| Public | `/registrate` | `sign-up-page.tsx` |
| Private | `/dashboard` | `dashboard-page.tsx` |
| Private | `/usuarios` | `users-page.tsx` |
| Private | `/pacientes` | `patients-page.tsx` |
| Private | `/pacientes/:id` | `patient-profile-page.tsx` |
| Private | `/servicios` | `services-page.tsx` |
| Private | `/citas` | `appointments-page.tsx` |
| Private | `/consultas` | `consultations-page.tsx` (vacía) |

- **Las URLs están en español** (son visibles para el usuario); el código y los nombres de archivo en inglés.
- El menú lateral (`components/shared/sidebar.component.tsx`) tiene los arrays `businessItems` y `publicityItems`. Ya enlaza `/preguntas`, `/ofertas`, `/notificaciones`, que **aún no tienen ruta**. Al crear una página nueva del panel: agrégala en el router dentro del `<Route element={<PrivateLayout />}>` y, si corresponde, en el sidebar.
- Navegación interna con `<Link>` / `useNavigate()` (evita `<a href>` para rutas internas: recarga la app).

---

## 5. Patrones de componentes (seguir estos al crear código nuevo)

### 5.1 Componentes autocontenidos

La dirección reciente del proyecto (ver commits `refactor(...): make ... self contained`) es que cada pieza se encargue de lo suyo:

- **Tabla de dominio** — `XTable({ filters })`: llama a su propio hook, maneja `isLoading` (`<Spinner />`) y vacío (`<p>No se encontraron ...</p>`), y renderiza `<DataTable columns={...} data={...} />`. Ej.: `PatientsTable`, `ServicesTable`, `UsersTable`, `AppointmentSmallTable({ patientId })`.
- **Columnas** — `x-columns.component.tsx` exporta `getXColumns = (): ColumnDef<Model>[] => [...]`. Headers en MAYÚSCULAS en español (`'NOMBRE'`, `'ESTADO'`). En la tabla se memorizan con `useMemo(() => getXColumns(), [])`.
- **Modal de creación** — `CreateXModal()`: guarda su propio `open` con `useState`, pasa el botón disparador por la prop `trigger` del `Modal` compartido y renderiza `CreateXForm` con `onSubmit`/`onCancel` que cierran el modal. La página solo hace `<CreateXModal />`.
- **Formulario** — `CreateXForm({ onSubmit, onCancel })`: usa su propia mutación, construye el DTO, muestra toasts, deshabilita el botón con `isPending`.
- **Switch de estado** — `XStatusSwitch({ x })`: usa `useUpdateXStatus` y muestra toast.
- **Página** — compone: `PageTitle`, tarjetas `CardDashboard`, filtros (`SelectActiveStatus`, selects de dominio, `SearchInput`) y la tabla/lista pasándole `filters`.

### 5.2 Filtros y búsqueda

```tsx
const [status, setStatus] = useState<string | null>(null);
const { search, setSearch, debouncedSearch } = useDebouncedSearch(); // 300 ms

<SelectActiveStatus value={status} onChange={setStatus} />
<SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ..." />

<PatientsTable filters={{ status: status ?? undefined, search: debouncedSearch }} />
```

- Valores de filtro de estado: `'TODOS' | 'ACTIVO' | 'INACTIVO'`; en citas, los valores de `STATUS_APPOINTMENT`; en usuarios además `role`.
- `'TODOS'` significa "sin filtro": la función del service **no** lo envía.
- El service construye la query con `URLSearchParams` y solo agrega parámetros con valor:

  ```ts
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const queryString = params.toString();
  const url = queryString ? `/patients?${queryString}` : '/patients';
  ```
- Las tarjetas de totales de la página usan el hook **sin filtros** (ej. `usePatients()`), separado de la tabla filtrada.

### 5.3 Formularios (react-hook-form + zod)

- El schema vive en `features/<d>/components/<entidad>.schema.ts` y exporta los tipos:

  ```ts
  export const CreateServiceSchema = z.object({ ... }).superRefine((data, ctx) => { ... });
  export type ServiceInputData  = z.input<typeof CreateServiceSchema>;
  export type ServiceOutputData = z.output<typeof CreateServiceSchema>;
  ```
- Usa `z.input`/`z.output` + `useForm<Input, any, Output>` cuando haya coerciones (`z.coerce.number<unknown>()`, `z.coerce.number<string>()`); `z.infer` basta si input = output.
- Configuración: `useForm({ resolver: zodResolver(Schema), mode: 'onChange' })`.
- Zod v4: `z.iso.date(...)`, `z.iso.time(...)`, `z.coerce.number<...>(...)`. Validaciones cruzadas en `.superRefine` con `ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...], message })`.
- **Mensajes de validación en español.** Replica en zod las reglas del backend (longitudes, rangos) para avisar antes de enviar; el backend sigue siendo la fuente de verdad.
- Campos con los componentes compartidos de `components/shared/input.component.tsx`:
  - `InputForm` / `TextareaForm` con `registration={register('campo')}` y `error={errors.campo?.message}`.
  - Selects con `Controller` + `SelectForm` (`DATA: { value, data }[]`, `onChange={field.onChange}`, `value={field.value}`).
  - Campos anidados: `register('patient.address')`, `errors.patient?.address?.message`.
- En `onSubmit`, transforma la salida del form al DTO del backend (ej. fecha + hora → `new Date(\`${date}T${time}:00\`).toISOString()`; horas + minutos → `durationMinutes`), y llama `mutation.mutate(dto, { onSuccess, onError })`.
- Botón de envío: `variant="primary"`, `disabled={mutation.isPending}` y `<Spinner />` mientras está pendiente. Botón cancelar: `variant="secondary"` y `type="button"`.
- `LoginForm` y `SignUpForm` usan validación nativa de react-hook-form (`register('x', { required, pattern, ... })`) en lugar de zod; para formularios nuevos usa zod.

### 5.4 Componentes compartidos disponibles (`components/shared/`)

| Componente | Uso |
|---|---|
| `DataTable<TData, TValue>({ columns, data })` | Tabla genérica con TanStack Table; muestra "No se encontrarón resultados." si está vacía |
| `Modal({ open, onClose, title, description, trigger, children })` | Envoltura de `Dialog` de shadcn |
| `InputForm`, `TextareaForm` (con contador), `SelectForm`, `SearchInput` | Campos de formulario y búsqueda |
| `SelectComponent` | Select genérico (`data: SelectData[]`) |
| `SelectActiveStatus({ value, onChange })` | Filtro Todos/Activo/No activo |
| `CardDashboard({ title, icon, data })` | Tarjeta de métrica (`data` es string) |
| `PageTitle({ titulo, subtitulo })` | Encabezado de página (props en español, heredado) |
| `StatusSpan({ status })` | Badge según estado de cita, rol o `"true"/"false"` |
| `ActiveSpan({ status: boolean })` | Badge Activo / No activo |
| `ErrorSpan({ message })` | Texto de error de formulario |
| `SidebarApp`, `Header` | Navegación del panel (usados por `PrivateLayout`) |
| `EmptyTable` | Legacy (no usado, clases CSS inexistentes); no lo uses |

Variantes personalizadas en shadcn:

- `Button` (`components/ui/button.tsx`): `variant` = `default | outline | secondary | ghost | selectedGhost | destructive | link | primary | login`; `size` incluye un `great` personalizado. Acción principal del panel → `primary` (rosa). Login/registro → `variant="login" size="great"`.
- `Badge` (`components/ui/badge.tsx`): además de las de shadcn, `success | base | warning | primary | pending | completed | canceled | confirmed | rescheduled | admin | assistant | patient`.

Si modificas un componente de `components/ui/`, hazlo con cuidado: son compartidos por toda la app y regenerarlos con la CLI sobrescribe los cambios.

### 5.5 Estilos

- Tailwind utility classes directamente en `className`. Para clases condicionales usa template strings (patrón actual) o `cn()` de `@/lib/utils`.
- Paleta (RNF-006): blancos, grises claros y **rosados** (derivados de `#f2b0a6`). En la práctica: `rose-300/400`, `#fda4af`, `#fbeeec`, `#c0685c`, fondos `neutral-100`/`gray-50`, texto secundario `zinc-500`/`gray-500`. El sidebar usa `--color-sidebar: #fb7185`.
- Tokens propios en `@theme inline` de `src/index.css` (`--shadow-card`, `--color-app-*`). Si necesitas un color/sombra nueva reutilizable, agrégala ahí en vez de repetir hex.
- El layout es de escritorio (anchos con `w-[30%]`, `grid-cols-[...]`); no hay diseño responsive formal todavía.
- Todo el texto visible está en **español**.

---

## 6. Convenciones de nombres

### 6.1 Archivos

Regla general: **`kebab-case`** con sufijo por tipo.

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Componente | `<nombre>.component.tsx` | `appointment-card.component.tsx` |
| Schema zod | `<entidad>.schema.ts` (en `components/`) | `service.schema.ts` |
| Hook | `use-<nombre>.ts` | `use-appointments.ts`, `use-debounced-search.ts` |
| Service | `<dominio>.service.ts` | `patients.service.ts` |
| Model / Response / DTO / Mapper / Filters / Enum | `<entidad>.model.ts`, `.response.ts`, `create-<entidad>.dto.ts`, `.mapper.ts`, `.filters.ts`, `.enum.ts` | `user.model.ts`, `create-user.dto.ts`, `status-appointment.enum.ts` |
| Página | `<nombre>-page.tsx` | `patients-page.tsx` |
| Layout | `<nombre>-layout.tsx` | `private-layout.tsx` |
| shadcn/ui | nombre que genera la CLI | `button.tsx`, `dialog.tsx` |

Excepciones heredadas (no las copies, no las renombres de forma aislada): `LoginForm.component.tsx`, `SignUpForm.component.tsx` (PascalCase), `user-status-switch.tsx` (sin sufijo), `users-colums.component.tsx` (typo), `rol.enum.ts`.

> `../docs/convenciones/frontend.md` documenta una migración futura de hooks a `<nombre>.hook.ts` y páginas a `<nombre>.page.tsx`. Hasta que se haga esa migración formal en una rama `refactor/` propia, **sigue el patrón vigente** (`use-*.ts`, `*-page.tsx`) para no dejar el proyecto en un estado mixto.

### 6.2 Dentro del código

- Componentes, interfaces y tipos: `PascalCase`. Funciones y variables: `camelCase`. Props: `interface XProps` o tipado inline `{ filters }: { filters?: XFilters }`.
- Exportaciones **nombradas** para componentes, hooks y services; `export default` solo para páginas y layouts (así las importa el router).
- Mappers: `xMap` (camelCase; `AppointmentMap` es la excepción).
- Funciones de service: `getAllX(filters?)`, `getXById(id)`, `createX(dto)`, `updateXStatus(id, status)`; las de auth: `requestLogin`, `requestSignUp`, `requestLogout`.
- Propiedades de datos (DTO/response/model): `snake_case`.
- Código en inglés; textos de UI, mensajes de toast y de validación en español. Comentarios en español con prefijo `INDICACIÓN:` para explicaciones y `TODO:` para pendientes.

### 6.3 Reglas de TypeScript que impone `tsconfig.app.json`

- `strict`, `noUnusedLocals`, `noUnusedParameters`: no dejes imports, variables ni parámetros sin usar (prefija con `_` o elimínalos).
- `verbatimModuleSyntax`: los imports que solo son tipos **deben** usar `import type { X }` o `import { type X }`.
- `erasableSyntaxOnly`: **prohibido `enum` de TypeScript** y parameter properties. Usa el patrón:

  ```ts
  export const Role = { ADMINISTRADOR: 'ADMINISTRADOR', ASISTENTE: 'ASISTENTE', PACIENTE: 'PACIENTE' } as const;
  export type Role = typeof Role[keyof typeof Role];
  ```
- Importa con el alias `@/` (`@/features/...`, `@/components/...`). Dentro del mismo feature también se aceptan relativas (`../hooks/use-x`).

---

## 7. Receta: agregar un dominio / CRUD nuevo

Ejemplo: preguntas frecuentes (`faqs`), suponiendo que el backend ya expone `GET/POST /faqs` y `PATCH /faqs/status/:id`.

1. **Tipos** en `features/faqs/types/`: `faq.response.ts` (shape exacto del backend), `faq.model.ts`, `faq.mapper.ts` (`faqMap`), `create-faq.dto.ts`, `faq.filters.ts`.
2. **Service** `features/faqs/services/faqs.service.ts`: `getAllFaqs(filters?)` con `URLSearchParams`, `createFaq(dto)`, `updateFaqStatus(id, status)`. Siempre devuelven modelos mapeados.
3. **Hooks** `features/faqs/hooks/use-faqs.ts`: `useFaqs(filters?)` con key `['faqs', filters]`, `useCreateFaq()` que invalida `['faqs']`, `useUpdateFaqStatus()` con `setQueriesData`.
4. **Componentes** en `features/faqs/components/`: `faq.schema.ts`, `create-faq-form.component.tsx`, `create-faq-modal.component.tsx`, `faqs-columns.component.tsx`, `faqs-table.component.tsx`.
5. **Página** `pages/private/faqs-page.tsx` (export default) con `PageTitle`, tarjetas, filtros, `<CreateFaqModal />` y `<FaqsTable filters={...} />`.
6. **Ruta** en `router/router.tsx` (URL en español, ej. `/preguntas`, que ya está en el sidebar).
7. Verifica: `npm run typecheck` (sin errores nuevos), `npm run lint`, y prueba en el navegador con el backend levantado: carga, vacío, filtros, crear (toast + cierre + refresco de la tabla), error del backend (toast con su mensaje).

---

## 8. Interacción con el backend (contrato)

- Éxito: `{ success: true, message: 'OK', data }` → el service usa `response.data`.
- Error: `{ statusCode, message, error }` → llega al componente como `Error(message)`.
- Filtros: `status=ACTIVO|INACTIVO`, `role=<ROL>`, `search=<texto>`; para citas `status=<STATUS_APPOINTMENT>` y `patient_id=<id>`.
- Cambios de estado: `PATCH /users/status/:id` con `{ estado }` y `PATCH /services/status/:id` con `{ status }` (inconsistencia conocida del backend; respétala hasta que se unifique en ambos lados).
- `price` de servicios llega como **string** (Decimal de Postgres); se muestra como `$${price}`.
- Fechas: el backend devuelve ISO strings en UTC; el mapper las convierte a `Date` y la UI las muestra en hora local (`formatDate` usa `es-MX`; horas con `toLocaleTimeString()`).
- Si necesitas un endpoint o campo nuevo, se implementa primero en el backend y luego aquí (`*.response.ts` → mapper → model).

---

## 9. Deuda técnica y trampas conocidas

- **Errores de tipos preexistentes** (§2); `npm run build` falla hasta corregirlos.
- **Filtro por paciente roto**: `patient-profile-page.tsx` y `AppointmentSmallTable` llaman `useAppointments(\`patient_id=${id}\`)` con un string, pero el hook espera un objeto `AppointmentFilters` y `getAllAppointments` no envía `patient_id`. Resultado: el perfil muestra **todas** las citas. La solución correcta es agregar `patient_id` a `AppointmentFilters` y a los params del service.
- `appointment.mapper.ts` asigna `status: string` a `STATUS_APPOINTMENT` (falta tipar `AppointmentResponse.status` o castear).
- Dashboard (`dashboard-page.tsx`): "Citas de hoy" cuenta **todas** las citas y las demás tarjetas están en `0` hardcodeado; además llama `toast.error` dentro del render (efecto secundario en render, debería ir en un efecto o en el `onError`).
- Faltan `key` en varios `.map()` (`AppointmentList`, `AppointmentsTopCards`, `SelectComponent`, servicios en `home-page.tsx`).
- `about-us-page.tsx` y `public-services-page.tsx` contienen texto de una plantilla de clínica médica general (cardiología, etc.) y clases CSS que no existen; no son el diseño final.
- Botones de editar/eliminar en las columnas de usuarios y servicios no tienen acción todavía; el campo "Imagenes" del formulario de servicios no está conectado.
- `consultations-page.tsx` es un placeholder; rutas `/preguntas`, `/ofertas`, `/notificaciones` del sidebar no existen.
- Sin control por rol ni paginación (dependen del backend).
- `components.json` apunta a `src/styles/globals.css` (no existe; el real es `src/index.css`).

No corrijas estos puntos "de pasada" dentro de otra tarea salvo que sean necesarios para ella; si los corriges, hazlo en commits separados con su propio `fix`/`refactor`.

---

## 10. Flujo de trabajo con git

- Rama principal: `master`. Ramas `feature/<tema>`, `refactor/<tema>`, `fix/<tema>` (ej. `feature/self-contained-modals`, `feature/list-filtering`).
- Conventional Commits con alcance `frontend/<área>`, en inglés y minúsculas:

  ```
  feat(frontend/refresh): implement refresh token retry
  refactor(frontend/patients): wire status and search filters into PatientsTable
  fix(frontend/appointments): include filters in useAppointments queryKey
  style(frontend/modal): remove position conditional styles in modal component
  chore(frontend/react-query-devtools): add react query devtools
  ```

  Tipos usados: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`. Cuando un cambio requiere backend y frontend, normalmente se hacen commits separados: primero `...(backend/x)` y después `...(frontend/x)`.
- Un commit = un cambio lógico.

---

## 11. Checklist antes de dar una tarea por terminada

- [ ] El archivo está en la carpeta correcta (`features/<d>/...` vs `components/shared/` vs `pages/`).
- [ ] Nombres en `kebab-case` con el sufijo correcto; propiedades de datos en `snake_case`.
- [ ] Los componentes usan hooks; los hooks usan services; los services usan `@/services/api` y devuelven modelos mapeados.
- [ ] Query keys con el patrón `['<dominio>', filters]`; las mutaciones invalidan o actualizan la caché.
- [ ] Formularios con zod + `zodResolver`, mensajes en español, botón con `isPending` + `Spinner`, `toast.success` / `toast.error(error.message)`.
- [ ] Sin `enum` de TS, `import type` para tipos, sin variables/imports sin usar.
- [ ] Cada elemento de un `.map()` en JSX tiene `key`.
- [ ] Texto de UI en español; paleta rosa/gris/blanco.
- [ ] `npm run typecheck` no agrega errores respecto a la línea base; `npm run lint` sin errores nuevos.
- [ ] Probado en el navegador contra el backend: estado de carga, vacío, éxito y error.
- [ ] Si agregué una página: ruta en `router.tsx` y (si aplica) entrada en el sidebar.
- [ ] Actualicé este documento si cambié arquitectura, patrones o convenciones.
