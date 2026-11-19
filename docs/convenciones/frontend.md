# Estructura y convenciones — Frontend (React)

> Describe cómo está construido hoy `frontend-consultorio-dental/`: carpetas y convenciones de nombres y de código. La guía general (arquitectura, sesión, rutas, contratos) está en `../FRONTEND_DENTISSA_DOCUMENTACION.md`; el diseño visual en `../DESIGN.md`.

---

## 1. Estructura de carpetas

```
src/
├── main.tsx, App.tsx
├── assets/
├── config/                  # navigation.ts, clinic-content.ts, filters.ts, labels.ts
├── features/<dominio>/      # appointments, audit, auth, consultations, dashboard, faq,
│   ├── components/          # notifications, offers, patients, public, services, users
│   ├── hooks/               # (auth también tiene context/; public tiene public-styles.ts)
│   ├── services/
│   └── types/
├── components/
│   ├── shared/              # reutilizables entre dominios (sufijo .component.tsx)
│   └── ui/                  # primitivos shadcn/ui (nombres que genera la CLI)
├── hooks/                   # sin dominio: use-debounce, use-debounced-search, use-disclosure, use-mobile, use-now, use-pagination
├── layouts/                 # public-layout, auth-layout, private-layout, role-route
├── pages/{public,private}/  # vistas por ruta
├── router/router.tsx
├── services/api.ts          # cliente HTTP único
├── types/                   # api.response.ts, pagination.ts
├── utils/                   # clinic-time, formatters, query, validation
└── lib/utils.ts             # cn()
```

Regla de ubicación: si conoce el modelo de un dominio → `features/<dominio>/`; si es genérico y lo usan 2+ dominios → `components/shared/`; si es una vista de ruta → `pages/`. `features/services/` es el dominio "servicios dentales" (no confundir con la capa `services/`).

Capas: UI → Hook → Service → API Client (`services/api.ts`). Solo `api.ts` conoce códigos HTTP; el resto usa `ApiError.code`.

---

## 2. Nombres de archivo

Todo en `kebab-case`, con sufijo por tipo:

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Componente de `components/shared` y de `features/*/components` | `.component.tsx` | `confirm-dialog.component.tsx`, `appointment-card.component.tsx` |
| Schema zod | `<entidad>.schema.ts` | `user.schema.ts` |
| Modelo / Response / DTO / Mapper / Filters / Enum | `.model.ts`, `.response.ts`, `.dto.ts`, `.mapper.ts`, `.filters.ts`, `.enum.ts` | `patient.model.ts`, `create-user.dto.ts` |
| Hook | `use-<nombre>.ts` | `use-appointments.ts` |
| Service | `<dominio>.service.ts` | `auth.service.ts` |
| Página | `<nombre>-page.tsx` (export default) | `patients-page.tsx` |
| Layout | `<nombre>-layout.tsx` (export default); guarda de ruta `role-route.tsx` | `private-layout.tsx` |
| shadcn/ui | el que genera la CLI | `button.tsx` |

Notas del estado real: los componentes de `features/public/components/` y `features/auth/context/auth-context-provider.tsx` no llevan el sufijo `.component`; el enum de roles es `features/users/types/rol.enum.ts`. No renombres archivos de forma aislada.

---

## 3. Convenciones dentro del código

- Código (identificadores, archivos, rutas de carpetas) en **inglés**; textos visibles, mensajes de validación, toasts y URLs públicas en **español**.
- `PascalCase` para componentes, interfaces y tipos; `camelCase` para funciones y variables; props como `interface XProps`.
- Propiedades de datos (DTO, response, model): `snake_case`, igual que el backend.
- Exportaciones nombradas para componentes, hooks y services; `export default` solo en páginas y layouts.
- Query keys: `['<dominio>', 'list' | 'detail' | ..., filtros]`; toda mutación exitosa invalida o actualiza la caché.
- Un archivo por componente; services devuelven modelos mapeados (nunca el response crudo).
- Un solo sistema de avisos (`react-hot-toast`) y una sola librería de iconos (`lucide-react`). Confirmaciones destructivas con `ConfirmDialog`.
- Estilos con tokens de Tailwind del sistema de diseño (`../DESIGN.md`) y `cn()` para clases condicionales; sin hex sueltos ni estilos distintos por módulo.
- Fechas/horas con `utils/clinic-time.ts` (America/Mexico_City), no con la zona del navegador.
- Importa con el alias `@/`; dentro del mismo feature se aceptan rutas relativas.

### Reglas de TypeScript (`tsconfig.app.json`)

- `strict`, `noUnusedLocals`, `noUnusedParameters`.
- `verbatimModuleSyntax`: tipos con `import type`.
- `erasableSyntaxOnly`: **sin `enum` de TS**; usa objeto `as const` + tipo derivado:

```ts
export const Role = { ADMINISTRADOR: 'ADMINISTRADOR', ASISTENTE: 'ASISTENTE', PACIENTE: 'PACIENTE' } as const;
export type Role = typeof Role[keyof typeof Role];
```

### Verificación

`npm run lint` y `npm run build` deben pasar sin errores (`npm run typecheck` también pasa limpio).
