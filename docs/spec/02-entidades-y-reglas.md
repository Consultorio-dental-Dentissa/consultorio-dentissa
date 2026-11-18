# Entidades y reglas de negocio (excepto citas y consultas)

Entidades mínimas: Users, Patients, Services, Appointments, Consultations, FAQ, Offers, Notifications.
Más las auxiliares necesarias (auditoría, archivos, historial de estados). No crees tablas sin necesidad: evalúa primero el modelo existente.

## Users
Campos: firstName, lastName, email, phone, passwordHash, role, status, createdAt, updatedAt.
- Email único. Hash de contraseña seguro.
- Estado activo/desactivado. Un usuario desactivado no puede iniciar sesión NI seguir usando sesiones abiertas (revocar/validar en cada request).
- ADMIN activa/desactiva.
- Cambio de email seguro: sin duplicados ni accesos indebidos.
- El registro público solo crea PATIENT; nadie puede asignarse un rol privilegiado por esa vía.
- Registrar auditoría.

## Patients
- Relación 1:1 con User garantizada por restricción de BD (unique en userId). Cada PATIENT tiene exactamente un Patient.
- Campos: userId, birthDate, emergencyPhone + los existentes necesarios.
- ADMIN consulta/modifica el perfil y ve citas y consultas asociadas.
- El paciente solo modifica los campos autorizados.
- UI: tabla, búsqueda y filtros, perfil, edición según permisos, historial de citas y de consultas. Todo desde la API.

## Services
Campos: name, description, durationMinutes, price, status, images, createdAt, updatedAt.
- name único; durationMinutes > 0 (en minutos totales); price >= 0; entre 1 y 5 imágenes.
- Servicios inactivos: no se asignan a citas nuevas ni aparecen en el catálogo público.
- Solo ADMIN crea/modifica.
- Endpoint público: solo activos. Endpoints admin: activos e inactivos.
- Al quitar o sustituir imágenes, borra los archivos sin referencias.
- No borres físicamente servicios con citas/consultas históricas: desactívalos.
- Cambiar la duración NO altera citas ya reservadas.

## FAQ
Campos: question, answer, status, createdAt, updatedAt.
- ADMIN: crear, consultar, modificar, eliminar, activar/desactivar.
- Pública: solo activas. Endpoints públicos y admin separados.

## Offers
Campos: title, description, image, startDate, endDate, status, createdAt, updatedAt.
- Solo informativas: sin pagos, cobros ni canjes.
- startDate <= endDate.
- Pública solo si está activa y la fecha actual está dentro de la vigencia (filtra el backend).
- ADMIN: crear, consultar, modificar, activar/desactivar, eliminar. Gestiona correctamente los archivos de imagen.
