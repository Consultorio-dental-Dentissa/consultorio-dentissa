# Dentissa — Sistema de gestión para consultorio dental

Objetivo: terminar, corregir y mejorar el sistema completo (backend + frontend + BD), integrado de punta a punta.
Especificación completa en `docs/spec/`. Lee SOLO el archivo que necesite la tarea actual.

## Stack
- Backend: NestJS + Prisma (@prisma/adapter-pg) + PostgreSQL → `backend/`
- Frontend: React + TypeScript + Vite + Tailwind v4 + shadcn/ui + TanStack Query + Axios → `frontend/`
- Respeta los patrones existentes: ApiResponse<T> + GlobalExceptionFilter, RolesGuard + @Roles(), arquitectura frontend UI → Hook → Service → API Client.

## Reglas obligatorias
- NUNCA leas, explores ni uses la carpeta `prototipos/`.
- Código, tablas y columnas en inglés. Textos visibles en español.
- El backend es la fuente de autoridad: toda regla de negocio y permiso se valida ahí.
- Sin datos simulados, mocks en UI ni funcionalidades que aparenten funcionar.
- Sin dependencias nuevas salvo necesidad clara (justifícala en PROGRESS.md).
- Transacciones para operaciones atómicas. Paginación/filtros en servidor.
- No registres contraseñas, tokens ni datos clínicos en logs.
- No reescribas lo que ya funciona sin una razón técnica.
- BD: migraciones reproducibles con Prisma. PROHIBIDO `migrate reset`, `db push --force-reset` o borrar tablas/datos. Si una migración es destructiva: DETENTE y explica el impacto.
- Si hay conflicto entre `docs/` antiguos y `docs/spec/`, manda `docs/spec/`, salvo pérdida de datos, vulnerabilidad o cambio de negocio importante: en ese caso pregunta.
- Nunca afirmes que algo funciona sin haberlo verificado (tests, build o ejecución).

## Decisiones pendientes (pregunta antes de implementarlas)
- Qué transiciones de estado de cita puede hacer ASSISTANT.
- Ver sección "Decisiones" en `docs/PROGRESS.md` antes de decidir algo ya discutido.

## Flujo de trabajo y agentes
Trabaja por fases (ver `docs/PROGRESS.md`). Una fase o módulo por sesión.
- `explorer` (Haiku): explorar y localizar código. Úsalo en vez de leer muchos archivos tú mismo.
- `backend-dev` (Sonnet): implementar en `backend/`.
- `frontend-dev` (Sonnet): implementar en `frontend/`.
- `test-runner` (Haiku): ejecutar tests, lint y build y resumir solo los fallos.
- `reviewer` (Opus): revisar el diff de cada módulo terminado (seguridad, permisos, reglas de negocio).

Ciclo por funcionalidad: backend-dev → test-runner → frontend-dev → test-runner → reviewer → corregir → actualizar PROGRESS.md.
Los subagentes no se llaman entre sí: tú (sesión principal) orquestas.
Al delegar, pasa al subagente qué archivo de `docs/spec/` debe leer y el alcance exacto.

## Ahorro de contexto
- Al terminar cada tarea, actualiza `docs/PROGRESS.md` (hecho, pendiente, decisiones). Es la memoria entre sesiones.
- No pegues archivos completos en la conversación; resume.
- `docs/DIAGNOSIS.md` contiene el diagnóstico de la Fase 1: consúltalo en lugar de volver a explorar todo.

## Comandos
<!-- Ajusta a los scripts reales del proyecto -->
- Backend: `cd backend && npm run build && npm test && npm run lint`
- Frontend: `cd frontend && npm run build && npm run lint`
- Migración nueva: `cd backend && npx prisma migrate dev --name <nombre> --create-only` (revisa el SQL antes de aplicarla)
