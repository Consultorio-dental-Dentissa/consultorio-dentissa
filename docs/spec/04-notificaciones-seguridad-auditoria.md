# Notificaciones, autenticación/seguridad y auditoría

## Notificaciones (persistentes)
Se generan como mínimo cuando: el admin confirma, el admin cancela, el paciente cancela, el admin reprograma o el paciente reprograma.
Campos: recipient, eventType, message, relatedEntity (tipo + id), createdAt, readAt/isRead.
- Cada usuario ve solo las suyas; puede marcarlas como leídas.
- No se necesitan WebSockets si no existen: basta con polling (p. ej. refetchInterval de TanStack Query).
- Créalas dentro de la misma transacción que la operación de negocio: nunca notifiques operaciones fallidas.

## Autenticación
Registro, login, logout, usuario actual, cambio de contraseña, protección de rutas, autorización por roles.
Reutiliza el sistema existente (JWT + refresh tokens con rotación y detección de reutilización).

### Recuperación de contraseña
1. El usuario la solicita. 2. Se genera un token criptográficamente seguro. 3. Se envía enlace/código por correo.
4. Expira. 5. Es de un solo uso. 6. El usuario fija una nueva contraseña. 7. El token se invalida.
- Guarda solo el hash del token, nunca en texto plano.
- Misma respuesta exista o no el email.
- Si no hay servicio de correo configurado, usa un transporte configurable por variables de entorno y documéntalo como pendiente; no lo simules como completo.

### Seguridad general
Validación de entradas, autorización en cada operación, prevención de acceso a recursos ajenos (verificar propiedad), credenciales seguras, archivos clínicos protegidos, sesiones seguras, CORS restringido, errores sin información sensible, rate limiting en endpoints de autenticación.

## Auditoría
Registrar: creación/modificación/activación/desactivación de usuarios; creación/modificación de servicios; creación, confirmación, cancelación, reprogramación y finalización de citas; creación/modificación de consultas; otros cambios administrativos relevantes.
- No basta con un campo tipo `realizedByUserId`. Usa una tabla de historial (AuditLog): entity, entityId, action, userId, timestamp, cambios relevantes (JSON).
- Usa createdByUserId/updatedByUserId donde aporten valor.
- Nunca guardes contraseñas, tokens ni datos médicos innecesarios en la auditoría o en los logs.
