# Dentissa — Sistema de diseño

**Única fuente visual válida:** las 19 maquetas `docs/DISEÑO-FINAL/Propuesta A - *.dc.html` (estilos en línea, valores
extraídos literalmente) y los materiales de `docs/DISEÑO-FINAL/uploads/` (`requerimientos.md`, `diagramas.md`,
capturas de referencia). `docs/DISEÑO-NUEVO/` y carpetas anteriores quedan **obsoletas**.
Los tokens viven en `frontend-consultorio-dental/src/index.css` (`@theme inline` + `:root`) y se usan con utilidades de
Tailwind v4. Los componentes compartidos están en `src/components/ui/*` y `src/components/shared/*`.

> Nota: `uploads/use_flow_dentissa.pdf` no pudo abrirse en este entorno (falta `pdftoppm`); el flujo se tomó de las
> maquetas y de `requerimientos.md`.

## 1. Tipografía

- Familia: **Nunito Sans** (la misma de las maquetas, Google Fonts `opsz 6..12`, pesos 400/600/700/800).
  Se usa `@fontsource-variable/nunito-sans/opsz.css` (fuente variable con ejes `wght` y `opsz`, familia
  `"Nunito Sans Variable"`), importada en `src/main.tsx`. Justificación: es la fuente exacta de las maquetas; la variable
  con `opsz` reproduce el mismo diseño óptico que el enlace de Google Fonts, sin depender de red externa.
  Se retiró `@fontsource/plus-jakarta-sans` (ya no se importa). `@fontsource-variable/inter` seguía sin usarse.
- Suavizado `antialiased`; interlineado `normal` (las maquetas no fijan `line-height`; solo textarea 1.5 y textos largos 1.45–1.7).
- Escala (px / peso):

| Uso | Tamaño / peso | Notas |
|---|---|---|
| Wordmark sidebar | 24 / 800 | tracking -0.02em, blanco |
| Wordmark acceso / sitio | 26 / 800 | en el sitio: "Denti" `#1f2328` + "ssa" `#fc7186` |
| Título de página `h1` | 28 / 800 | tracking -0.02em |
| Título de acceso `h1` | 38 / 800 | subtítulo 17.5 |
| Hero del sitio | 54 / 800 | tracking -0.03em, interlineado 1.08 |
| Título de sección del sitio `h2` | 38 / 800 | |
| Título de modal | 21 / 800 | |
| Título de tarjeta | 17 / 800 (19 en odontograma y calendario) | |
| Cifra de métrica | 32 / 800 | etiqueta 14.5 / 600 `#6b7280` |
| Texto base / botones / inputs / navegación | 15 / 400–700 | botón 15/700; nav 15/600 (activo 800) |
| Etiqueta de campo | 14.5 / 700 `#374151` (15 en acceso) | en filas con icono: 15 / 600 `#6b7280` |
| Fila de tabla (nombre / resto) | 15.5 / 700 · 15 / 400 | correo bajo el nombre 14 `#6b7280` |
| Cabecera de tabla | 13.5 / 700 `#6b7280` | sin mayúsculas |
| Badge | 13.5 / 700 (13 en cabecera de modal) | píldora |
| Texto secundario | 14–14.5 `#6b7280` | pie de tabla 14.5 |
| Rótulo de sección | 14 / 800 mayúsculas tracking .05em `#6b7280` | "PRÓXIMAS CITAS" |
| Placeholder | `#9aa0a8` | |

## 2. Tokens de color

Los nombres previos (`brand`, `surface`, `ink-*`, `line-*`…) se conservan para no romper pantallas; cambia su valor.
Regla de marca: **relleno rosa = `primary` `#fc7186`**; **texto/icono rosa sobre blanco o rosa suave = `brand` `#e0566c`**
(contraste suficiente). El rosa `#fc7186` no se usa para texto pequeño sobre blanco.

| Token Tailwind | Valor | Uso en las maquetas |
|---|---|---|
| `background` | `#f4f5f7` | Fondo de página y del área de contenido |
| `surface` | `#ffffff` | Topbar, tarjetas, modales, tablas |
| `surface-muted` | `#fafbfc` | Hover de fila de tabla |
| `foreground` | `#1f2328` | Texto principal |
| `ink-2` | `#374151` | Etiquetas de campo, texto de celda, texto de botón secundario |
| `ink-3` | `#4b5563` | Texto de cuerpo, botón contorno, enlaces de pie |
| `ink-4` / `muted-foreground` | `#6b7280` | Texto secundario, cabecera de tabla, iconos de cierre |
| `ink-5` | `#9aa0a8` | Placeholder, iconos de campo, días inactivos |
| `line` / `border` | `#e5e7eb` | Borde de tarjeta, topbar, tabla (línea bajo cabecera), toolbar |
| `line-soft` | `#eceef1` | Cabecera/pie de modal, divisores internos, botón gris |
| `line-row` | `#f0f1f3` | Líneas entre filas |
| `input` | `#d1d5db` | Borde de inputs, selects y botones contorno; switch apagado |
| `primary` | `#fc7186` | Botón primario, sidebar, switch/checkbox activos, día de hoy, foco (borde) |
| `primary-hover` | `#ec5d73` | Hover del botón primario |
| `brand` / `brand-strong` | `#e0566c` | Texto/enlace rosa, ítem activo, "Cerrar sesión" del menú, bloque de fecha |
| `brand-hover` | `#c94459` | Hover de enlaces |
| `brand-soft` | `#fff1f3` | Fondo rosa suave (hover de "Cerrar sesión", icono de tarjeta, bloque fecha, rol Paciente, estado "En curso") |
| `brand-line` | `#fbc6cf` | Borde de pregunta frecuente abierta |
| `brand-wash` | `#fffafb` | Fondo de fila destacada (cita en curso, notificación sin leer) |
| `fill` / `fill-hover` | `#f1f2f4` / `#e7e8eb` | Botones suaves (navegación de calendario, "Ver servicios") |
| `fill-strong` | `#eceef1` | Botón gris de acción de tabla (hover `#e1e4e8`), badge Inactivo |
| `field` | `#f5f6f7` | Campos de solo lectura (Paciente en la cita, Servicio en la consulta) |
| `success` / `success-soft` / `success-soft-hover` / `success-dot` | `#15803d` / `#e9f9ef` / `#d5f3e0` / `#22c55e` | Confirmada, Activo, Vigente, botón "Confirmar" |
| `info` / `info-soft` / `info-dot` | `#1d4ed8` / `#eaf2ff` / `#3b82f6` | Completada |
| `warning` / `warning-soft` / `warning-dot` | `#a16207` / `#fdf6dc` / `#eab308` | Reprogramada, Por vencer |
| `danger` (`destructive`) / `danger-soft` / `danger-strong` / `danger-dot` | `#dc2626` / `#fdecec` / `#b91c1c` / `#ef4444` | Cancelada, errores (texto `danger-strong`), botón Eliminar (`#ef4444`, hover `#dc2626`) |
| `violet` / `violet-soft` | `#7c3aed` / `#f1ebfe` | Rol Administrador |
| `sky` / `sky-soft` | `#0369a1` / `#e6f3fb` | Rol Asistente |
| `neutral-soft` / `neutral-dot` | `#f1f2f4` / `#9ca3af` | Pendiente |
| `sidebar` / `sidebar-foreground` | `#fc7186` / `#ffffff` | Barra lateral (hover `rgba(255,255,255,.16)`) |
| `now` | `#ef4444` | Línea y etiqueta de "hora actual" del calendario |
| `event-*` (+ `-fg`) | pendiente `#e8eaed`/`#374151`; confirmada `#d6f3e0`/`#166534`; completada `#dbe7fd`/`#1e40af`; reprogramada `#fbefc4`/`#854d0e`; cancelada `#fbdcdc`/`#b91c1c` | Eventos del calendario y "Citas de hoy" lateral |

Colores de estado de cita (RF-014): Pendiente gris, Completada azul, Confirmada verde, Cancelada rojo, Reprogramada amarillo.
Barras laterales del Panel por estado: `#9ca3af` / `#93b4f5` (completada) / `#86d9a6` (confirmada) / `#fc7186` (en curso).
Odontograma: ver §9 (SANO blanco, CARIES negro, REMOVIDO rojo, CORONA dorado).

> Conflicto con requisitos: RNF-006 pide tonos rosados "derivados de `#f2b0a6`". Las maquetas finales usan `#fc7186`.
> Se siguió `DISEÑO-FINAL` (instrucción de Luis). Conviene actualizar RNF-006.

## 3. Medidas del layout

| Elemento | Valor |
|---|---|
| Sidebar | 240px, fondo `#fc7186`, padding 24x16, ítems 15px con `gap 12`, padding 11x12, radio 8, separación entre ítems 4; wordmark con padding inferior 30; "Cerrar sesión" al pie (`margin-top:auto`) |
| Ítem activo | fondo `#fff`, texto `#e0566c` peso 800, icono `#fc7186`; inactivo: blanco/600, hover `rgba(255,255,255,.16)` |
| Topbar | 68px, blanca, borde inferior `#e5e7eb`, padding 0 32px; migas "Inicio › Sección" 15px (Inicio `#6b7280`/600 enlace; actual `#1f2328`/800; chevron 15px `#9aa0a8`) |
| Menú de usuario | nombre 15/700 + chevron 16px `#6b7280`; **se abre al pasar el cursor**; panel 200px, blanco, borde `#e5e7eb`, radio 10, sombra `0 10px 30px rgba(0,0,0,.10)`, padding 6; ítems 14.5/600, padding 10x12, radio 6, hover `#f4f5f7`; separador `#e5e7eb`; "Cerrar sesión" `#e0566c` hover `#fff1f3` |
| Contenido | padding 32, separación vertical 24 |
| Rejilla de métricas | 4 columnas, gap 20; tarjeta padding 20x22, borde `#e5e7eb`, radio 10 (12 en el Panel) |
| Listados | tarjeta blanca radio 10 borde `#e5e7eb`; toolbar padding 18x20 gap 12 borde inferior; cabecera de tabla padding 14x24; filas padding 16x24 (14x24 con imagen) borde `#f0f1f3`; pie con paginación padding 16x24 |
| Controles | botón primario 44px radio 8 padding 0 22; acción de tabla 38px radio 8; input/select de modal 46px radio 9; de toolbar 44px radio 8 (mín. 170px el select); botón de icono de tabla 38x38 |
| Modales | 620px (440 confirmar, 460 cancelar cita, 520 diente, 640 servicio/oferta, 680 consulta/pregunta frecuente), radio 16, sombra `0 20px 50px rgba(0,0,0,.16)`, cabecera padding 24x32 borde `#eceef1`, cuerpo 28x32, pie 20x32 borde `#eceef1` con botones a la derecha (gap 12, 44px); overlay `rgba(17,24,39,.4)`; máx. alto 92vh con scroll |
| Acceso | banda rosa 340px sobre `#f4f5f7`; cabecera padding 32x64; tarjeta 480px (600 registro) radio 18 padding 40x44 sombra `0 18px 50px rgba(17,24,39,.10)`; input 52px radio 10; botón 54px radio 10 17/800; divisor `#eceef1` margen 30/24 |
| Sitio web | nav sticky 76px blanca borde `#eceef1` padding 0 64; secciones padding 80–88x64, alternan `#fff` / `#f4f5f7`; botones 46–52px radio 9–10 |
| Toast | abajo-derecha 28px, 380px, blanco, borde `#e5e7eb`, radio 12, sombra `0 16px 40px rgba(0,0,0,.14)`, padding 16x18, icono circular 40px con tinte suave, título 15/800, texto 14 `#4b5563`, cierre 28px |

Sombras: ninguna en tarjetas; `shadow-raised` (menús) `0 10px 30px rgba(0,0,0,.10)`; `shadow-modal` `0 20px 50px rgba(0,0,0,.16)`;
`shadow-toast`; `shadow-auth`; halo de botones del sitio `shadow-glow` y `shadow-cta-hover`
(`0 0 0 4px rgba(252,113,134,.22), 0 0 26px rgba(252,113,134,.65)`).

Estados e interacción (de las maquetas):
- **Hover:** botón primario `#ec5d73`; gris `#e1e4e8`; contorno `#f5f6f7`; fila `#fafbfc`; nav `rgba(255,255,255,.16)`; cierre de modal `#f1f2f4`; eliminar `#dc2626`; "Confirmar" `#d5f3e0`; enlaces `#c94459`; evento de calendario sombra `0 6px 16px -8px rgba(0,0,0,.25)`.
- **Foco:** borde `#fc7186`; en acceso además halo `0 0 3px rgba(252,113,134,.18)` (se aplica a todos los campos como `ring-coral/18`). Las maquetas no definen anillo para botones: se añade `ring-ring/30` por accesibilidad.
- **Deshabilitado / solo lectura:** campo `#f5f6f7` borde `#eceef1` texto `#6b7280`; botones `opacity .5` (no definido en maqueta; añadido por accesibilidad).
- **Animaciones:** transición `.25s` de `box-shadow/border-color` en botones del sitio; carrusel `transform .45s ease`; puntos del carrusel `.3s`; ninguna animación de entrada en panel (se conserva `fade-up` en pestañas) y se respeta `prefers-reduced-motion`.

## 4. Componentes (nombres y APIs conservados)

| Componente | Archivo | Aspecto (DISEÑO-FINAL) |
|---|---|---|
| `Button` | `ui/button.tsx` | `default/primary` rosa 44px; `secondary` gris `#eceef1`; `soft` `#f1f2f4`; `outline` borde `#d1d5db`; `destructive` `#ef4444`; `dangerOutline`, `dangerGhost` (Cancelar cita), `success` (Confirmar), `brand/login` (CTA de acceso 54px, usar `size="great"`), `ghost`, `link`. Tamaños `default 44`, `sm 38`, `xs 36`, `lg 52`, `great 54`, `icon 44`, `icon-sm 38` |
| `Input`, `Textarea`, `Select` (`SelectComponent`, `FilterSelect`), `Checkbox`, `Switch`, `Label` | `ui/*` | 46px radio 9 borde `#d1d5db`; foco rosa; switch 42x24 thumb 18 (activo `#fc7186`); casilla 18px; `FilterSelect` 44px con prefijo de etiqueta |
| `InputForm`, `TextareaForm`, `SelectForm`, `SearchInput`, `FieldError` | `shared/input.component.tsx` | etiqueta arriba (gap 7), `variant="auth"` 52px con "Mostrar/Ocultar" en texto; el prop `icon` se ignora (las maquetas no usan iconos en campos) |
| `FormRow`, `FormRowInput`, `FormRowTextarea`, `FormRowSelect` | `shared/form-row.component.tsx`, `shared/form-row-input.component.tsx` | fila con etiqueta+icono en columna de 150px (se apila en móvil) con el control a la derecha; la usan los modales de Citas, Servicios, Ofertas, Preguntas frecuentes, Consultas y los perfiles |
| `Badge`, `AppointmentStatusBadge`, `ActiveBadge`, `RoleBadge` | `ui/badge.tsx`, `shared/status-badge.component.tsx` | píldora 13.5/700 sin punto de color; estados y roles con la paleta de arriba |
| `TableCard`, `TableToolbar`, `InfoCard` | `shared/table-card.component.tsx`, `shared/info-card.component.tsx` | tarjeta blanca borde `#e5e7eb`; `InfoCard` = tarjeta de datos con icono rosa 38px y título 17/800 |
| `Table*`, `DataTable` (+ `Pagination`) | `ui/table.tsx`, `shared/data-table.component.tsx`, `shared/pagination.component.tsx` | cabecera 13.5/700 gris sin mayúsculas, filas 15px, hover `#fafbfc`; paginación "Mostrando N de T …" + botones **Anterior/Siguiente** (sin números de página, como la maqueta) |
| `Tabs*` | `ui/tabs.tsx` | pestañas subrayadas (Perfil de paciente): gap 28, activa 800 + borde inferior 3px `#fc7186` |
| `Modal`, `Drawer`, `ConfirmDialog` | `shared/modal.component.tsx`, `drawer`, `confirm-dialog` | ver medidas; `Modal` admite `headerExtra` (badge de estatus junto al título); el prop `icon` ya no se dibuja; `ConfirmDialog` sin icono, botones a la derecha, `destructive` = rojo `#ef4444` |
| `EmptyState`, `ErrorState`, `Skeleton`, `RouteFallback` | `shared/*`, `ui/skeleton.tsx` | vacío/error solo texto centrado (17/800 + 15 `#6b7280`); skeleton `#f1f2f4` |
| `PageHeader`, `StatCard`, `InfoRow`, `SectionLabel` (nuevo), `DateBlock` (nuevo) | `shared/*` | título 28/800; `StatCard` sin icono, cifra 32/800 (`tone="brand"` la pinta `#fc7186`, `variant="panel"` radio 12); `DateBlock` 56x58 (`brand`/`muted`/`solid`) |
| `Alert` | `shared/alert.component.tsx` | `error` `#fdecec/#b91c1c`, `success` `#e9f9ef/#15803d`, `warning`, `info` = aviso blanco con icono rosa (Mis citas) |
| Toast | `App.tsx` (`react-hot-toast`) | abajo-derecha, 380px, estilo de la maqueta de Notificaciones |
| `Wordmark`, `BrandMark` | `shared/brand-logo.component.tsx` | `Wordmark` = solo texto (blanco en sidebar/acceso; "Denti"+rosa "ssa" en el sitio). `BrandMark` queda solo como marcador de imagen faltante |
| `SidebarApp`, `Header` | `shared/sidebar.component.tsx`, `shared/header.component.tsx` | ver §3 |
| Iconos de navegación | `shared/nav-icons.component.tsx` | trazados SVG copiados de las maquetas (trazo 1.9, 20px, `currentColor`) |
| Tarjetas móviles | `*-card.component.tsx` (Pacientes, Usuarios, Citas, Servicios, Consultas) | en < 768px `DataTable` (`mobileCard`) muestra tarjetas en lugar de la tabla con scroll; sin avatares ni iniciales. El componente `Avatar` se eliminó |

### Reglas
1. Sin avatares/iniciales en tablas ni listados (petición previa de Luis; DISEÑO-FINAL tampoco los muestra). Excepción visual de las maquetas que **no** son avatares: miniaturas circulares de imágenes de consulta (34px, borde blanco 2px, solapadas -10px, "+N" `#1f2328`) en Consultas y Perfil de paciente, y la miniatura 64x52 (radio 8) de servicios/ofertas.
2. Siempre blanco + rosa + grises suaves; el color de estado nunca es el único indicador (siempre lleva texto).
3. Acciones destructivas: confirmación con `ConfirmDialog`. Las maquetas usan el botón rosa en "Sí, eliminar" (Usuarios/Ofertas/FAQ) y rojo `#ef4444` en "Sí, cancelar cita"; el sistema pinta rojo todo lo `destructive`.
4. Una sola librería de avisos (`react-hot-toast`); errores de formulario en línea con `Alert`/`FieldError`.
5. Estados de carga (skeleton), vacío y error en todo listado; foco visible y `aria-label` en controles solo-icono; textos en español.
6. Etiquetas de `FilterSelect` ("Estatus: Todos") se conservan como contexto, aunque la maqueta muestra solo "Todos los estatus"; las pantallas pueden usar opciones completas en su etapa.

## 5. Navegación por rol

| Rol | Barra lateral (orden) | Inicio |
|---|---|---|
| ADMINISTRADOR | Panel `/dashboard`, Citas `/citas`, Pacientes `/pacientes`, Usuarios `/usuarios`, Servicios `/servicios`, Consultas `/consultas`, Ofertas `/gestionar-ofertas`, Preguntas frecuentes `/gestionar-preguntas`, Notificaciones `/notificaciones`, **Auditoría `/auditoria`** (sin maqueta; se mantiene al final) | `/dashboard` |
| ASISTENTE | Citas, Pacientes, Notificaciones (se quitó Servicios del menú; la ruta sigue protegida por el backend) | `/citas` |
| PACIENTE | Mis citas `/citas`, Mi perfil `/mi-perfil` (Notificaciones solo desde el menú de usuario) | `/citas` |

Menú de usuario (topbar): Ver perfil · Notificaciones · Cerrar sesión. "Ver perfil" lleva a `/mi-perfil` para los tres roles.
Migas de pan: para el PACIENTE dicen "Mis citas" y "Mi perfil"; para ADMIN/ASISTENTE la ruta `/mi-perfil` dice "Perfil" (como las maquetas).
En móvil solo se muestra la sección actual (se oculta "Inicio ›") y el nombre del usuario se trunca para que no se superpongan. La campana y el avatar de la topbar anterior
se retiraron (no están en las maquetas); el conteo de no leídas se conserva como pastilla junto a "Notificaciones" (sidebar y menú).
Se eliminó el grupo "Sitio público" de la barra lateral (no existe en las maquetas; el acceso al sitio es "← Volver al sitio" en el login).

## 6. Inventario maqueta → pantalla → rol → brechas con el backend

Estado: ✅ ruta existente (se rediseña en la etapa indicada) · 🆕 pantalla nueva · ⚠️ requiere decisión.

| # | Maqueta | Ruta / pantalla | Rol(es) | Etapa | Lo que la maqueta exige y el backend NO soporta → adaptación mínima |
|---|---|---|---|---|---|
| 1 | Sitio Web | ✅ `/`, `/sobre-nosotros`, `/nuestros-servicios`, `/ofertas`, `/preguntas-frecuentes`, `/contacto` | Público | Sitio | La maqueta es de una página con anclas; el router ya tiene páginas separadas → mantener rutas y aplicar los estilos. Cifras "15+ años / 2,400 pacientes / 12 tratamientos" y datos de contacto: contenido fijo (`config/clinic-content.ts`), no hay endpoint. Ofertas no aparecen en la maqueta pero RF-018 las exige: se conserva el enlace. Imágenes (`image-slot`) = imágenes reales de servicios/ofertas |
| 2 | Iniciar sesión | ✅ `/login` | Público | Acceso (base hecha) | Checkbox "Recordarme": el backend no tiene sesión persistente opcional → omitir. Enlace "¿Olvidaste tu contraseña?" ✅ `/olvide-mi-contrasena` |
| 3 | Registrarse | ✅ `/registrate` | Público | Acceso (base hecha) | Contraseña "Mínimo 8" vs backend **10 caracteres** (`create-user.dto`) → mantener 10 y corregir el texto de la maqueta. Casilla "Acepto aviso de privacidad y términos": no hay campo, páginas legales ni endpoint → omitir hasta que existan (⚠️ pregunta a Luis). La app pide además confirmar contraseña (extra, se conserva) |
| 4 | Panel | ✅ `/dashboard` (rótulo **Panel**) | ADMIN | 2 | Saludo con nombre del usuario (sin "Dr."). Estatus "En curso": no existe → derivar visualmente de una cita CONFIRMADA cuyo horario contiene la hora actual. Tarjetas "Pacientes nuevos del mes" y "Consultas del mes": `GET /dashboard/stats` solo da citas (hoy/por estatus/próximas), total de pacientes y servicios → "Consultas del mes" ✅ con `GET /consultations?from=` (como hoy); "pacientes nuevos" no existe (omitir o añadir campo al endpoint). Nombre del odontólogo en la agenda: **no hay odontólogo en `Appointment`** → omitirlo. "Por confirmar" ✅ (`PATCH /appointments/:id/confirm`). "Actividad reciente" ✅ (`GET /audit-logs`, ya usado hoy); el texto sale de la acción auditada (no de eventos con paciente/servicio como en la maqueta) |
| 5 | Citas | ✅ `/citas` | ADMIN | 2 | Calendario semana/día/mes + mini calendario con puntos + "Citas de hoy" ✅ (`GET /appointments?from&to`). Tarjetas (hoy / confirmadas de la semana / pendientes / canceladas): no hay endpoint → derivar con consultas por `status` y rango leyendo `total`. **Selector de Estado con cualquier valor**: el backend usa acciones separadas (`confirm`, `complete`, `cancel` con motivo, `reschedule` con motivo+fecha) y **REPROGRAMADA es legacy** (no se asigna; reprogramar deja la cita PENDIENTE) → el selector ofrece solo transiciones válidas por acción; "Reprogramada" se modela como la acción *Reprogramar*. Hora fin = inicio + duración del servicio (solo lectura ✅) |
| 6 | Asistente - Citas | ✅ `/citas` | ASISTENTE | 2 | Idéntica a Citas pero con menú reducido. El backend permite crear/editar/cancelar/reprogramar, **no confirmar ni completar** (solo ADMIN). ⚠️ Decisión pendiente (CLAUDE.md): qué transiciones del ASISTENTE → hasta decidir, el selector solo ofrece Cancelar/Reprogramar |
| 7 | Pacientes | ✅ `/pacientes` | ADMIN | 3 | Columnas "Citas" (conteo) y "Última visita": el listado devuelve solo nombre, correo, teléfono, estatus y `next_appointment_at` → mostrar **Próxima cita** y omitir conteo/última visita. Tarjetas: solo Total y Activos (por `status` + `total`); "Nuevos este mes" y "Con cita próxima" no existen. "+ Nuevo paciente" ✅ (`POST /users` rol paciente + datos de paciente) |
| 8 | Asistente - Pacientes | ✅ `/pacientes` | ASISTENTE | 3 | Igual sin botón "Nuevo paciente" ✅ (backend: crear usuarios es solo ADMIN); ficha reducida ✅ |
| 9 | Perfil de paciente | ✅ `/pacientes/:id` | ADMIN | 3 | **Odontograma ("Datos clínicos") no existe en el backend** (sin modelo ni endpoints; RF-026/027) → no mostrar la pestaña hasta implementarlo (⚠️ pedir backend). "Paciente desde", edad ✅ derivables (`created_at`, `birth_date`). Citas totales ✅ (`/history` total), Última visita ✅ derivable, Próxima ✅. Historial de citas/consultas ✅ (`GET /patients/:id/history?type=`). Miniaturas de imágenes de consulta ✅ (`GET /consultations/:id/images/:imageId`) |
| 10 | Asistente - Perfil de paciente | ✅ `/pacientes/:id` | ASISTENTE | 3 | Muestra consultas y odontograma de solo lectura, pero el backend **niega el historial clínico al ASISTENTE** (`type=consultations` → 403) y no hay odontograma → pestañas: Historial de citas + Datos personales (ficha reducida). ⚠️ Confirmar si el asistente debe ver consultas (cambiaría una regla de permisos) |
| 11 | Usuarios | ✅ `/usuarios` | ADMIN | 4 | Botón **Eliminar usuario**: no hay `DELETE /users` → omitirlo; se desactiva con el switch (`PATCH /users/status/:id`). Tarjetas por rol: derivar de `GET /users?role=` leyendo `total`. Filtros por rol/estatus/búsqueda ✅. Alta/edición ✅ con campos de paciente solo si rol Paciente ✅ |
| 12 | Servicios | ✅ `/servicios` | ADMIN | 4 | Botón **Eliminar servicio**: no hay `DELETE /services` (RF-010) → omitir hasta que exista (⚠️ backend). Duración en horas + minutos ✅ (se guarda `durationMinutes`). 1–3 imágenes ✅. El asistente deja de ver Servicios en el menú |
| 13 | Consultas | ✅ `/consultas` | ADMIN | 4 | Filtro por **servicio** y columna **Odontólogo**: no soportados (`GET /consultations` filtra por búsqueda, paciente y fecha; no hay odontólogo) → omitir. Tarjetas (total / mes / semana / con imágenes): solo `total`; mes/semana con `from/to`; "con imágenes" no existe. Edición: imágenes (máx. 5 ✅), notas ✅, observaciones ✅ |
| 14 | Ofertas | ✅ `/gestionar-ofertas` | ADMIN | 4 | Campo y columna **Descuento** ("20 %", "2x1"): `Offer` no tiene descuento (solo nombre, descripción, imagen, fechas, estatus, servicios) → omitir o añadirlo en descripción; ⚠️ decidir si se crea la columna. Vigente/Por vencer/Vencida derivable de las fechas ✅. Imagen única ✅ (`PUT /offers/:id/image`; RF-019 pide hasta 3). Switch "Publicada" ✅ (`PATCH /offers/:id/status`) y eliminar ✅ |
| 15 | Preguntas frecuentes | ✅ `/gestionar-preguntas` | ADMIN | 4 | Editor de **texto enriquecido** (B/I/U/lista): el backend guarda texto plano sin saneado HTML → usar `Textarea` con contador 100/500 (seguridad). La maqueta no tiene switch de estatus pero el backend sí (`PATCH /faq/:id/status`) → se conserva como extra discreto. Duplicado → 409 ✅ |
| 16 | Notificaciones | ✅ `/notificaciones` | ADMIN, ASISTENTE, PACIENTE | 4 | Botón **Eliminar** por notificación: no hay `DELETE /notifications` (RF-024) → ofrecer "Marcar como leída / todas" ✅ y omitir eliminar. Título por notificación: el backend solo da `type` + `message` → título derivado del tipo. Toast al llegar (RF-023): no hay push; se puede disparar al detectar aumento del contador (`GET /notifications/unread-count`) |
| 17 | Perfil de usuario | 🆕 **`/mi-perfil` también para ADMIN y ASISTENTE** (hoy solo PACIENTE) | ADMIN, ASISTENTE | 4 | Muestra fecha de nacimiento, dirección y teléfono de emergencia: esos datos son **solo de `Patient`**; `User` no los tiene → mostrar Nombre, Apellido, Correo, Teléfono, Rol y "En Dentissa desde" (`created_at` ✅ en `GET /auth/me`). "Modificar datos": el ADMIN puede vía `PATCH /users/:id`; el ASISTENTE no tiene endpoint propio (`PATCH /users/me` inexistente) → solo lectura + cambiar contraseña (`PATCH /auth/password` ✅). Propuesta: la ruta decide el contenido por rol |
| 18 | Paciente - Mi perfil | ✅ `/mi-perfil` | PACIENTE | 4 | Datos y edición ✅ (`GET/PATCH /patients/me`); tres tarjetas "Información personal / Contacto / Emergencia" ✅ |
| 19 | Paciente - Mis citas | ✅ `/citas` (rótulo **Mis citas**) | PACIENTE | 4 | Aviso "puedes modificar/cancelar mientras estén pendientes" ✅ (el backend lo exige). Odontólogo por cita: no existe → omitir. "Cancelar cita" con motivo obligatorio ✅. Estado "No modificable" para cualquier cita no pendiente ✅ |

Pantallas nuevas respecto a hoy: solo **Perfil de usuario** (#17). Panel, Citas, Pacientes, etc. existen con otros nombres/rutas;
las variantes por rol son la misma pantalla con permisos distintos (la regla vive en el backend).

### Rutas
- `/mi-perfil` existe para los tres roles (PACIENTE: "Mi perfil"; ADMIN y ASISTENTE: "Perfil de usuario"). No hay páginas placeholder.

## 7. Decisiones y avisos para Luis
- RNF-006 (paleta `#f2b0a6`) contradice las maquetas (`#fc7186`): se siguió DISEÑO-FINAL.
- Se mantuvo **Auditoría** (sin maqueta) y la pastilla de no leídas (dato real).
- Pagination sin números de página y `StatCard` sin iconos: así lo dibujan las maquetas; los llamadores existentes siguen compilando porque los props se conservaron.
- El `ConfirmDialog` de eliminar usa rojo (las maquetas usan rosa en eliminar y rojo solo en cancelar cita).

## 8. Decisiones y diferencias con las maquetas

Lo que se **omitió o adaptó** porque el backend no lo soporta (la fuente de autoridad es el backend y `docs/spec/`):

- **Recordarme** (Iniciar sesión): no hay sesión persistente opcional.
- **Términos y aviso de privacidad** (Registrarse): no hay campo, páginas legales ni endpoint; se omitió la casilla.
- **Login social / "continuar con..."**: el backend solo autentica con correo y contraseña.
- **Odontograma**: ya existe (ver §9); solo ADMIN.
- **Odontólogo** (citas, agenda, consultas): `Appointment` no tiene odontólogo.
- **Descuento de ofertas**: `Offer` no tiene el campo; solo nombre, descripción, imagen, fechas, estatus y servicios.
- **Eliminar usuarios, servicios y notificaciones**: no existen `DELETE /users`, `/services` ni `/notifications`. Usuarios y servicios se desactivan con el switch; las notificaciones se marcan como leídas.
- **Filtro por servicio en Consultas**: `GET /consultations` no lo admite (solo búsqueda, paciente y fechas).
- **"Con imágenes" en las tarjetas de Consultas**: no hay endpoint; se muestran Total, Este mes, Esta semana y Pendientes de registrar (citas completadas sin consulta).
- **Estadísticas sin endpoint** (p. ej. "Pacientes nuevos del mes", "Con cita próxima", conteo de citas y última visita por paciente): se omitieron; las que se muestran son totales reales leídos de `total` con filtros (`status`, `from`/`to`).

Adaptaciones:

- **Contraseña mínima 10 caracteres** (la maqueta dice 8): el backend exige 10; manda el backend.
- **Selector de estado libre -> botones de transición válidos**: el backend usa acciones separadas (confirmar, completar, cancelar con motivo, reprogramar con motivo y fecha). El detalle de cita solo ofrece las transiciones permitidas al rol. REPROGRAMADA es legacy: reprogramar deja la cita PENDIENTE.
- **Preguntas frecuentes**: texto plano (sin editor enriquecido) con límite de 300 caracteres en la pregunta y **2000 en la respuesta** (la maqueta sugería 100/500); es el límite del backend.
- **Rosa `#fc7186` frente a RNF-006** (`#f2b0a6`): se siguió DISEÑO-FINAL; RNF-006 queda desactualizado (decisión pendiente de confirmar con Luis).
- **Duración de servicio**: un solo campo numérico en minutos (15 a 120) en vez de dos selectores horas/minutos; es la misma regla del backend.
- **Calendario de Citas**: el encabezado sigue la maqueta (mes, anterior/Hoy/siguiente, estatus, vista); la búsqueda por paciente/servicio, que la maqueta no tiene, se colocó junto a los botones de la cabecera de página.
- **Páginas agregadas**: `/mi-perfil` para los tres roles (Perfil de usuario para ADMIN y ASISTENTE; "Modificar datos" solo para ADMIN, el cambio de contraseña para ambos), y Auditoría `/auditoria` (sin maqueta).

## 9. Odontograma

Componente `Odontogram` (`src/features/odontogram/`), dibujado con SVG propio (sin dependencias). 32 dientes FDI en dos arcadas
(superior 18→11 | 21→28, inferior 48→41 | 31→38) con el número visible dentro del diente. Cada diente es un botón enfocable
(`aria-label` "Diente 36, Caries, con nota"; `title` con la nota). Un punto rosa en el diente indica que tiene nota.

| Estado | Color | Relleno / borde / número |
|---|---|---|
| SANO (por defecto) | Blanco | `#ffffff` / `#9aa0a8` / `#1f2328` |
| CARIES | Negro | `#111827` / `#000000` / blanco |
| REMOVIDO | Rojo | `#dc2626` / `#991b1b` / blanco |
| CORONA | Dorado | `#e0b13a` / `#a16207` / `#1f2328` |

- Leyenda de los 4 estados (+ "Con nota") bajo las arcadas. En pantallas estrechas las arcadas hacen scroll horizontal (ancho mínimo 600px).
- Al pulsar un diente (si no es `readOnly`) se abre `ToothEditModal`: estado como radios en botones, nota de máx. 300 con contador,
  zod + react-hook-form; sin cambios avisa "No hay cambios para guardar" sin llamar a la API. Tras guardar actualiza y invalida la query `["odontogram", patientId]`.
- Solo ADMIN (el backend responde 403 al resto). Se usa en: pestaña "Odontograma" del perfil de paciente, y sección colapsable
  "Odontograma del paciente" (`OdontogramSection`) en Registrar consulta y en el Detalle de consulta.
