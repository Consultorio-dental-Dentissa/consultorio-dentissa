# Estructura y convenciones — Frontend (React)

> Este documento describe **cómo está construido actualmente** el frontend de Dentissa: organización de carpetas y convención de nombres. Complementa a `CONTRIBUTING.md` (que define cómo trabajamos como equipo) con el detalle específico de este proyecto.

---

## 1. Estructura de carpetas

```
frontend-consultorio-dental/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── assets/
│   │
│   ├── features/                  # Un módulo por dominio de negocio
│   │   ├── appointments/
│   │   │   ├── components/        # appointment-card.component.tsx, create-appointment-form.component.tsx, ...
│   │   │   ├── hooks/             # use-appointments.ts
│   │   │   ├── services/          # appointments.service.ts
│   │   │   └── types/             # appointment.model.ts, appointment.response.ts, create-appointment.dto.ts, appointment.mapper.ts, status-appointment.enum.ts
│   │   ├── auth/
│   │   │   ├── context/           # auth-context.ts, auth-context-provider.tsx
│   │   │   ├── hooks/             # use-login.ts, use-register.ts
│   │   │   ├── services/          # auth.service.ts
│   │   │   └── types/             # login.dto.ts, login.response.ts
│   │   ├── patients/
│   │   │   ├── components/        # patients-columns.component.tsx
│   │   │   ├── hooks/             # use-patients.ts
│   │   │   ├── services/          # patients.service.ts
│   │   │   └── types/             # patient.model.ts, patient.response.ts, patient.mapper.ts
│   │   ├── services/               # dominio "servicios dentales" (⚠️ no confundir con la capa `services/`)
│   │   │   ├── components/        # services-columns.component.tsx, create-service-form.component.tsx
│   │   │   ├── hooks/             # use-services.ts
│   │   │   ├── services/          # services.service.ts   ← sí, se repite el nombre (ver nota abajo)
│   │   │   └── types/             # service.model.ts, service.response.ts, create-service.dto.ts, service.mapper.ts
│   │   └── users/
│   │       ├── components/        # users-colums.component.tsx, create-user-form.component.tsx
│   │       ├── hooks/             # use-users.ts
│   │       ├── services/          # users.service.ts
│   │       └── types/             # user.model.ts, user.response.ts, create-user.dto.ts, user.mapper.ts, rol.enum.ts
│   │
│   ├── components/
│   │   ├── common/                # Componentes compartidos entre dominios (DataTable, Modal, Sidebar, CardDashboard...)
│   │   └── ui/                    # Componentes de shadcn/ui
│   │
│   ├── hooks/
│   │   └── use-mobile.ts          # Único hook sin dominio: estado de viewport, usado por components/ui/sidebar.tsx
│   │
│   ├── layouts/
│   │   ├── private-layout.tsx     # Layout del panel de administración
│   │   └── public-layout.tsx      # Layout de las vistas públicas
│   │
│   ├── pages/
│   │   ├── private/                # Vistas que usan private-layout
│   │   └── public/                 # Vistas que usan public-layout
│   │
│   ├── router/
│   │   └── router.tsx              # Definición de rutas (react-router)
│   │
│   ├── services/
│   │   └── api.ts                  # Cliente HTTP centralizado; cada features/<dominio>/services/ lo consume
│   │
│   ├── styles/                     # Estilos globales
│   │
│   ├── types/
│   │   └── api.response.ts         # Único tipo realmente genérico: el wrapper `ApiResponse<T>`
│   │
│   └── utils/                      # Funciones de apoyo sin dominio (formatters.ts, etc.)
```

### Organización por dominio (`features/`)

Cada dominio de negocio (`appointments`, `patients`, `users`, `services`, `auth`) tiene su propia carpeta dentro de `features/`, y **dentro de cada una se repiten las mismas 4 capas**: `components/`, `hooks/`, `services/`, `types/`. Es la misma separación por capas que antes vivía a nivel de todo el proyecto, solo que ahora anidada por dominio en vez de mezclar los cinco dominios en una sola carpeta por capa.

**Regla para decidir dónde va un archivo nuevo:**
- Si el archivo conoce el modelo de negocio de un dominio (sabe qué es una `Cita`, un `Paciente`, etc.) → va dentro de `features/<dominio>/`.
- Si es genérico y no le importa qué dominio lo use (un botón, una tabla, un modal) → se queda en `components/common/` o `components/ui/`.
- `pages/` **no** se movió a `features/`: las páginas siguen siendo el punto de composición de rutas, y ahora importan lo que necesitan directamente desde `features/<dominio>/...`.

**Sobre `features/services/services/`:** el dominio "servicios" (tratamientos dentales) coincide de nombre con la capa `services/` (llamadas a la API). Se mantiene así por consistencia con el resto de dominios — todos usan las mismas 4 subcarpetas — aunque la ruta resultante se lea repetida. Si en el futuro molesta, la alternativa es renombrar el dominio (p. ej. `features/treatments/`), no la capa.

### Descripción de cada carpeta

| Carpeta | Responsabilidad |
|---|---|
| `features/<dominio>/components/` | Componentes de UI que conocen el modelo de ese dominio |
| `features/<dominio>/hooks/` | Estado y lógica del dominio, expuestos a las vistas mediante hooks |
| `features/<dominio>/services/` | Peticiones al backend específicas del dominio, construidas sobre `services/api.ts` |
| `features/<dominio>/types/` | Modelo, DTOs, responses, mappers y enums de ese dominio |
| `features/auth/context/` | Providers/contextos de React del dominio de autenticación (sesión, usuario actual) |
| `components/common/` | Componentes reutilizables sin lógica de negocio, usados por 2+ dominios |
| `components/ui/` | Componentes de la librería shadcn/ui |
| `hooks/` | Hooks que no pertenecen a ningún dominio (hoy: `use-mobile.ts`) |
| `layouts/` | Estructura visual compartida entre grupos de vistas (panel privado vs. público) |
| `pages/` | Vistas de la aplicación, asociadas a rutas; componen `features/<dominio>/...` |
| `router/` | Configuración de enrutamiento |
| `services/` | Cliente HTTP base (`api.ts`), compartido por todos los dominios |
| `types/` | Tipos verdaderamente genéricos, sin dominio (hoy: el wrapper `ApiResponse<T>`) |
| `utils/` | Funciones auxiliares sin estado ni dependencia de dominio |

---

## 2. Convención de nombres de archivos

**Regla general: todos los nombres de archivo están en `kebab-case`.**

Cada carpeta usa un sufijo que identifica el tipo de archivo:

| Tipo de archivo | Sufijo | Ejemplo |
|---|---|---|
| Componente | `.component.tsx` | `appointment-card.component.tsx` |
| Modelo | `.model.ts` | `appointment.model.ts` |
| Servicio | `.service.ts` | `appointment.service.ts` |
| Mapper | `.mapper.ts` | `appointment.mapper.ts` |
| DTO (request) | `.dto.ts` | `create-appointment.dto.ts` |
| Response | `.response.ts` | `appointment.response.ts` |
| Enum | `.enum.ts` | `status-appointment.enum.ts` |

> Los componentes dentro de `components/ui/` (shadcn/ui) **no** siguen el sufijo `.component.tsx`; se manejan con la convención propia que genera la CLI de shadcn/ui.

### Excepciones actuales (deuda técnica documentada)

Estas dos excepciones existen por un desfase de coordinación en el equipo. Se documentan **tal cual están hoy**; el estándar correcto se aplicará en una migración futura.

**Hooks** — actualmente usan prefijo `use-` en vez del sufijo `.hook.ts`:

```
# Estado actual (vigente):
features/appointments/hooks/use-appointments.ts
features/users/hooks/use-users.ts

# Estándar futuro (pendiente de migración):
features/appointments/hooks/appointments.hook.ts
features/users/hooks/users.hook.ts
```

**Pages** — actualmente usan `-page` (guion) en vez de `.page.` (punto):

```
# Estado actual (vigente):
appointments.page.tsx        ← ya sigue el formato correcto
dashboard-page.tsx           ← usa guion en vez de punto

# Estándar futuro (pendiente de migración):
appointment.page.tsx
dashboard.page.tsx
```

> ⚠️ Hasta que no se realice la migración formal (con su propia rama `refactor/`), los archivos nuevos de `pages/` deben seguir el patrón `nombre.page.tsx` cuando sea posible, y los existentes con guion no se renombran de forma aislada — se migran todos juntos para no dejar el módulo en un estado mixto a medias.

---

## 3. Convención de nombres dentro del código

- **Nombres de archivo:** `kebab-case` (ver sección 2).
- **Nombres de clases/componentes/interfaces:** `PascalCase`.
- **Propiedades de objetos e interfaces (DTOs, responses, models):** `snake_case`, para mantener consistencia directa con los nombres de columna que expone el backend (Prisma/PostgreSQL).

**Ejemplo — `create-appointment.dto.ts`:**

```ts
export interface CreateAppointmentDto {
  scheduled_at: string;
  notes: string;
  patient_id: number;
  service_id: number;
}
```