# Documento de Requerimientos — Consultorio Dentissa

> Este documento es la fuente de verdad de QUÉ debe hacer el sistema y CÓMO debe comportarse. Se versiona junto al código. Cualquier cambio de alcance pasa por Pull Request, no por edición directa en `main`.

**Versión:** 1.0 
**Última actualización:** 2026-07-03 
**Responsable:** Luis Enrique Arroyo Romero 
**Estado del documento:** 🟡 Pendiente | 🟢 Completado | 🔴 Cancelado

---

## 1. Contexto y objetivo del proyecto

> El sistema es un software hecho a la medida para un consultorio dental. Permite al administrador gestionar las citas, historial de pacientes, empleados, catalogo de servicios y publicidad. Está pensado para tener el control de todos las necesidades del consultorio en un sistema digital que pueda usarse desde cualquier lugar.

---

## 2. Actores del sistema

Lista de quién interactúa con el sistema y su rol. Esto evita ambigüedad después ("¿quién puede hacer esto?").

|Actor|Descripción|
|---|---|
|Administrador|Usuario que maneja todo en el sistema|
|Asistente|Usuario que maneja la asignación de citas y la información de los pacientes|
|Paciente|Usuario que puede asignarse citas y ver su información clinica|

---

## 3. Alcances:

El sistema permitirá administrar:

- Usuarios.
- Pacientes.
- Citas.
- Consultas.
- Servicios.
- Ofertas.
- Preguntas frecuentes.
- Comentarios de pacientes.
- Historial clinico de pacientes.
- Horarios laborables para citas.
- Notificaciones.

---

## 4. Requerimientos Funcionales (RF)

> Definen QUÉ debe hacer el sistema. Cada uno se escribe como Historia de Usuario + Criterios de Aceptación, con un ID único para trazabilidad.

---

### RF-001: Iniciar sesión

El sistema debe permitir a los usuario iniciar sesión.

#### Actor

Administrador, asistente y paciente

#### Criterios de aceptación

- El sistema debe proporcionar una vista de inicio de sesión donde se soliciten el correo electronico y la contraseña del usuario.
- El sistema debe de verificar si el correo existe en la base de datos.
- Se debe verificar si la contraseña relacionada al correo coincide con la que se envió.
- El sistema debe regresar un token JWT en caso de que el inicio de sesión sea exitoso.

#### Excepciones

El sistema debe regresar un mensaje de error en caso de que se cumplan los siguientes escenarios:

- El correo no existe.
- La contraseña es incorrecta.

#### Flujo principal

- El usuario debe dirigirse a la vista de inicio de sesión.
- El usuario debe ingresar sus datos de acceso en el formulario.
- Debe presionar el boton "Iniciar sesión".
- El sistema debe validar los datos.
- El usuario debe ser dirigido a su panel correspondiente.

---

### RF-002: Registrar usuarios

El sistema permitirá registrar nuevos pacientes.

#### Actor

Administrador, asistente, paciente

#### Entradas

- Nombre
- Apellido
- Telefono
- Telefono de emergencia
- Correo electronico
- Contraseña (8 caracteres minimo)
- Fecha de nacimiento
- Dirección
- Rol

#### Criterios de aceptación

- Si el rol del usuario es `paciente`, los datos de `telefono de emergencia`, `fecha de nacimiento` y `dirección` son obligatorios.
- Si el rol del usuario es `administrador` o `asistente`, los datos de ,`telefono de emergencia`, `fecha de nacimiento` y `dirección` no deben ser solicitados.
- El correo electronico es unico por usuario. Si se intenta registrar a un usuario con un correo ya registrado, el sistema debe rechazarlo e indicar el error.
- El telefono es unico por usuario. Si se intenta registrar un usuario con un telefono ya registrado, el sistema debe rechazarlo e indicar el error.
- La contraseña debe guardarse cifrada.

#### Excepciones

El sistema debe rechazar y mostrar un mensaje acorde si es que se cumplen los siguientes errores:

- Hay un dato incompleto o vacio.
- La contraseña debe tener minimo 8 caracteres.
- El telefono debe tener exactamente 10 caracteres.
- El telefono de emergencia debe tener exactamente 10 caracteres.

#### Flujo principal:

El sistema debe permitir registrar un usuario de dos formas distintas.

1. El administrador podra registrar un usuario de la siguiente manera:
    
    - El administrador entra al modulo de usuarios.
    - El administrador presiona el boton "Registrar nuevo usuario".
    - El administrador capturará la información que solicita el formulario.
    - Presiona "Registrar usuario".
    - El sistema valida los datos.
    - El sistema registra el usuario.
2. Un nuevo usuario podrá crear su propia cuenta (unicamente como paciente):
    
    - El usuario presiona el boton "Registrarse" en el menu principal de la pagina de inicio.
    - El usuario capturará la información que pide el formulario.
    - Presiona "Registrar usuario".
    - El sistema valida los datos.
    - El sistema registra el usuario.

**Prioridad:** Alta **Estado:** ✅ Completado

---

### RF-003: Modificar usuario

El sistema permitirá modificar los datos de un usuario.

#### Actor

Administrador, asistente y paciente

#### Entradas

- Nombre
- Apellido
- Telefono
- Telefono de emergencia
- Correo electronico
- Fecha de nacimiento
- Dirección

#### Criterios de aceptación

- No se puede registrar un correo electronico igual al de otro usuario.
- No se puede registrar un telefono igual al de otro usuario.
- El sistema solo aceptará modificar los siguientes datos: `Nombre, apellido, telefono, telefono de emergencia, correo electronico, fecha de nacimiento y dirección`.

#### Excepciones

Se deben mostrar un mensaje en caso de los siguientes errores:

- Un campo de enviado como vacio.
- El telefono se repite.
- El correo electronico se repite.

#### Flujo principal:

El sistema permitirá dos maneras de modificar los datos se un usuario. El administrador podrá modificar los datos de cualquier paciente mientras que el paciente podrá modificar unicamente sus datos personales.

1. El administrador podrá modificar un usuario de la siguiete manera:
    - El usuario entrará al modulo de usuarios.
    - El usuario presionará el boton "Editar" correspondiente al registro del usuario que desea modificar dentro de la tabla.
    - El usuario cambiará los datos que se desplieguen dentro del formulario.
    - Presionará "Modificar".
    - El sistema validará los datos.
    - El sistema cambiará los datos del usuario.
2. El paciente podrá modificar propios datos de la siguiente manera:
    - El usuario iniciará sesión y pondrá el cursor sobre su nombre de usuario en la parte de superior izquierda.
    - Se desplegará un menu desplegable.
    - El usuario presionará el boton "Mi peril".
    - Dentro del perfil, el usuario presionará el boton "Modificar datos".
    - El usuario modificará los datos del formulario.
    - Presionará "Modificar".
    - El sistema validará los datos.
    - El sistema cambiará los datos del usuario.

**Prioridad:** Media **Estado:** ⬜ Pendiente

---

### RF-004: Cambiar estatus de usuario

El sistema debe permitir que un usuario pueda ser activado o desactivado.

#### Actor

Administrador

#### Criterios de aceptación:

- Los registros de la tabla usuarios debe de tener un boton switch para cambiar el estado de un usuario.
- Si un usuario está desactivado, este no podrá realizar ninguna acción dentro del sistema, incluido el iniciar sesión.
- El sistema debe de mostrar un mensaje de error en caso de que un usuario desactivado quiera realizar cualquier acción.
- El sistema debe de commprobar el estatus de un usuario cada vez que quiera realizar cualquier acción.
- Si se intenta crear una cita con un paciente con estatus desactivado, el sistema debe rechazar el registro de esa cita.

#### Excepciones:

- En caso de que suceda un error inesperado, el sistema debe de mostrar un mensaje de alerta con el error.

#### Flujo principal:

- El usuario debe ingresar al modulo de usuarios.
- El usuario debe de presionar el switch relacionado al registro del usuario cuyo estatus quiere modificar.

**Prioridad:** Media **Estado:** ✅ Completado

---

### RF-005: Ver usuarios

El sistema debe de mostrar todos los usuarios con sus datos.

#### Actor

Administrador, asistente

#### Criterios de aceptacion

- El sistema debe de mostrar todos los usuarios en una lista/tabla.
- El sistema debe hacer un filtrado de usuarios por estatus y rol.
- El sistema debe permitir hacer una busqueda de usuarios por nombre, correo electronico y telefono.
- Si el filtrado de usuarios no encuentra ningun registro, se debe de moostrar el mensaje de "No se encontraron usuarios".
- Los cambios en los datos de los usuarios deben verse reflejados en la tabla posterior a su modificación.
- Cada vez que re registre un nuevo usuario, este debe de aparecer al comienzo de la tabla.

#### Excepciones

- En caso de que el usuario que solicita ver los datos no esté autorizado para hacerlo, el sistema debe de mostrar un mensaje que diga "No tienes permitido realizar esta acción".

#### Flujo principal

- El usuario debe haber iniciado sesión.
- El usuario debe ir al modulo usuarios.
- En la vista del modulo usuarios se verá una tabla con la lista de usuarios.
- El usuario deberá presionar los botones "Administrador", "Asistente" y "Paciente" en la parte superior de la tabla para filtrar a los usuarios por cada rol.
- El usuario deberá escribir en la barra de busqueda en la parte superior de la tabla para filtrar a los usuarios por su nombre, apellido, correo electronico o telefono.

**Prioridad:** Alta **Estado:** 🟨 En progreso

---

### RF-006: Ver perfil de paciente.

El sistema debe permitir que se vea el perfil de un usuario.

#### Criterios de acpetación.

- En el perfil de un paciente, se deben de mostrar los datos del paciente.
- Se debe de mostrar el historial de citas de un paciente.
- Se debe de mostrar el historial de consultas de un paciente.
- Los registros de consultas deben de tener un boton que envie al usuario a mirar la vista de registro de dicha consulta.

#### Excepciones.

- Si el paciente no existe, se debe mostrar una vista que diga "Paciente no encontrado".

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-007: Registrar servicio.

El sistema permitirá registrar nuevos servicios.

#### Actor

Administrador

#### Entradas

- Nombre.
- Precio.
- Duración (en horas).
- Duración (en minutos).
- Imagenes (opcional).

#### Criterios de aceptación

- El sistema debe permitir registrar imagenes en un Drag and Drop dentro del formulario
- Permitirá registrar un minimo de 1 imagen y maximo 3 imagenes por cada servicio.
- El sistema no debe de permitir que se registre más de un servicio con el mismo nombre.
- El servicio no debe durar mas de 2 horas.
- El servicio debe durar minimo 1 minuto.
- El precio del servicio debe ser mayor a 1 peso.
- El precio de debe de guardar en numeros decimales.
- La duración total se debe guardar en el total de minutos (numeros enteros).

#### Excepciones

En caso de que se llegue a cumplir una de las siguientes condiciones, el sistema debe de rechazar el registro del servicio y devolver un error por cada campo incorrecto:

- No se debe permitir un nombre duplicado.
- No se debe permitir que el precio sea menor a 1 peso.
- No de sebe permitir que el tiempo de un servicio sea mayor a 2 horas.
- No se debe permitir que el tiempo de un servicio sea menor a 1 minuto.
- No se debe de ingresar ningun dato en blanco.

#### Flujo principal

- El usuario debe de ingresar al modulo de servicios.
- Presionar el boton "Registrar nuevo servicio".
- Se abrirá un modal con el formulario de servicios.
- El usuario debe capturar los datos que le solicita el formulario.
- Presiona el boton "Guardar".
- El sistema valida los datos.
- Se registra el nuevo servicio.

**Prioridad:** Alta **Estado:** ✅ Completado

---

### RF-008: Modificar servicio

El sistema permitirá modificar los datos de un servicio.

#### Actor

Administrador

#### Entradas

- Nombre
- Precio
- Duración (en horas).
- Duración (en minutos).
- Imagenes.

#### Criterios de aceptación

- El sistema debe permitir modificar todos los datos del servicio.
- Un servicio no puede cambiar su nombre por el de otro servicio.
- El precio debe ser mayor a 1 peso.
- La duración total debe ser minimo 1 minuto y maximo de 2 horas.

#### Excepciones

El sistema debe de mostrar un mensaje de error e indicar el campo del mismo si se cumple alguna de las siguientes condiciones:

- El nombre del servicio no debe repetirse.
- No puede haber campos en blanco.
- El tipo de dato no es valido.

#### Flujo principal

- El usuario debe de ingresar al modulo de servicios.
- En la vista de servicios se desplegará una lista/tabla con todos los servicios.
- El usuario debe presionar el boton "Editar" correspondiente al servicio que se desea modificar.
- Se deben de cambiar los datos del formulario.
- Se debe presionar el boton "Modificar".
- El sistema valida los datos.
- El sistema modifica el servicio.

**Prioridad:** Alta **Estado:** ⬜ Pendiente

---

### RF-009: Cambiar estatus de servicio

El sistema permitirá modificar el estatus de cada servicio.

#### Actor

Administrador

#### Criterios de aceptación

- Cada registro de la tabla/lista de servicios debe tener un switch para cambiar el estatus del servicio.
- Cuando se presione ese switch, se debe de modificar el estatus del sservicio.
- Los servicios con estatus desactivado no deben de aparecer en la lista de servicios que se pueden asignar a una cita.
- Los servicios con estatus desactivado no se podran relacionar con ninguna cita.

#### Excepciones

- En caso de que se intente registrar una cita con un servicio desactivado, el sistema debe rechazarla y regresar un mensaje de error.

#### Flujo principal

- Se debe de entrar el modulo de servicios.
- Se mostrará la tabla con los registros de los servicios.
- Se debe presionar el switch de estatus del servicio que se quiere modificar.

**Prioridad:** Media **Estado:** ⬜ Pendiente

---

### RF-010: Eliminar servicio

El sistema permitirá eliminar servicios que no esten relacionados con ninguna cita.

#### Actor

Administrador

#### Criterios de aceptación

- Cada servicio de la tabla/lista de servicios debe tener un boton "Eliminar".
- Si el servicio que se quiere eliminar esta relacionado con una cita, el sistema debe de rechazar dicha acción.
- Se debe de mostrar una alerta para confirmar la eliminación del servicio.

#### Excepciones

- El sistema debe rechazar eliminar servicios con una cita relacionada, sin importar el estado de esta.
- Se debe devolver un mensaje de error en caso de no encontrarse el servicio que se desea eliminar.

#### Flujo principal

- El usuario debe entrar al modulo de servicios.
- Se verá la tabla/lista de servicios.
- Se debe presionar el boton "Eliminar" del respectivo servicio que se debe eliminar.
- Se debe presionar el boton "Aceptar" en la alerta que solicita la confirmación del usuario para eliminar el servicio.
- El sistema busca el servicio.
- El sistema elimina el servicio.

**Prioridad:** Media **Estado:** ✅ Completado

---

### RF-011: Ver servicios

El sistema debe permitir visualizar los servicios en diferentes presentaciones.

#### Actor

Administrador y paciente

#### Criterios de aceptación

1. El sistema debe de mostrar los servicios con estatus "activo" en la vista publica de la aplicación:
    - Se deben de mostrar todos los servicios disponibles, junto a su descripción e imagenes.
    - Los servicios deben mostrarse en la vista publica del sistema en la sección llamada "Nuestros servicios".
2. El sistema debe de listar los servicios en el panel de administración de servicios del administrador:
    - Los servicios deben estar listados y paginados dentro del panel de administración en la vista del modulo `Servicios`.

#### Flujo principal

Vista principal:

- El usuario debe ingresar a la vista principal de la clinica.
- El usuario debe precionar el boton "Nuestros servicios" en el menu superior o ir a la ruta `/nuestros-servicios`.

Panel de administtración:

- El usuario debe haber iniciado sesión como administrador.
- El usuario debe precionar el boton "Servicios" en el menu lateral de la aplicación o ir a la ruta `/servicios`.

#### Excepciones

- Si no hay servicios, se debe mostrar una vista con el texto: "no se encontrarón servicios".

**Prioridad:** Media **Estado:** ⬜ Pendiente

---

### RF-012: Agendar cita

El sistema debe permitir agendar una nueva cita.

#### Actor

Administrador, asistente y paciente

#### Entradas

- Paciente.
- Servicio.
- Programado para (fecha y hora)

#### Criterios de aceptación

- El sistema debe rechazar el registro de una nueva cita si la hora programamda de esta interrumpe el intervalo de tiempo durante el cual se va a llevar a cabo una cita ya existente.
- El sistema debe permitir que se agende una cita en cualquier espacio de tiempo libre siempre y cuando la duración de esta cita no interrumpa o "choque" con el tiempo durante el cual se llevará a cabo otra cita.
- El sistema solo debe de validar que la nueva cita no "choque" con el horario de una cita cuyo estatus sea diferente a "Cancelada". Es decir, que las citas canceladas no son tomadas en cuenta a la hora de validar el horario al agendar una cita.
- El sistema debe calcular la fecha de finalización de una cita sumandole el tiempo de duración del servicio asignado a esa cita.
- El sistema no debe permitir que un paciente con estatus "desactivado" pueda ser asignado a una nueva cita.
- El sistema solo debe permitir que se asignen citas en los horarios que no están marcados como "No dispobile".
- El sistema no debe permitir que un servicio con estatus "desactivado" pueda ser asignado a una nueva cita.
- El sistema debe de mostrar las citas registradas por dia dentro de una vista de calendario.

#### Excepciones

El sistema debe rechazar y devolver un mensaje de error si se cumplen algunas de estas excepciones:

- El horario de la cita que se quiere agendar interviene en el horario de una cita ya existente.
- El paciente tiene estatus desactivado o no existe.
- El servicio tiene estatus desactivado o no existe.
- El horario de la cita está en una fecha u horario no disponible.

#### Flujo principal

- El usuario debe estar autenticado y debe ir al modulo de citas.
- Presiona el boton "Agendar cita".
- Se abre el modal y el usuario captura los datos en el formulario.
- Presiona "Agendar".
- El sistema valida los datos.
- El sistema registra la cita.

**Prioridad:** Alta **Estado:** 🟨 En progreso

---

### RF-013: Modificar cita.

El sistema debe permitir al usuario modificar los datos de una cita.

#### Actor

Administrador y paciente

#### Entradas

- Paciente.
- Servicio.
- Fecha y hora.
- Estatus.
- Motivo.

#### Criterios de aceptación

Existen diferentes estatus para las citas:

- `Pendiente` (es el estatus predeterminado que se marca una cita al momento de ser agendada).
- `Completada` (es el estado que se marca cuando se completa la cita).
- `Confirmada` (el adminstrador escoje dicho estado cuando confirma una cita).
- `Cancelada` (es el estado que se marca cuando el administrador o paciente cancelan la cita. Se debe de escribir el motivo).
- `Reprogramada (es el estado que se marca cuando el administrador o paciente reprograman la cita para otro horario. Se debe de escribir el motivo).

Existen dos formas especificas de modificar una cita:

Modificar datos generales de la cita: Se tratan de los datos que no tienen que ver con el estatus, el motivo y el horario programado:

- El sistema debe validar que si se escoje un nuevo servicio, el horario de este no choque con el horario de una cita ya agendada.

Modificar estatus y motivo: Se refiere a modificar los datos que tienen que ver con la programación de la cita:

- Si se cambia la fecha y hora, se tiene que marcar como reprogramado y eescribir un motivo.
- El sistema debe valiar que el horario nuevo no choque con el de otra cita.
- Si se marca como "Cancelada" se tiene que escribir el motivo.
- Si se marca como "Confirmada" le debe llegar una notificación al paciente.
- Si se marca como "Completada" se debe de mostrar un nuevo boton en el perfil de la cita llamado "Crear consulta".
- Si la cita estaba previamente marcada como "Cancelada" y se quiere cambiar su estatus a cualquiera de los otros estatus disponibles, el sistema debe validar que el horario de la cita cancelada no "choque" con el horario de cualquier otra cita no cancelada. De lo contrario, no se podrá cambiar el estatus y el horario de la cita se tendra que reprogramar a un horario disponible.

#### Excepciones.

Si se intenta cambiar el estatus de una cita cancelada, se debe validar que el horario de esa cita no interrumpa el horario de otra cita con otro estatus. De lo contrario, el sistema debe rechazar el cambio de estatus.

#### Flujo principal:

- Se tiene que ir al modulo de citas.
- Se tiene que seleccionar la cita quue se quiere modificar.
- Se tiene que presionar el boton "Modificar" dentro de la ventana de la cita.
- Se cambian los datos.
- El sistema valida los datos.
- El sistema modifica los datos de la cita.

**Prioridad:** Alta **Estado:** ⬜ Pendiente

---

### RF-014: Ver citas

El sistema debe permitir que se puedan ver todas las citas.

#### Actor

Administrador y paciente

#### Criterios de aceptación:

- El administrador puede ver todas las citas registradas.
- El paciente solo puede ver sus citas.
- La vista de citas debe de mostrar las citas agendadas para el dia de hoy en una vista de calendario.
- Cuando se precione sobre una cita, la información de esta se debe de mostrar en un modal.
- Debe haber un filtrado en el cual el usuario pueda selecionar una fecha. La vista debe de mostrar las citas de la fecha selecionada.
- Los registros de las citas en el calendario deben de tener un color acorde a su estatus:
    - Pendiente - Gris.
    - Completada - Azul.
    - Confirmada - Verde.
    - Cancelada - Rojo.
    - Reprogramada - Amarillo.

#### Flujo principal:

- El usuario debe entrar a la vista de citas.
- El usuario debe precionar el boton con "Filtrar por fecha" y selecionar la fecha en el calendario desplegable.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-015: Registrar consulta

El sistema debe permitir al adinistrador registrar una consulta para un paciente.

#### Actor

Administrador

#### Entradas:

- Imagenes (maximo 5 por consulta).
- Notas (que se realizó).
- Observaciones (algun dato corto relevante).

#### Criterios de acepcación:

- Una consulta debe estar relacionada con una cita previamente agendada.
- Una consulta solo puede ser creada cuando la cita relacionada tiene un estatus de "Completada".
- En el perfil de la cita debe de haber un boton llamado "Crear consulta" que solo se active cuando la cita tiene estatus "Completada".
- El boton debe de mostrar un formulario que acepte los campos de `notas`, `observaciones` e `imagenes`.
- El campo de imagenes es opcional.
- Solo se pueden registrar un maximo de 5 imagenes por consulta.
- Se debe de registrar la fecha y hora en la cual fue creada la consulta.

#### Excepciones:

- El sistema debe de rechazar el registro si se intentan registrar mas de 5 imagenes.
- El sistema debe de rechazar el registro si el campo `notas` u `observaciones` estan vacios.
- El sistema debe rechazar el registro si la cita relacionada a la consulta tiene un estatus diferente a "Completada".

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-016: Modificar consulta

El sistema debe permitir al administrador modificar los datos de la consulta.

#### Entradas

- Imagenes (maximo 5 por consulta).
- Observaciones.
- Notas.

#### Criterios de aceptación

- Se pueden eliminar y agregar nuevas imagenes. Maximo solo pueden haber 5 por consulta.
- Se pueden modificar las observaciones.
- Se pueden modificar las notas.
- Las imagenes eliminadas guardadas en el servidor deben de eliminarse del mismo para ahorrar espacio.

#### Flujo principal

- El usuario debe haber iniciado sesión como administrador.
- Se debe presionar el boton "Consultas" en el menu lateral.
- Se desplegará la lista de consultas registradas.
- Se debe presionar el boton "Editar" de la respectiva consulta que se quiere modificar.
- Se deben de capturar los nuevos datos de la consulta en el formulario y/o eliminar o subir las nuevas imagenes.
- Se debe presionar el boton "Guardar".
- El sistema valida los datos.
- El sistema modifica los datos de la consulta.

#### Excepciones

- El sistema debe rechazar las consultas que envien mas de 5 imagenes.
- Las imagenes que son eliminadas o reemplazadas por otras no se eliminan del servidor.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-017: Ver consultas

El sistema debe permitir que el administraodr vea las consultas de los pacientes.

#### Actor

Administrador, paciente

#### Criterios de aceptación

1. Vista de consultas del paciente:
    - El paciente debe tener una vista en la que pueda ver unicamnete sus consultas.
    - El paciente NO tiene permitido modificar ningun dato de las consultas. Unicamnete puede ver la información.
2. Vista de consultas del administrador:
    - El administrador debe tener uns vista centralizada donde pueda ver TODAS las consultas de todos los pacientes ordenados por fechas.
    - La vista debe tener un filtrado de consultas por fecha donde el administrador escoja la fecha de las consultas que quiera visualizar en la vista.
    - Si no se seleciona ninguna fecha en especifico, el sistema debe de mostrar por default las consultas mas recientes en orden desendente.
    - Cada registro de consulta debe tener un boton que abra un modal en el cual se permitan ver toda la información de la consulta, como `el paciente`, `el servicio realizado`, `la fecha en que se realizó`, `las imagenes`, `las notas` y las `observaciones`

#### Excepciones:

- Si la consulta que se quiere ver no existe, el sistema debe mostrar una vista de "Consulta no encontrada".

**Estado:** ⬜ Pendiente **Priodidad**: Alta

---

### RF-018: Mostrar ofertas

El sistema debe permitir visualizar las ofertas de servicios en el sistema.

#### Actor

Administrador y paciente

#### Criterios de aceptación

- Las ofertas deben de mostrarse en una vista publica en la sección principal de la aplicación.
- Las ofertas deben de mostrarse y administrarse en el panel de administración del administrador.
- Las ofertas deben de mostrarse en la sección de `ofertas disponibles` en el panel del paciente.
- Tanto el usuario visitante como el paciente solo pueden ver las ofertas con estatus "activa". Solo el administrador puede ber las ofertas con estatus "desactivada".
- Una oferta solo se puede mostrar en la vista principal o en el panel del paciente si cumple estas dos condiciones:
    1. Debe de tener un estatus "activo".
    2. La fecha actual debe estar entre la fecha de inicio y fecha de fin de la oferta.

#### Flujo principal

Vista principal:

- El usuario debe ingresar a la vista principal de la clinica.
- El usuario debe presionar el boton "Ofertas" en el menu superior o ir a la ruta `/ofertas-disponibles`.

Panel de administración:

- El usuario debe haber iniciado sesión como administrador.
- El usuario debe precionar el boton "Ofertas" en el menu lateral de la aplicación o ir a la ruta `/ofertas`.

#### Excepciones

- Una oferta con estatus "desactivada" se muestra en la vista principal o en la vista del paciente.

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-019: Registrar oferta

El sistema debe permitir que se registren nuevas ofertas en el sistema.

#### Actor

Administrador

#### Entradas

- Nombre
- Fecha de inicio
- Fecha de fin
- Descripción
- Imagenes (Maximo 3)
- Estatus (true o false)

#### Criterios de aceptación

- No pueden registrar ofertas con el nombre repetido.
- Las solicitudes de registro de ofertas con mas de tres imagenes deben de ser rechazadas.
- La fecha de inicio de la oferta no puede ser anterior a la fecha actual.

#### Flujo principal

- El usuario debe haber iniciado sesión como administrador.
- El usuario debe ir al modulo `Ofertas` en el menu lateral.
- Se debe presionar el boton `Agregar nueva oferta`.
- El usuario debe capturar los datos en el formulario.
- El sistema valida los datos.
- El sistema registra la nueva oferta.

#### Excepciones

El sistema debe rechazar un intento de regirstro de una nueva oferta y mostrar un mensaje de error si se cumplen cualquiera de las siguientes condicicones:

- La fecha de inicio es anterior a la fecha actual.
- Se intentan registrar mas de 3 imagenes.
- El nombre de la nueva oferta ya está siendo utilizado por otra ya existente (sin importar el estatus de la misma).
- La fecha de fin es anterior a la fecha de inicio de la oferta.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-020: Modificar oferta

El sistema debe permitir que se cambien los datos de la sofertas ya existentes.

#### Actor

Administrador

#### Entradas

- Nombre
- Fecha de inicio
- Fecha de fin
- Descripción
- Imagenes (Maximo 3)
- Estatus (true o false)

#### Criterios de aceptación

- El sistema debe permitir que todos los datos de las ofertas puedan ser modificados.
- No se puede cambiar el nombre de una oferta por el de otra ya registrada.
- El sistema debe permitir que se eliminen o agregen nuevas imagenes.
- El sistema debe de asegurarse que las imagenes eliminadas de una oferta tambien sean eliminadas del servidor para ahorrar espacio.
- El sistema debe permitir que la fecha de inicio de una oferta pueda ser modificada a cualquier otra fecha, incluso si es anterior a la fecha actual.
- No se debe permitir que la fecha de finalización de la oferta sea anterior a la fecha de inicio.
- El sistema debe permitir cambiar el estatus de una oferta.

#### Flujo principal

- El usuario debe haber iniciado sesión.
- El usuario debe dirigirse al modulo de ofertas presionando el boton "Ofertas" del menu lateral o dirigiendose a la ruta `/ofertas`.
- Se mostrarán todas las ofertas registradas.
- Se debe presionar en el boton "Editar" del registro de la oferta que se quiere modificar.
- Se abrirá el modal y el usuario debe capturar los nuevos datos y/o eliminar o subir las nuevas imagenes.
- Se debe presionar el boton "Guardar".
- El sistema valida los datos.
- El sistema modifica los datos de la oferta.

#### Excepciones

Se debe de rechazar una modificación y mostrar un mensaje de error en caso de que se cumplan algunas de las siguientes condiciones:

- La fecha de fin es anterior a la fecha de inicio.
- El nombre que se quiere registrar es igual al de una oferta ya registrada.
- Se intentan registrar mas de 3 imagenes.

**Estado:** ⬜ Pendiente **Prioridad:** Baja

---

### RF-021: Eliminar oferta

El sistema debe permitir eliminar las ofertas

#### Actor

Administrador

#### Criterios de aceptación

- El sistema debe permitir que se elimine cualquier oferta sin importar su estado o fecha de disponibilidad.
- Las imagenes de las ofertas eliminadas deben de ser eliminadas del servidor para ahorrar espacio.
- Se debe mostrar un alerta de confirmación antes de eliminar la oferta.

#### Flujo principal

- El usuario debe haber iniciado sesión como administrador.
- Se debe dirigir al modulo de ofertas presionando el boton "Ofertas" del menu lateral o dirigiendose a la ruta `/ofertas`.
- Se mostrará la vista con la lista de ofertas.
- Se debe presionar el boton "Eliminar" en el registro de la oferta.
- Se debe presionar el boton "Aceptar" en el modal de confirmación.
- El sistema debe eliminar la oferta.

#### Excepciones

- Las imagenes del servidor no se eliminan cuando se elimina la oferta.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-022: Enviar notificaciones

El sistema debe de enviar notificaciones correspondientes a los usuarios cada vez que se haga un movimiento relacionado a sus datos.

#### Actor

Administrador y paciente

#### Criterios de aceptación

El sistema debe enviar una notificación correspondiente a cada usuario dependieno de su rol, ademas, cada usuario debe de tener una vista de notificaciones donde pueda ver todas las notificaciones que ha recibido.

El paciente debe recibir notificaciones cada vez que:

- El administrador cambie el horario y/o estado de una cita (ya sea que la confirme, cancele o reprograme).
- El administrador agende una nueva cita con el paciente.

El administrador debe recibir una notificación cada vez que:

- Se registre un nuevo paciente desde la pagina principal.
- Un paciente cree una nueva cita (esto vale para todos los pacientes del sistema).
- Un paciente cambie el estatus de una cita (ya sea que la cencele o reprograme para otra fecha).

#### Excepciones

- Una notificación no le llega al usuario correspondiente.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-023: Ver notificaciones

El sistema debe permitir que los usuarios vean sus notificaciones.

#### Actor

Administrador y paciente

#### Criterios de aceptación

- El sistema debe brindar a cada usuario una vista centralizada para todas sus las notificaciones.
- Las notificaciones deben de mostrarse ordenadas por fecha y hora de la mas reciente a la mas antigua.
- Las notificaciones deben de mostrarse en un hot toast en el momento en que llegan al usuario.

#### Flujo principal

- El usuario debe haber iniciado sesión.
- El usuario debe presionar el boton "Notificaciones" en la parte superior derecha en el modal desplegable que se muestra cuando se pasa el mouse por el perfil del usuario.
- Se mostrarán las notificaciones en forma de lista.

#### Excepciones

- La notificación no se muestra.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-024: Eliminar notificaciones

El sistema debe permitir que se eliminen notificaciones.

#### Actor

Administrador y paciente

#### Criterios de aceptación

- El sistema debe permitir que el usuario elimine cualquier notificación.
- Debe haber un boton de "Eliminar" en cada registro de notificación.

#### Flujo principal

- El usuario debe haber iniciado sesión.
- El usuario debe haber entrado a la vista de notificaciones.
- El usuario debe presionar el boton "Eliminar" de las respectiva notificación que desea eliminar.

#### Excepciones

- La notificación no se elimina.

**Estado:** ⬜ Pendiente **Prioridad:** Baja

---

### RF-025: Restablecer contraseña

El sistema debe permitir al usuario restablecer su contraseña en caso de haberla olvidado.

#### Actor

Administrador, asistente y paciente.

#### Criterios de aceptación

- En la vista de inicio de sesión debe haber un boton llamado "¿Olvidaste tu contraseña?"
- El sistema debe se solicitar el correo o telefono del usuario antes de solicitar el restablecimiento de la contraseña.
- El sistema debe de enviar un codigo de verificación al telefono o correo para asegurarse de que el usuario real tiene acceso a su correo o telefono.
- El usuario debe de escribir su nueva contraseña.
- El sistema debe de utilizar un token especial para el restablecimiento de la contraseña.
- El tiempo de expiración del token para restablecer la contraseña debe de ser de maximo 3 minutos.
- La nueva contraseña debe guardarse cifrada.

#### Flujo principal

- El usuario debe ir a la vista de iniciar sesión.
- Debe presionar el boton/link llamado "¿Olvidaste tu contraseña?"
- El usuario debe de ingresar su correo o telefono en el formulario y presionar el boton "Recuperar contraseña".
- El sistema debe validar que el telefono o correo exista.
- El usuario será enviado a una vista donde le solicitarán el codigo de verificación que le será enviado a su correo o telefono.
- El usuario debe presionar el boton "Verificar".
- El sistema debe validar que el codigo sea correcto.
- Finalmente, el usuario será dirigido a una vista donde se le solicitará su nueva contraseña en dos inputs de un formulario. La contraseña debe de ser la misma en ambos inputs.
- El usuario debe de presionar el boton "Restablecer contraseña".
- El sistema valida el token y modifica la contraseña del usuario.

#### Excepciones

El sistema debe de responder con un mensaje de alerta adecuado en caso de que se cumplan algunos de los siguientes escenarios:

- El correo ingresado para solicitar el restablecimiento de contraseña o está registrado con ningun usuario.
- El codigo de verificación es incorrecto.
- Las contraseñas de ambos inputs son diferentes.
- El token de restablecimiento de contraseña expira antes de terminar de completar el proceso.

**Estado:** ⬜ Pendiente **Prioridad:** Media

---

### RF-026: Ver odontograma

El sistema debe proporcionar una vista en el perfil del usuario donde se guarden los estados de los dientes de cada paciente.

#### Actor

Administrador y paciente.

#### Criterios de aceptación

- El odontograma debe de mostrarse en una nueva sección llamada "Datos clinicos" de cada paciente.
- El sistema debe permitir que se de click en cada diente y se despliegué un modal donde se muestre la información de cada diente.
- Los dientes deben de tener un color correspondiente al estado de los mismos:
    - Sano (Blanco)
    - Caries (Negro)
    - Extraido (Rojo)
    - Pendiente de revisión (Gris oscuro).

#### Excepciones
- Los dientes no muestran su estado real.

#### Flujo principal

- El usuario debe haber iniciado sesión.
- Se debe ir al panel de pacientes.
- Se debe presionar el boton "Ver perfil" del respectivo paciente que se quiere visualizar.
- Se debe hacer scroll hasta ver el odontograma del paciente.
- Se debe hacer click en algun diente para ver la información anotada sobre cada uno.

**Estado:** ⬜ Pendiente **Prioridad:** Alta

_Nota: Permitir que cada vez que se haga una consulta se guarde una "copia" o imagen de como estaba el odontograma del paciente cuando se creó la consulta._

---

### RF-027: Modificar odontograma

El sistema debe permitir que se guarde información sobre cada diente del paciente en el odontograma.

#### Actor

Administrador

#### Entradas

- Estatus
- Observaciones.

#### Criterios de aceptación

- El sistema debe permitir que se guarde el `estatus` y `observaciones` sobre cada diente del paciente.
- Los estados de los dientes pueden ser:
    - Sano
    - Caries
    - Extraido
    - Pendiente de revisión
- Por defecto, el estado de cada diente es `sano`.
- En el odontograma debe permitir que se de click sobre un diente y en el modal con su información debe haber un boton llamado "Modificar" para que se editen los datos del diente.

#### Excepciones

- Un diente no cambia sus datos.

#### Flujo principal

- El usuario debe haber iniciado sesión.
- Se debe presionar el boton "Pacientes" en el menu lateral.
- Se debe presionar el boton "Ver perfil" de algun paciente.
- Se debe hacer scroll hasta la sección de "Datos clinicos".
- Se debe presionar sobre un diente y se abrirá un modal con la información del mismo.
- Se debe presionar el boton "Modificar".
- Se debe cambiar la información del diente.
- Se debe presionar el boton "Guardar".
- El sistema guarda los datos.

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-028: Registrar preguntas frecuentes.

El sistema debe permitir que se registren preguntas y sus respuestas para que se muestren en la sección de publicidad de la vista principal de la clinica.

### Actor

​Administrador

### ​Entradas

​Pregunta (Texto corto). ​Respuesta (Texto enriquecido).

#### Criterios de aceptación

- Únicamente el administrador puede hacer una pregunta frecuentes y responder la misma.
- Las preguntas frecuentes solamente puede tener una sola respuesta por el admin.
- El sistemas debe dejar que todos los usuarios visualizen las preguntas frecuentes y la respuesta
- La pregunta frecuente no debe exceder los 100 caracteres
- La respuesta no puede exceder los 500 caracteres.
- No existirá limite de preguntas frecuentes.
- El sistema no debe permitir registrar dos preguntas idénticas (validación de unicidad por texto de pregunta).
- El sistema denegará cualquier intento de creación, edición o eliminación de preguntas si el usuario no posee el rol de Administrador.
- El sistema validará en tiempo real que no exista una pregunta idéntica en la base de datos (case-insensitive); en caso de coincidencia, bloqueará la acción y mostrará un mensaje de error: "La pregunta ya existe en el sistema".
- El sistema no debe presentar límites máximos en la cantidad total de preguntas frecuentes, garantizando el rendimiento del despliegue mediante una paginación de resultados.

#### Flujo principal

- El usuario debe haber iniciado sesión como administrador.
- Se debe presionar el boton "Preguntas frecuentes" en el menu lateral.
- Se debe presionar el boton "Registrar pregunta frecuente".
- Se desplegará un modal con el input de pregunta y respuesta.
- Se debe presonar el boton "Guardar".
- El sistema valida los datos.
- El sistema registra la nueva pregunta frecuente.

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-029: Ver preguntas frecuentes

El sistema debe permitir a los usuarios ver las preguntas frecuentes y sus respuestas.

#### Actor

Administrador y paciente.

#### Criterios de aceptación

Las preguntas frecuentes podrán ser visualizadas de dos maneras diferentes:

Vista principal del sistema:

- El sistema debe permitir que los usuarios invitados vean las preguntas frecuentes en la sección de publicidad.
- Los invitados y pacientes no deben poder administrar las preguntas frecuentes, unicamente deben podre visualizarlas.

Panel de administración:

- Las preguntas freuentes deben de tener listarse en la vista del modulo de preguntas frecuentes.
- Las preguntas frecuentes debe mostrarse en forma de lista.
- Las preguntas deben de llegar al frontend paginadas.

#### Excepciones

- En caso de que no haya preguntas registradas, el sistema debe mostrar un mensaje de "No hay preguntas frecuentes registradas".

#### Flujo principal

Vista principal:

- El usuario debe entrar a la vista principal del sistema.
- Se debe ir a la sección de preguntas frecuentes.
- Se mostrarán las preguntas frecuentes.

Panel de administración:

- El usuario debe iniciar sesión como administrador.
- El usuario presionar el boton "Preguntas frecuentes" en el menu lateral.
- Se listarán las preguntas frecuentes en la vista del modulo.

**Estado:** ⬜ Pendiente **Prioridad:** Alta

---

### RF-030: Modificar pregunta frecuente

El sistema debe permitir al administrador modificar los datos de una pregunta frecuente.

#### Actor

Administrador

#### Entradas

- Pregunta
- Respuesta

#### Criterios de aceptación

- El sistema debe permitir modificar cualquier pregunta y respuesta registrada.
- No se debe permitir que se registre una pregunta igual a otra ya registrada.

#### Excepciones

Si se cumplen algunos de estos escenarios, el sistema debe rechazar la consulta y mostrar un mensaje de error:

- La pregunta frecuenta es igual a otra ya registrada.
- Alguno de los dos campos llegan vacios.

#### Flujo principal

- El usuario debe haber iniciado sesión como administrador.
- El usuario debe dirigirse al panel de Preguntas frecuentes.
- El usuario debe presionar el boton "Editar" de la respectiva pregunta que desea modificar.
- Se abrirá un modal con el formulario.
- El usuario debe cambiar los datos registrados.
- Se debe presionar el boton "Modificar".
- El sistema validará los datos.
- La pregunta frecuente será modificada.

**Estado:** ⬜ Pendiente **Prioridad:** Baja

---

### RF-031: Eliminar pregunta frecuente

El sistema permitirá eliminar cualquier pregunta frecuente.

#### Actor

Administrador

#### Criterios de aceptación

- Cada pregunta frecuente de la tabla/lista debe tener un boton "Eliminar".
- Se debe de mostrar una alerta para confirmar la eliminación del registro.
- El sistema no debe permitir que los usuarios con nivel diferente a `administrador` eliminen una pregunta.

#### Excepciones

- Se debe devolver un mensaje de error en caso de no encontrarse la pregunta que se desea eliminar.

#### Flujo principal

- El usuario debe entrar al modulo de Preguntas frecuentes.
- Se verá la tabla/lista de preguntas frecuentes.
- Se debe presionar el boton "Eliminar" del respectivo registro que se debe eliminar.
- Se debe presionar el boton "Aceptar" en la alerta que solicita la confirmación del usuario para eliminar la pregunta.
- El sistema busca el registro.
- El sistema elimina el registro.

**Prioridad:** Baja **Estado:** ⬜ Pendiente

---

## 5. Requerimientos No Funcionales (RNF)

> Definen CÓMO debe comportarse el sistema: seguridad, rendimiento, disponibilidad, usabilidad, escalabilidad. Igual de importantes que los RF — muchas veces más críticos, especialmente si el sistema maneja datos sensibles.

### RNF-001: Tiempo de respuesta de la API

**Descripción:** Las peticiones a endpoints de lectura (GET) deben responder en menos de 300ms bajo carga normal (< 100 usuarios concurrentes). 

**Categoría:** Rendimiento 

**Prioridad:** Media 

**Justificación:** Tiempos de respuesta lentos afectan directamente la operación diaria del consultorio — por ejemplo, al consultar el calendario de citas o el historial de un paciente durante la atención en el mostrador.

---

### RNF-002: Paginación de datos

**Descripción:** La API debe devolver los listados (usuarios, citas, servicios, consultas, etc.) paginados. El frontend debe mostrar los datos paginados en las vistas correspondientes. 

**Categoría:** Rendimiento 

**Prioridad:** Media 

**Justificación:** Sin paginación, listados que crecen con el tiempo (ej. historial de citas o consultas) degradan el rendimiento de la API y de la interfaz a medida que el consultorio acumula más pacientes.

---

### RNF-003: Auditoría de movimientos de usuarios

**Descripción:** El sistema debe registrar en logs los movimientos relevantes de los usuarios (creación, modificación y eliminación de registros). Adicionalmente, se debe contar con un mecanismo de auditoría que permita configurar alertas ante actividad no esperada. 

**Categoría:** Seguridad 

**Prioridad:** Media 

**Justificación:** El sistema maneja datos clínicos de pacientes; un registro de auditoría permite rastrear quién hizo qué cambio y cuándo, algo necesario tanto para depurar errores como para responsabilidad legal sobre el manejo de datos sensibles de salud.

---

### RNF-004: Cifrado de datos sensibles

**Descripción:** Las contraseñas deben almacenarse con hash (bcrypt o argon2), nunca en texto plano. 

**Categoría:** Seguridad 

**Prioridad:** Alta 

**Justificación:** El sistema almacena datos personales y clínicos de pacientes (incluyendo el odontograma e historial de consultas), que en México están protegidos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Una filtración de credenciales es la puerta de entrada más común a una filtración de datos clínicos completa.

<!-- ⚠️ Luis: si en algún momento el sistema procesa pagos en línea, este RNF necesita una cláusula adicional sobre cómo se manejan esos datos (normalmente delegándolos a un proveedor externo certificado PCI-DSS, nunca almacenándolos tú mismo). Lo quité de aquí porque no vi "pagos" en la sección de Alcances — confírmame si aplica. -->

---

### RNF-005: Disponibilidad del sistema

**Descripción:** El sistema debe tener un uptime objetivo de 99.5% mensual. 

**Categoría:** Disponibilidad 

**Prioridad:** Media 

**Justificación:** El sistema es el único medio para agendar y consultar citas; una caída prolongada impide operar al consultorio (tanto para el personal como para pacientes que agendan por su cuenta).

---
### RNF-006: Diseño y paleta de colores

**Descripción:** El sistema deberá tener una paleta de colores con tonos blancos, grises claros y rosados.

**Colores:**
- Los tonos rosados deben de tener derivados del color: #f2b0a6
- Los tonos grises deben de tener devidados del color: #fffff

**Categoria:** Diseño

**Justificación**: El sistema debe seguir las pautas del diseño y paleta de colores que utiliza el negocio de la clinica.

---

## 6. Fuera de alcance (Out of Scope)

> Tan importante como definir qué SÍ incluye el sistema es dejar explícito qué NO incluye, para evitar expectativas mal alineadas dentro del equipo.

<!-- ⚠️ Luis: esta sección venía con ejemplos de la plantilla de e-commerce (pasarela de pago, app móvil, recomendaciones con IA) que no verifiqué contra tu proyecto real, así que los quité en vez de dejarlos como si fueran ciertos. Complétala con el equipo: ¿qué se discutió y se decidió NO construir en esta fase? (ej. ¿habrá app móvil nativa? ¿pagos en línea? ¿facturación electrónica?) -->

---

## 7. Glosario

|Término|Definición|
|---|---|
|Odontograma|Representación visual del estado de cada diente de un paciente, con estatus como Sano, Caries, Extraído o Pendiente de revisión (ver RF-026 y RF-027)|
|Consulta|Registro creado tras completar una cita, con notas, observaciones e imágenes de lo realizado (ver RF-015)|
|Cita|Espacio de tiempo agendado entre un paciente y un servicio, con estatus Pendiente, Confirmada, Completada, Cancelada o Reprogramada (ver RF-012 y RF-013)|

---

## 8. Historial de cambios

|Fecha|Autor|Cambio|
|---|---|---|
|2026-07-14|Luis Enrique Arroyo Romero|Creación del documento|

---

## Convenciones de este documento

1. Cada RF y RNF tiene un **ID único** (`RF-00X`, `RNF-00X`) que nunca se reutiliza, incluso si el requerimiento se elimina — esto mantiene la trazabilidad histórica. Antes de asignar un ID nuevo, verifica con `Ctrl+F` que no esté ya usado en otra sección del documento.
2. Cuando conviertas un requerimiento en tarea de GitHub Projects, referencia el ID en el título del Issue: `[RF-012] Agendar cita`.
3. Cuando hagas un commit o PR relacionado, referencia el ID en la descripción: `Closes #45 — implementa RF-012`.
4. Este archivo vive en `/docs/requerimientos_consultorio.md` dentro del repo y se actualiza vía Pull Request, no edición directa — así queda registro de quién propuso el cambio y por qué.