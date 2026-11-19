# Informe de entrega — Dentissa

Fecha: 2026-11-18 (actualizado tras el rediseño DISEÑO-FINAL y la edición de entidades). Rama: `feature/VERSION-ESTABLE-CLAUDE`. **Todo el trabajo está sin commit** (ver Pendientes).

## 1. Resumen
Sistema de gestión para consultorio dental (NestJS + Prisma + PostgreSQL / React + Vite + Tailwind v4). Se auditó el estado inicial (`docs/DIAGNOSIS.md`), se cerraron brechas críticas de seguridad (sin control de roles, fuga de hash de contraseñas, pacientes accediendo a datos ajenos), se completó el backend de todos los módulos, se rehízo el frontend replicando las maquetas de `docs/DISEÑO-FINAL/` y se añadió una suite de integración contra Postgres real.

Estado: backend completo y probado con pruebas automáticas; frontend completo, compila y pasa lint, **verificado con capturas y pruebas parciales en navegador, no con una batería automática de UI**.

## 2. Backend (`backend-consultorio-dental/`)
Módulos: auth, users, patients, services (+imágenes), appointments, consultations (+imágenes privadas), faq, offers (+imagen), notifications, audit, dashboard.
- **Roles** (`@Roles` + `RolesGuard`): ADMINISTRADOR, ASISTENTE, PACIENTE. ASISTENTE crea/cancela/reprograma citas y ve ficha de paciente reducida; no confirma ni completa (decisión de Luis). PACIENTE solo sus datos y citas.
- **Auth**: login/logout/refresh con cookies httpOnly y rotación con detección de reutilización, `GET /auth/me`, cambio de contraseña (revoca sesiones), recuperación por correo (nodemailer; sin SMTP responde 503, no se simula), contraseñas 10–72 caracteres, rate limiting, usuario desactivado pierde acceso en cada request.
- **Citas**: crear con transacción Serializable y solape estricto, confirmar/completar (solo ADMIN), cancelar/reprogramar con motivo obligatorio e historial, reglas por fecha (no confirmar pasadas, no completar futuras, paciente no cancela/reprograma pasadas), notificaciones y auditoría en la misma transacción, restricción de solape en BD.
- **Consultas**: solo ADMIN, solo sobre citas COMPLETADA, una por cita; imágenes privadas (JPEG/PNG/WebP por magic bytes, ≤5 MB, ≤5) servidas por endpoint autorizado.
- **Contratos**: respuestas `{success,message,data}`, errores `{success:false,message,statusCode}`, listados `{items,total,page,limit}` (límite ≤100), filtros y paginación en servidor, filtros de citas `from/to/sort`, `completed_without_consultation`.
- **Auditoría** inmutable (trigger en BD), sin contraseñas, tokens ni datos clínicos. Teléfonos únicos y normalizados (10–15 dígitos).
- Mapeo API↔BD sin renombrar columnas (decisión de Luis): `description`→`notes`, `dentistObservations`→`observations`, FAQ `response`, ofertas `name`.

## 3. Frontend (`frontend-consultorio-dental/`)
- Diseño replicado de `docs/DISEÑO-FINAL/` (tokens reales en `docs/DESIGN.md`): Plus Jakarta Sans, botón `#18181b`, acento `#c0685c`, tarjetas sin sombra.
- Pantallas: login, registro, recuperar/restablecer contraseña; dashboard (datos reales); pacientes, perfil de paciente, mi perfil; usuarios; servicios con imágenes; citas (calendario día/semana/mes + lista con filtros); consultas con imágenes privadas; notificaciones (campana con contador); FAQ y ofertas (admin); auditoría; web pública (inicio, sobre nosotros, servicios, ofertas, FAQ, contacto).
- Sesión por `GET /auth/me` (sin rol en localStorage), guardas de rol en router y menú, refresh serializado entre pestañas, zona horaria del consultorio (`America/Mexico_City`) en `utils/clinic-time.ts`, code splitting (chunk principal 1,1 MB → 445 kB).
- La web pública usa **contenido de ejemplo** centralizado en `src/config/clinic-content.ts` (dirección, teléfono, equipo, estadísticas…) que Luis debe reemplazar.
- Diferencias deliberadas con las maquetas (el backend no soporta la función): sin login social ni "mantener sesión", sin editar/eliminar usuarios y servicios, sin odontograma, sin columnas de doctor/servicio en consultas, sin categorías de notificación.

### Novedades posteriores al primer informe
- **Edición**: `PATCH /users/:id` (ADMIN; sin cambiar rol de PACIENTE, sin autodegradarse, `current_password` si el admin cambia su propio correo), `PATCH /services/:id`, `PATCH /appointments/:id` (servicio y notas; revalida solape), `PATCH /patients/:id` acepta `status` atómico. Formularios y botones de edición en usuarios, servicios y citas.
- **Rediseño completo** replicando `docs/DISEÑO-FINAL/` (19 maquetas, fuente Nunito Sans): acceso, web pública, Panel, Pacientes y Perfil de paciente (variantes ADMIN/ASISTENTE/PACIENTE), Perfil de usuario (`/mi-perfil` para los 3 roles), Usuarios, Servicios, Citas (calendario + Mis citas del paciente), Consultas, Notificaciones, Ofertas, FAQ y Auditoría. Sin avatares/iniciales en tablas. Decisiones y diferencias con las maquetas en `docs/DESIGN.md` §8.
- **Omitido por no existir en el backend**: odontograma, "Odontólogo", descuento de ofertas, eliminar usuarios/servicios/notificaciones, Recordarme, términos/aviso de privacidad, login social, estadísticas sin endpoint. El selector de estado libre de la maqueta de citas se sustituye por botones de transiciones válidas.

## 4. Base de datos
PostgreSQL local, BD `dentissa_local_prueba`. 16 migraciones aditivas, reproducibles (`prisma migrate deploy`), sin reset ni borrado de datos. Añadidas: refresh tokens, tokens de recuperación, `password_changed_at`, historial de reprogramaciones y campos de cancelación, restricciones de integridad (UNIQUE `services.name`, CHECK de duración/precio/fechas, EXCLUDE de solape con `tsrange` sin `btree_gist`, índices), `audit_logs` inmutable (trigger + FK RESTRICT), campos de auditoría de consultas, imagen de ofertas, índice único parcial de teléfono. `migrate diff` sin deriva.
Nota: la BD del contenedor Docker `dentissa-db-1` tiene migraciones de **otra rama** (`feature/VERSION-ESTABLE-CODEX`) incompatibles con esta; no se usa ni se tocó.

## 5. Seguridad
Autorización en backend para toda regla; ownership en pacientes/citas/consultas; hash de contraseña nunca expuesto; cookies httpOnly (`secure` en producción, `sameSite` configurable); CORS desde `FRONTEND_URL`; `JWT_SECRET` obligatorio (≥32 y no el valor de ejemplo en producción); rate limiting en auth; subida de archivos validada por contenido, nombres aleatorios y protección contra path traversal; sin datos clínicos en logs/auditoría/notificaciones; revisiones independientes (`reviewer`) de cada módulo con hallazgos corregidos.
Compromisos conocidos: el access token (15 min) sigue válido tras logout (solo se revoca el refresh); registro con email/teléfono repetido responde 400 (no 409) y por tanto revela existencia; el rate limit cuenta por IP (configurar `TRUST_PROXY_HOPS` tras un proxy).

## 6. Pruebas ejecutadas (resultados reales, 2026-11-18)
| Prueba | Resultado |
|---|---|
| Backend `npm run build` | OK |
| Backend `npm test` (unitarios, mocks) | 32 suites, 445 tests OK (la suite `auth-account` puede dar timeout con el equipo saturado; pasa sola) |
| Backend `npm run test:e2e` (HTTP real, Postgres, esquema aislado `e2e_test`) | 8 suites, 225 tests OK |
| Frontend `npm run build` | OK |
| Frontend `npm run lint` | 0 errores, 1 warning conocido (TanStack Table) |

La suite e2e cubre: matriz de permisos por rol, concurrencia de citas (≥10 solicitudes simultáneas → 1 creada), ciclo de estados y reglas por fecha, consultas e imágenes privadas (incluido path traversal), Auth completo (rotación/reutilización de refresh, reset, 429), auditoría sin datos sensibles e inmutable, integridad en BD (UNIQUE, CHECK, EXCLUDE por SQL), paginación/filtros y catálogo público. El esquema `e2e_test` se elimina al terminar y `public` no cambia.

**No verificado**: clics reales de la mayoría de pantallas rediseñadas (solo se verificaron con clics: crear/editar servicio, oferta y pregunta frecuente, cancelar cita como paciente, reprogramar como admin, editar paciente, guardar teléfono de Mi perfil), cambio de correo propio del admin y su cierre de sesión (no se ejecutó para no arriesgar el acceso), crear/editar consultas con el formulario nuevo, comparación píxel a píxel con las maquetas, clics reales en toda la UI (reprogramar con cada rol, confirmar/completar desde la UI, registrar consulta desde una cita completada sin consulta, recuperación con token real —no hay SMTP—, refresh entre dos pestañas, móvil en la mayoría de pantallas), envío real de correo, expiración real del access token, varias instancias del backend, build con Docker (aparcado).

## 7. Pendientes
- **Commits**: nada está confirmado en git (cientos de archivos). Decidir si se hace un commit por módulo.
- **Contenido real** en `src/config/clinic-content.ts`; servicios reales (los de la BD son filas de prueba `ZZ`).
- **Limpieza**: borrar `backend-consultorio-dental/dist-fe-test/`; datos de prueba (`ZZ`, `qa.frontend.paciente@example.com`) en `dentissa_local_prueba` (la auditoría es inmutable: para una BD limpia hay que recrear la base); 11 pacientes de prueba con teléfono de emergencia fuera de formato.
- **Configuración de producción**: `JWT_SECRET` ≥32 caracteres (el actual del `.env` tiene 17), SMTP real, `ON_PRODUCTION=true`, `FRONTEND_URL`, `TRUST_PROXY_HOPS`.
- Docker: volumen para `STORAGE_DIR` y revisar el compose (la imagen/BD existentes vienen de la rama Codex).
- Job de limpieza de archivos huérfanos en `STORAGE_DIR`; lint de specs (`any` en mocks); fechas de nacimiento antiguas en UTC vs nuevas en medianoche local; fechas de nacimiento y datos no migrados de versiones previas.
- Funciones que las maquetas muestran y el backend no tiene (editar/eliminar usuarios y servicios, odontograma, categorías de notificación) si se desean.
- El proyecto vive en OneDrive: los builds pueden ser muy lentos; considerar excluir `node_modules` de la sincronización.

- Datos de prueba acumulados en `dentissa_local_prueba` (prefijo ZZ, usuarios `zz-*@example.com`, `zz.*@example.com`, `qa.frontend.paciente@example.com`, citas, servicios, oferta, FAQ y registros de auditoría inmutables): para una demo limpia hay que recrear la base.
- Riesgo menor: `PATCH /users/:id` sin límite de intentos en el cambio de correo propio con contraseña actual (el throttle es por ruta).
- Decidir si se crean páginas de términos y aviso de privacidad, y actualizar RNF-006 (rosa `#fc7186` de las maquetas).

## 8. Instrucciones de ejecución (local, sin Docker)
1. PostgreSQL local con una BD vacía. En `backend-consultorio-dental/` copiar `.env.example` a `.env` y completar: `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD` (≥10), y opcionales (`FRONTEND_URL`, `SMTP_*`, `APP_TIMEZONE`, `STORAGE_DIR`, `COOKIE_SAMESITE`, `TRUST_PROXY_HOPS`).
2. Backend: `cd backend-consultorio-dental && npm install && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build && npm run start:prod` (o `npm run start:dev`). Admin inicial: `administrador@gmail.com` con la contraseña de `SEED_ADMIN_PASSWORD`.
3. Frontend: `cd frontend-consultorio-dental && npm install && npm run dev` (`VITE_API_URL` apunta al backend; por defecto `http://localhost:3000`). Producción: `npm run build`.
4. Pruebas: `npm test` y `npm run test:e2e` en el backend (usa un esquema aislado `e2e_test` dentro de la BD del `.env` y lo elimina al terminar); `npm run lint` en el frontend.
