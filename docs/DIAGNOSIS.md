# Diagnóstico Fase 1 (solo lectura; no se ejecutaron tests/lint/build)

Carpetas reales: `backend-consultorio-dental/` y `frontend-consultorio-dental/` (CLAUDE.md dice `backend/` y `frontend/`).

## Backend
- Módulos: auth, users, patients, services, appointments. Infra: prisma, common (TransformResponseInterceptor), security (AuthGuard, IsActiveUserGuard, @Public).
- NO existen: consultations, faq, offers, notifications, audit, dashboard, RolesGuard/@Roles, GlobalExceptionFilter, ApiResponse<T>, rate limiting, helmet.
- Endpoints: auth (login, refresh, logout, register); users (GET, GET :id, POST, PATCH status/:id); patients (GET, GET :id); services (GET público, POST, PATCH status/:id); appointments (GET, GET :id, POST).
- Sin paginación en ningún listado. Tests: 10 specs scaffold de un `it` + e2e; cobertura de negocio nula.

## Modelo Prisma vs spec
- Ausentes: AuditLog, tabla de recuperación de contraseña, historial de reprogramación.
- AppointmentStatus en español (PENDIENTE…) vs spec en inglés. Nombres distintos a la spec: users.name/lastname/password, Offer.name, FAQ.response, Consultation.notes/observations, Notification.type; faltan timestamps, Offer.image, Notification.readAt, created_by/updated_by.
- Faltan: UNIQUE services.name, EXCLUDE (btree_gist + tstzrange) en citas, CHECKs (duración>0, precio>=0, fechas oferta), límite 1-5 imágenes, índices (appointments scheduled_at/patient_id/status; notifications user_id,is_read).
- Patient.address obligatorio (spec no lo pide). 8 migraciones, varias renames.

## Frontend
- Rutas públicas: /, /sobre-nosotros, /login, /nuestros-servicios, /registrate. Privadas: /dashboard, /usuarios, /pacientes(/:id), /servicios, /citas, /consultas.
- PrivateLayout no comprueba rol; sidebar sin filtrar por rol; enlaces /preguntas, /ofertas, /notificaciones sin ruta. Sesión en localStorage sin GET /auth/me.
- Datos fijos/simulados: dashboard (0 fijos, "citas de hoy" sin filtrar), public-services-page (array fijo), about-us, home (parcial). Consultas y perfil de paciente son placeholders. Sin calendario, sin paginación server-side, sin tests.
- package.json: dependencia sospechosa "react-react"; librerías duplicadas (react-icons/lucide, sweetalert2/react-hot-toast). Interceptor de api.ts trata data falsy como error.

## Brechas críticas (seguridad)
1. Sin RolesGuard: un PACIENTE puede POST /users con rol ADMINISTRADOR, cambiar estados, crear servicios.
2. GET /users y /users/:id devuelven hash de contraseña.
3. Patients/Appointments sin ownership; POST /appointments acepta patient_id arbitrario.
4. GET /services público devuelve inactivos si no hay ?status.
5. Auth: login con credenciales malas = 404; refresh no valida status ni detecta reutilización; cookies secure:false sin sameSite; sin rate limit; sin /auth/me, cambio ni recuperación de contraseña.
6. Citas: solape inclusivo/incompleto, sin transacción (race), filtro por día en TZ del servidor y sin excluir canceladas; sin confirm/cancel/reschedule/complete.
7. console.log(error) en createUserAndPatient; JWT_SECRET sin validación; payload JWT con datos personales; seed admin con clave fija impresa; sin ApiResponse/GlobalExceptionFilter.
8. Duración 15-120 y teléfono único no están en la spec.

## Prioridades
- Fase 2: migración de integridad (`--create-only`, revisar SQL, verificar duplicados antes; si hay, DETENER), estados en inglés, AuditLog, índices/CHECK/EXCLUDE.
- Fase 3 (orden): base común (RolesGuard, filtro de excepciones, ApiResponse paginado) → Auth → Users → Patients → Services → Appointments → resto de módulos.

## Decisiones que requieren a Luis
- Transiciones de cita para ASSISTANT.
- Duración 15-120 y teléfono único: ¿mantener?
- Renombrar estados/campos al inglés (cambia contrato) vs mapear en API.
- Proveedor de correo para recuperación de contraseña.
- Datos públicos (dirección, teléfono, equipo, estadísticas).
- Política del seed admin.
