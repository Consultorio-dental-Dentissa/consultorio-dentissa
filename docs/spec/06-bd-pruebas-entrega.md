# Base de datos, pruebas y entrega

## Base de datos
1. Revisa el schema de Prisma actual. 2. Corrige relaciones incorrectas o ausentes. 3. Añade restricciones de integridad, índices y unicidad.
4. Relaciones 1:1 y 1:N correctas. 5. Migraciones reproducibles. 6. Sin pérdida de datos. 7. Identificadores en inglés.
- No elimines tablas, columnas ni datos sin evaluar sus dependencias.
- PROHIBIDO resetear la BD o borrar tablas para arreglar migraciones.
- Migración potencialmente destructiva → DETENTE y explica el impacto.

## Pruebas obligatorias
Usuarios y autorización:
- Un paciente no puede crear usuarios administrativos.
- Un usuario desactivado no puede iniciar sesión ni seguir usando una sesión activa.
- Un paciente no puede ver ni modificar datos de otros pacientes.
- Un asistente no puede ejecutar operaciones admin no autorizadas.

Citas:
- No se permiten citas en el pasado ni solapadas.
- PENDING y CONFIRMED bloquean; CANCELLED libera.
- La reprogramación valida el nuevo horario y conserva la trazabilidad.
- COMPLETED no cambia de estado.
- Un paciente no modifica citas confirmadas ni crea citas para otros.
- Reservas concurrentes no producen duplicados (test con peticiones en paralelo).

Consultas:
- No se crea antes de COMPLETED ni dos por cita; máximo 5 imágenes; sin acceso clínico no autorizado.

Servicios y ofertas:
- No se asignan servicios inactivos; los inactivos no salen en la página pública; las ofertas fuera de vigencia no salen; los archivos eliminados o sustituidos se limpian.

Integración: los formularios usan endpoints reales, los datos se refrescan tras mutaciones, se muestran los errores del backend, la UI refleja las restricciones, las notificaciones se generan y se consultan, y las rutas privadas están protegidas.

Ejecuta los tests, el lint y el build disponibles. No inventes resultados.

## Criterios de finalización
Funcionalidades completas, permisos aplicados en el backend, integridad de BD, operaciones desde el frontend, diseño consistente y responsivo, validaciones, notificaciones, auditoría, pruebas críticas en verde, build sin errores y nada simulado. Lo que no se pueda terminar se documenta como pendiente.

## Informe final (`docs/DELIVERY.md`)
1. Resumen. 2. Backend (módulos, endpoints, reglas). 3. Frontend (pantallas, componentes, diseño). 4. BD (schema y migraciones).
5. Seguridad. 6. Pruebas ejecutadas con resultados reales. 7. Pendientes. 8. Instrucciones de ejecución.
