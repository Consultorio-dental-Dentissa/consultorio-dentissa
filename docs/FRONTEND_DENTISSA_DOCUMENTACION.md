# Frontend — Dentissa (`frontend-consultorio-dental/`)

Guía de trabajo para personas y agentes: cómo está construido hoy el frontend, las reglas que se deben respetar y cómo agregar código siguiendo los patrones existentes. Las rutas son relativas a `frontend-consultorio-dental/` salvo que se indique lo contrario. La API vive en `../backend-consultorio-dental/` (ver `BACKEND_DENTISSA_DOCUMENTACION.md`). Convenciones de nombres: `convenciones/frontend.md`. Diseño visual: `DESIGN.md`.

---

## 1. Resumen

| Tema | Valor |
|---|---|
| Qué es | SPA con **sitio público** (landing, servicios, ofertas, FAQ, contacto, login, registro, recuperación de contraseña) y **panel privado** por rol (ADMINISTRADOR, ASISTENTE, PACIENTE) |
| Framework | React 19 + TypeScript 5.9 + Vite 7, React Compiler activo (`babel-plugin-react-compiler`) |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`); tokens en `src/index.css` (`@theme` + `:root`), ver `DESIGN.md` |
| Componentes base | shadcn/ui (sobre `radix-ui`) en `src/components/ui/`, más `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| Estado del servidor | TanStack Query v5 (+ Devtools solo en DEV) |
| Tablas | TanStack Table v8 vía `DataTable` compartido |
| Formularios | `react-hook-form` + `zod` v4 + `@hookform/resolvers` |
| HTTP | `axios` centralizado en `src/services/api.ts` (`withCredentials: true`) |
| Rutas | `react-router-dom` v7 (`BrowserRouter` + `Routes`, páginas con `lazy`) |
| Avisos | **Solo** `react-hot-toast` (`<Toaster>` con tokens del tema en `App.tsx`) |
| Iconos | **Solo** `lucide-react` |
| Fuentes | Plus Jakarta Sans e Inter (`@fontsource`) |
| Alias | `@/` → `src/` |

Se eliminaron `sweetalert2`, `react-icons`, `js-cookie` y `react-react`: no los reintroduzcas (confirmaciones con `ConfirmDialog`, avisos con `react-hot-toast`, iconos con `lucide-react`).

## 2. Scripts y entorno

```bash
npm install
npm run dev        # Vite → http://localhost:5173 (origen permitido por CORS del backend)
npm run build      # tsc -b && vite build
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit -p tsconfig.app.json (pasa limpio)
npm run preview
```

Variables de entorno (`.env`):
- `VITE_API_URL` — URL base del backend (local: `http://localhost:3000`). Obligatoria.
- `VITE_CLINIC_TIMEZONE` — opcional; por defecto `America/Mexico_City` (debe coincidir con `APP_TIMEZONE` del backend).

Para probar con datos reales el backend debe estar corriendo; no hay datos simulados en la UI.

## 3. Estructura de carpetas

```
src/
├── main.tsx, App.tsx          # App: QueryClientProvider → Toaster → AuthProvider → Router
├── index.css                  # Tailwind v4 + tokens del sistema de diseño
├── assets/                    # logo y foto del consultorio
├── config/
│   ├── navigation.ts          # NAV_ITEMS por rol, getHomeRoute, BREADCRUMB_LABELS
│   ├── clinic-content.ts      # contenido de EJEMPLO del sitio público (ver §8)
│   ├── filters.ts, labels.ts  # opciones de filtros y etiquetas compartidas
├── features/<dominio>/        # appointments, audit, auth, consultations, dashboard, faq,
│   ├── components/            # notifications, offers, patients, public, services, users
│   ├── hooks/                 # useQuery/useMutation (queryKey e invalidaciones)
│   ├── services/              # llamadas a la API sobre @/services/api + mappers
│   └── types/                 # model, response, dto, mapper, filters, enum
├── components/shared/         # reutilizables: DataTable, Modal, ConfirmDialog, Drawer, StatusBadge,
│                              # EmptyState, ErrorState, PageHeader, Pagination, StatCard, Input/Select...
├── components/ui/             # primitivos shadcn (generados con la CLI)
├── hooks/                     # sin dominio: use-debounce, use-debounced-search, use-disclosure,
│                              # use-mobile, use-now, use-pagination
├── layouts/                   # public-layout, auth-layout, private-layout, role-route
├── pages/{public,private}/    # una vista por ruta (export default)
├── router/router.tsx          # rutas
├── services/api.ts            # cliente HTTP único
├── types/                     # api.response.ts (ApiResponse<T>), pagination.ts (Paginated<T>)
├── utils/                     # clinic-time, formatters, query, validation
└── lib/utils.ts               # cn()
```

Dónde va un archivo: conoce un dominio → `features/<dominio>/`; genérico usado por 2+ dominios → `components/shared/`; primitivo shadcn → `components/ui/` (con la CLI); vista de ruta → `pages/` y registrarla en `router.tsx` (y en `config/navigation.ts` si va en el menú).

## 4. Arquitectura: UI → Hook → Service → API Client

```
Page / componente de feature  →  Hook (TanStack Query)  →  Service (URL, params, mapper)  →  api.ts (axios)  →  Backend
```

- Los componentes no llaman a axios ni a `api.ts`: usan hooks del dominio.
- Los hooks no arman URLs: delegan en el service. Definen `queryKey` (`['<dominio>', 'list'|'detail'..., filtros]`) e invalidan/actualizan la caché tras cada mutación exitosa.
- Los services devuelven modelos (aplican el mapper `Response → Model`), nunca la respuesta cruda.
- **Solo `api.ts` conoce códigos HTTP**: traduce todo error a `ApiError { message, code, details }` con `code` semántico (`unauthorized | forbidden | not_found | conflict | validation | rate_limited | unavailable | network | server | unexpected`). La UI decide con `error.code`, nunca con números. El manejo estándar es `toast.error(error.message)`.
- `api.ts` exige el envoltorio `{ success: true, data }` (admite `data` null/false/0), expone `get/post/put/patch/deleteR`, `postForm/putForm` (multipart), `getBlob` (recursos protegidos con credenciales) y `resolveApiUrl`.
- `QueryClient` (en `App.tsx`): no reintenta errores 4xx; 1 reintento en el resto; sin refetch al enfocar la ventana.

## 5. Sesión y roles

- Los tokens viajan en **cookies httpOnly**; el frontend nunca los lee ni los guarda. No hay datos de sesión en `localStorage` (solo una marca de tiempo del último refresh entre pestañas).
- `AuthProvider` obtiene la sesión con **`GET /auth/me`** (query `SESSION_QUERY_KEY`); `me` es la fuente de autoridad del rol. `useAuth()` expone usuario y acciones (login, logout).
- **Refresh automático**: ante un 401 (salvo en `/auth/login|refresh|register|forgot-password|reset-password`) `api.ts` llama una vez a `POST /auth/refresh` y reintenta la petición. Las peticiones concurrentes comparten una promesa y se serializan entre pestañas con `navigator.locks`. Si el refresh es rechazado se emite `auth:session-expired`; `AuthProvider` limpia la sesión y la caché y `PrivateLayout` redirige a `/login`. Un fallo de red, 429 o 503 no cierra la sesión.
- `PrivateLayout` exige sesión; **`RoleRoute allowedRoles={[...]}`** muestra `ForbiddenPage` si el rol no coincide. Es solo UX: el backend vuelve a validar cada petición.
- Pantalla de inicio tras login (`getHomeRoute`): ADMINISTRADOR → `/dashboard`; resto → `/citas`. El menú lateral se filtra por rol con `getNavItems`.

### Rutas por rol

| Rol | Ruta | Página |
|---|---|---|
| Público | `/`, `/sobre-nosotros`, `/nuestros-servicios`, `/ofertas`, `/preguntas-frecuentes`, `/contacto`, `*` (404) | `pages/public/*` |
| Público (AuthLayout) | `/login`, `/registrate`, `/olvide-mi-contrasena`, `/restablecer-contrasena` | `login`, `sign-up`, `forgot-password`, `reset-password` |
| ADMINISTRADOR | `/dashboard`, `/usuarios`, `/consultas`, `/gestionar-ofertas`, `/gestionar-preguntas`, `/auditoria` | dashboard, users, consultations, offers, faq, audit |
| ADMINISTRADOR, ASISTENTE | `/pacientes`, `/pacientes/:id`, `/servicios` | patients, patient-profile, services |
| ADMINISTRADOR, ASISTENTE, PACIENTE | `/citas`, `/notificaciones` | appointments, notifications |
| PACIENTE | `/mi-perfil` | my-profile |

`/ofertas` y `/preguntas-frecuentes` son páginas públicas; su gestión usa `/gestionar-*`. URLs en español; código en inglés.

## 6. Contratos con el backend

- Éxito: `{ success: true, message?, data }`. Listados paginados en servidor: `data = { items, total, page, limit }` (`Paginated<T>` en `types/pagination.ts`; `DEFAULT_PAGE_SIZE = 10`). Filtros, búsqueda y paginación se envían como query params (solo los que tienen valor; `TODOS` = sin filtro).
- Error: `{ message, errors? }` → `ApiError` (`details` = lista de `errors`). El 429 usa un mensaje propio en español.
- Zona horaria: todo el cálculo de fechas/horas usa `America/Mexico_City` mediante **`utils/clinic-time.ts`** (días como `AAAA-MM-DD`, formato `es-MX`); no uses la zona del navegador. El backend envía fechas ISO en UTC.
- Propiedades de datos en `snake_case` (igual que el backend). Si falta un endpoint o campo, se implementa primero en el backend y luego se refleja en `*.response.ts` → mapper → model.

## 7. Patrones de UI

- Componentes autocontenidos: tablas/listas de dominio llaman a su propio hook y manejan **carga, vacío y error** (`EmptyState`, `ErrorState`); modales y formularios gestionan su mutación y avisos.
- Acciones destructivas siempre con `ConfirmDialog`.
- Formularios: `react-hook-form` + `zod` (schema en `features/<d>/components/<entidad>.schema.ts`), mensajes en español, botón con `disabled={isPending}`.
- Reutiliza los componentes de `components/shared` y los tokens de Tailwind (blanco, rosa y tonos suaves); no hay estilos propios por módulo. Detalle de tokens, tipografía y componentes en **`DESIGN.md`**.
- Accesibilidad básica: etiquetas en campos, `aria-*` en modales/menús, foco gestionado por Radix.

## 8. Contenido de ejemplo del sitio público

`src/config/clinic-content.ts` contiene datos **ficticios** (equipo, testimonios, contacto, horarios…) solo para maquetar la web pública; deben reemplazarse por los datos reales del consultorio. Servicios, ofertas y preguntas frecuentes **no** viven ahí: se leen de la API (`GET /services`, `/offers`, `/faq`) vía `features/public`.

## 9. Checklist antes de dar una tarea por terminada

- [ ] Archivo en la carpeta correcta y con el nombre/sufijo de `convenciones/frontend.md`.
- [ ] Componente → hook → service → `api.ts`; sin códigos HTTP fuera de `api.ts`.
- [ ] Mutaciones invalidan o actualizan la caché; estados de carga, vacío y error cubiertos.
- [ ] Textos visibles en español; tokens de `DESIGN.md`; sin librerías nuevas de iconos/avisos.
- [ ] `import type` para tipos; sin `enum` de TS; sin imports/variables sin usar.
- [ ] Ruta en `router.tsx` con `RoleRoute` adecuado y entrada en `config/navigation.ts` si aplica.
- [ ] `npm run lint` y `npm run build` sin errores; probado contra el backend real.
- [ ] Documentación actualizada si cambió la arquitectura o una convención.
