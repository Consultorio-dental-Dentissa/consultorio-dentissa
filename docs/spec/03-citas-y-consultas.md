# Citas (Appointments) y consultas (Consultations)

## Citas
Relaciones/campos: patient, service, startAt, endAt, status, notes, auditoría.

### Duración y disponibilidad
- endAt = startAt + service.durationMinutes. Nunca asumas duración fija.
- Prohibido crear citas en el pasado.
- PENDING y CONFIRMED bloquean su intervalo. CANCELLED no bloquea.
- Dos citas que bloquean no pueden solaparse: `existingStart < requestedEnd && existingEnd > requestedStart`.
- Validación en backend, no solo en frontend.
- Prevenir condiciones de carrera (dos reservas simultáneas). Con PostgreSQL considera una restricción EXCLUDE con `tstzrange` + `btree_gist` filtrada por estados que bloquean (migración SQL manual con `--create-only`), o una transacción con bloqueo adecuado. Documenta la elección en PROGRESS.md.
- Reprogramar libera el intervalo anterior y reserva el nuevo de forma atómica.

### Estados
- PENDING: inicial; bloquea; se puede confirmar, cancelar o reprogramar según permisos.
- CONFIRMED: el admin la aceptó; notifica al paciente; bloquea; el paciente no puede modificarla; el admin puede cancelar o completar.
- CANCELLED: libera horario; motivo obligatorio; aplicable incluso a confirmadas. Si cancela el paciente → notificar al admin; si cancela el admin → notificar al paciente. No se reactiva sin una operación explícita y autorizada.
- RESCHEDULED: evalúa implementarlo como OPERACIÓN con historial (manteniendo PENDING/CONFIRMED) en lugar de estado. Debe pedir un nuevo horario disponible, exigir motivo, registrar horario anterior y nuevo y usuario responsable, actualizar la disponibilidad atómicamente y notificar. Si cambias el modelo de estados, adapta backend, frontend, docs y tests, y registra la decisión.
- COMPLETED: final, no vuelve a otro estado; habilita crear la consulta.

### Formulario
Paciente, servicio, fecha, hora de inicio, notas.
- Si el usuario es PATIENT: se asigna automáticamente su Patient. El backend IGNORA cualquier patientId enviado por un PATIENT.

### Calendario
Amplio, moderno y responsivo: navegación por meses, días con citas marcados, colores por estado, selección de día → modal con las citas del día → detalle → acciones según permisos. Filtros: paciente, fecha, estado.

## Consultas
- Máximo una por cita (unique appointmentId en BD). Solo si la cita está COMPLETED.
- Creación protegida por permisos; registrar quién la creó.
- Campos: description y dentistObservations (texto largo, sin límite arbitrario), imágenes opcionales, createdAt, updatedAt.
- Máximo 5 imágenes; valida cantidad, tamaño y formato en frontend y backend.
- Imágenes almacenadas de forma privada; servidas solo con autorización (nunca como estáticos públicos).
- UI: historial clínico del paciente según permisos.
