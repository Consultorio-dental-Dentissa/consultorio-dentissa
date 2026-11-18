# Diseño, interfaz y filtros

## Identidad visual
- Mantén la paleta: blanco, rosa y tonos suaves complementarios. Puedes ajustar tonos, contraste, tipografía, espaciado y bordes.
- Un solo lenguaje de diseño en TODOS los módulos (tokens en el @theme de Tailwind + componentes shadcn/ui compartidos).

## Página pública
Header y navegación, hero, información básica del consultorio, servicios activos, ofertas vigentes, FAQ activas, botones para iniciar sesión, registrarse y solicitar cita, y footer.
- NO inventes dirección, teléfono, horarios ni credenciales: usa datos existentes o un archivo de configuración claramente editable.

## App privada
Layout con menú lateral, header, identificación del usuario, navegación según rol, notificaciones, perfil y cerrar sesión.

## Dashboard admin (datos reales)
Citas del día, pendientes, confirmadas, completadas, canceladas, pacientes registrados, próximas citas y gráficas relevantes.
Usa el patrón ya decidido: GET /dashboard/stats para agregados + listados por endpoint de recurso.

## UX obligatoria
Responsivo, estados de carga, estados vacíos, errores comprensibles, confirmación en acciones destructivas, validaciones visibles, tablas consistentes, modales reutilizables, badges de estado, accesibilidad básica (labels, foco visible, uso con teclado).

## Filtros (en servidor, combinables, con paginación)
- Usuarios: nombre, email, rol, estado.
- Citas: fecha, mes, nombre del paciente, estado.
- Consultas: nombre del paciente.
- Servicios: nombre, estado.
- FAQ: texto de pregunta/respuesta, estado.
- Ofertas: título, estado, fecha de vigencia.
No descargues todo al navegador para filtrar localmente.
