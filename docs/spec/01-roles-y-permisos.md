# Roles y permisos

Todas las restricciones se aplican en el backend, aunque el frontend oculte las acciones.

## ADMIN
- CRUD de usuarios de cualquier rol; activar/desactivar usuarios y pacientes.
- Consultar y modificar perfiles de pacientes; ver historial de citas y consultas.
- Citas: crear, consultar, confirmar, cancelar, reprogramar, marcar como completadas.
- Consultas: crear, consultar, modificar cuando las reglas lo permitan.
- Servicios: crear, consultar, modificar, activar/desactivar.
- Administrar FAQ y ofertas. Ver sus notificaciones. Dashboard administrativo.

## ASSISTANT
- Listar pacientes; ver ficha individual limitada a lo necesario para sus funciones.
- Crear citas para pacientes y consultarlas.
- Cambiar estados de citas SOLO según permisos expresamente autorizados.
- La especificación NO define sus transiciones. No asumas permisos de ADMIN. Conserva restricciones documentadas; si no hay, PREGUNTA a Luis.

## PATIENT
Puede:
- Registrarse, iniciar y cerrar sesión, ver su perfil.
- Modificar solo: email, contraseña, teléfono y teléfono de emergencia.
- Ver sus citas; crear citas solo para sí mismo.
- Cancelar o reprogramar sus citas mientras no estén confirmadas.
- Ver sus notificaciones.

No puede:
- Ver datos privados de otros pacientes ni crear citas para otros.
- Modificar información clínica o administrativa.
- Modificar citas CONFIRMED, COMPLETED o CANCELLED.
- Acceder a funciones administrativas.
