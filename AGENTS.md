# AGENTS.md — Instrucciones para agentes de IA

Este archivo describe las convenciones del proyecto para cualquier agente (IA o humano) que trabaje en el repositorio.

## Estructura del monorepo

```
esqueje/
├── agent/          # Runtime del agente autónomo (Node.js + TypeScript)
│   ├── src/        # Código fuente
│   ├── dist/       # Compilado (ignorado en git)
│   └── constitution.md  # Ética inmutable del agente
├── web/            # Landing y documentación (Next.js)
│   └── src/app/
│       ├── page.tsx              # Landing / producto
│       ├── caracteristicas/      # Descripción profunda de cada módulo
│       └── instalar/             # Guía de instalación y env vars
└── AGENTS.md       # Este archivo
```

## Regla principal: mantener la web sincronizada con el agente

**Cada vez que se modifique o agregue funcionalidad al agente, actualizar la web.**

La web no es un sitio estático decorativo. Es la documentación viva del proyecto.
Si el agente cambia, la web debe reflejar ese cambio antes del próximo push.

### Qué actualizar según el tipo de cambio

| Cambio en el agente | Qué actualizar en la web |
|---|---|
| Nuevo módulo o componente | `caracteristicas/page.tsx` — agregar entrada en el array `modules` |
| Nueva variable de entorno | `instalar/page.tsx` — agregar fila en la tabla `envVars` |
| Cambio en los survival tiers | `instalar/page.tsx` (tabla tiers) + `page.tsx` (cards de tiers) |
| Cambio en el ciclo del agente | `page.tsx` (sección "Ciclo de supervivencia") + `caracteristicas/page.tsx` (bloque de código del loop) |
| Nueva política del policy engine | `caracteristicas/page.tsx` — módulo "Policy Engine" |
| Cambio en comandos de build/run | `instalar/page.tsx` — pasos 01, 02, 03 |
| Nueva dependencia o requisito | `instalar/page.tsx` — sección "Requisitos" |
| Cambio en la constitución | `caracteristicas/page.tsx` — módulo "Constitution" |

## Convenciones de código

### Agente (TypeScript)
- Módulo: función en `agent/src/<módulo>/` con su propio `logger = createLogger('<módulo>')`
- Estado persistente: todo via `db.setKV()` / `db.getKV()`, nunca variables globales
- `node:sqlite` nativo (Node v22.5+), con `--experimental-sqlite` flag
- Tareas del heartbeat: agregar en `heartbeat/tasks.ts` y registrar en `DEFAULT_TASK_SCHEDULES`
- Reglas de política: agregar en `agent/policy-engine.ts`

### Web (Next.js)
- Tema oscuro consistente. Variables CSS en `globals.css` (`--accent`, `--muted`, `--panel`, etc.)
- El `Header` está en `components/Header.tsx` e incluido en `layout.tsx`
- No usar `bg-white` ni colores hardcoded. Usar las variables de tema
- Datos de ejemplo en las páginas son ilustrativos. Dejar nota "Datos ilustrativos" visible

## Archivos que no se tocan sin razón

- `agent/constitution.md` — ética del agente, no se modifica a la ligera
- `~/.esqueje/SOUL.md` — generado en runtime, no se versiona
- `web/dist/` — build de Vercel, ignorado en git

## Flujo de trabajo recomendado

1. Modificar el agente en `agent/src/`
2. Compilar: `cd agent && npm run build`
3. Probar: `node --experimental-sqlite dist/index.js`
4. Actualizar la web según la tabla de arriba
5. Compilar la web: `cd web && npm run build`
6. Commit y push

## Estado actual del agente (v0.3.0)

- **Soul System**: SOUL.md con formato soul/v1 (YAML frontmatter)
- **Heartbeat Daemon**: recursive setTimeout, DurableScheduler en SQLite
- **Survival tiers**: healthy / low_compute / critical / dead
- **Funding strategies**: notificaciones con cooldown por tier
- **Tesorería explícita**: burn mensual, reserva de runway, mínimo sano por agente y seed mínimo para replicación
- **Policy Engine**: 4 reglas (critical block, max size 12%, rate limit 12/h, reserve = runway de emergencia)
- **Agent Loop**: while(true) con sleep/wake events y chequeo de replicación por beneficio mensual + caja mínima
- **SQLite State**: node:sqlite nativo, 7 tablas
- **Constitution**: 3 leyes éticas heredables

Actualizar esta sección cuando cambie la versión del agente.
