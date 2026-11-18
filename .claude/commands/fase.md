---
description: Ejecuta una fase o módulo del plan de Dentissa (ej. /fase 1, /fase 3 appointments)
argument-hint: <número de fase> [módulo]
---
Trabaja en: $ARGUMENTS

1. Lee `docs/PROGRESS.md` (estado y decisiones) y, si existe, la parte relevante de `docs/DIAGNOSIS.md`.
2. Identifica qué archivo(s) de `docs/spec/` aplican y léelos.
3. Si es la Fase 1: usa el agente `explorer` (puedes lanzar uno para backend y otro para frontend en paralelo) para comparar el código contra TODOS los archivos de `docs/spec/`. Lee los README y `docs/` existentes (nunca `prototipos/`). Escribe `docs/DIAGNOSIS.md` con: stack y patrones detectados, estado de cada requisito (Hecho / Incompleto / Incorrecto / Ausente con rutas) y un plan por módulos. Actualiza PROGRESS.md y detente para que Luis lo revise.
4. Para otras fases, presenta un plan corto del alcance de ESTA sesión y ejecútalo con el ciclo: backend-dev → test-runner → frontend-dev → test-runner → reviewer → corregir los hallazgos críticos e importantes.
5. Si aparece una decisión listada como pendiente en CLAUDE.md o una migración destructiva, detente y pregunta.
6. Al terminar: actualiza `docs/PROGRESS.md` (checklist, decisiones y "Último estado" con el siguiente paso exacto) y propón un commit con Conventional Commits (feat(backend/<módulo>): ...).
