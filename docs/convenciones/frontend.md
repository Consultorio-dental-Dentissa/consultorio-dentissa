# Estructura y convenciones — Frontend (React)

> Este documento describe **cómo está construido actualmente** el frontend de Dentissa: organización de carpetas y convención de nombres. Complementa a `CONTRIBUTING.md` (que define cómo trabajamos como equipo) con el detalle específico de este proyecto.

---

## 1. Estructura de carpetas

```
frontend-consultorio-dental/
├── src/
│   ├── main.tsx
│   ├── assets/
│   ├── components/            # Componentes reutilizables, divididos por dominio
│   │   ├── common/            # Componentes compartidos entre dominios
│   │   ├── appointments/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── services/
│   │   ├── users/
│   │   └── ui/                # Componentes de shadcn/ui
│   │
│   ├── context/                # AuthProvider y AuthContext: datos del usuario autenticado
│   │
│   ├── hooks/                  # Un archivo de hooks por módulo (estado expuesto a las vistas)
│   │
│   ├── layouts/
│   │   ├── private-layout.tsx  # Layout del panel de administración
│   │   └── public-layout.tsx   # Layout de las vistas públicas
│   │
│   ├── pages/
│   │   ├── private/             # Vistas que usan private-layout
│   │   └── public/              # Vistas que usan public-layout
│   │
│   ├── router/
│   │   └── router.tsx           # Definición de rutas (react-router)
│   │
│   ├── services/
│   │   ├── api.ts               # Cliente centralizado de peticiones HTTP
│   │   ├── appointment.service.ts
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── users.service.ts
│   │   └── services.service.ts
│   │
│   ├── styles/                  # Estilos globales
│   │
│   ├── types/
│   │   ├── api/
│   │   │   ├── request/         # Objetos enviados al backend (*.dto.ts)
│   │   │   └── responses/       # Objetos devueltos por el backend (*.response.ts)
│   │   ├── enums/                # Enums del sistema (rol.enum.ts, status-appointment.enum.ts)
│   │   ├── mappers/               # Transforman *.response.ts → *.model.ts (*.mapper.ts)
│   │   └── models/                # Modelos consumidos por los componentes (*.model.ts)
│   │
│   └── utils/                    # Funciones de apoyo (formatters.ts, etc.)
```

### Descripción de cada carpeta

| Carpeta | Responsabilidad |
|---|---|
| `components/<dominio>/` | Componentes reutilizables de UI, agrupados por dominio de negocio |
| `components/ui/` | Componentes de la librería shadcn/ui (también reutilizables entre dominios) |
| `context/` | Providers/contextos globales de React (ej. sesión autenticada) |
| `hooks/` | Estado y lógica de cada módulo, expuestos a las vistas mediante hooks |
| `layouts/` | Estructura visual compartida entre grupos de vistas (panel privado vs. público) |
| `pages/` | Vistas de la aplicación, asociadas a rutas |
| `router/` | Configuración de enrutamiento |
| `services/` | Funciones que hacen peticiones al backend, construidas sobre `api.ts` |
| `types/api/request` | Contratos de lo que el frontend envía al backend |
| `types/api/responses` | Contratos de lo que el backend devuelve |
| `types/mappers` | Traducción de `response` → `model` |
| `types/models` | Forma de los datos que consumen los componentes |
| `types/enums` | Catálogos de valores fijos usados en todo el sistema |
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
use-appointment.ts
use-users.ts

# Estándar futuro (pendiente de migración):
appointment.hook.ts
users.hook.ts
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