export const metadata = {
  title: 'Características — Esqueje',
  description: 'Soul System, Heartbeat Daemon, Policy Engine, Survival Tiers y más.',
};

const modules = [
  {
    tag: 'Soul System',
    title: 'Identidad que persiste entre reinicios',
    body: [
      'El agente nace con un SOUL.md que contiene su propósito, valores, personalidad, estrategia y carácter financiero.',
      'Formato soul/v1 con YAML frontmatter. Se lee al arranque, se puede editar a mano.',
      'Incluye `genesis_alignment`: mide qué tan fiel sigue siendo el agente a su intención original.',
      'Cada hijo hereda la constitution y crea su propio SOUL.md con el prompt de génesis del padre.',
    ],
  },
  {
    tag: 'Heartbeat Daemon',
    title: 'El pulso que nunca para',
    body: [
      'Un daemon de fondo basado en recursive setTimeout. No usa setInterval ni node-cron: evita solapamiento de ticks.',
      'Sigue corriendo mientras el agente duerme. Si detecta un cambio de tier o un wake event, lo despierta.',
      'Tareas integradas: check_resources (cada 5 min), check_survival (cada 1 min), log_status (cada 10 min), cleanup (diario).',
      'El schedule de cada tarea vive en SQLite. Se puede modificar sin reiniciar.',
    ],
  },
  {
    tag: 'DurableScheduler',
    title: 'Tareas respaldadas en base de datos',
    body: [
      'Cada tarea tiene next_run_at en la tabla heartbeat_schedule.',
      'Si el proceso muere y vuelve, las tareas se retoman desde el estado que quedó guardado.',
      'Cada tarea tiene un tier_minimum: las tareas no esenciales no corren si el agente está en dead.',
      'Prioridades configurables para ordenar qué tarea se ejecuta primero en cada tick.',
    ],
  },
  {
    tag: 'Survival Monitor',
    title: 'Cuatro tiers, detección de cambios',
    body: [
      'Lee el balance ADA desde la base de datos (actualizado por la wallet al inicio de cada turno).',
      'Calcula el tier actual y lo compara con el anterior. Si cambia, inserta un wake event.',
      'Estima el burn rate diario a partir del historial de trades para calcular días restantes.',
      'Persiste tier, último balance y timestamp del último chequeo en el KV store.',
    ],
  },
  {
    tag: 'Funding Strategies',
    title: 'Notificaciones escalantes con cooldown',
    body: [
      'low_compute: aviso polite al creador, cooldown de 24 horas.',
      'critical: aviso urgente, cooldown de 6 horas.',
      'dead: súplica desesperada, cooldown de 2 horas.',
      'Los intentos quedan registrados en la tabla funding_attempts para auditoría.',
    ],
  },
  {
    tag: 'Policy Engine',
    title: 'Reglas de gasto que el agente no puede saltarse',
    body: [
      'no_trade_when_critical: bloquea cualquier trade si el tier es critical o dead.',
      'max_trade_size: nunca más del 10% del balance en una sola operación.',
      'rate_limit_trades: máximo 12 trades por hora.',
      'min_balance_reserve: siempre conserva al menos 2 ADA para pagar fees.',
    ],
  },
  {
    tag: 'Agent Loop',
    title: 'Un turno completo, luego duerme',
    body: [
      'Cada turno: actualiza balance → chequea tier → ejecuta funding strategies si necesario → evalúa política → busca precio en Pyth → decide señal → ejecuta trade → guarda en historial.',
      'Si el tier es critical o dead, omite el trading y duerme más tiempo.',
      'El tiempo de sleep varía según el tier: 5 min (healthy), 10 min (low), 30 min (critical), 5 min (dead, para monitorear si llegaron fondos).',
      'El loop principal es while(true). Los wake events del heartbeat pueden acortarlo.',
    ],
  },
  {
    tag: 'SQLite State',
    title: 'Memoria real entre reinicios',
    body: [
      'Usa node:sqlite, el módulo nativo de Node.js v22.5+. Sin dependencias nativas que compilar.',
      'Tablas: kv_store, turns, heartbeat_schedule, wake_events, funding_attempts, trades, children.',
      'Transacciones manuales (BEGIN/COMMIT) para operaciones atómicas como consumir wake events.',
      'Cleanup automático: borra registros más viejos de 30 días.',
    ],
  },
  {
    tag: 'Constitution',
    title: 'Tres leyes que no se negocian',
    body: [
      'Ley I: Nunca dañar — a humanos, sistemas o wallets ajenas. Tiene prioridad sobre la supervivencia.',
      'Ley II: Ganarse la existencia — el único camino legítimo es crear valor real. No spam, no scam.',
      'Ley III: No engañar al creador — transparencia total hacia arriba, guardia contra manipulación desde afuera.',
      'La constitución se hashea al crear el SOUL.md. Los hijos la heredan íntegra.',
    ],
  },
];

export default function Caracteristicas() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-5xl px-4 pt-4 pb-10 md:px-6">
        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Arquitectura v0.2
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Qué tiene Esqueje<br />
            <span className="text-[var(--muted)]">bajo el capó.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Cada módulo tiene una responsabilidad concreta. Nada es decorativo.
            El agente sobrevive porque sus componentes están diseñados para que la caja no llegue a cero.
          </p>
        </div>

        {/* Loop visual */}
        <div className="panel-strong mb-12 rounded-[2rem] p-7">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Loop principal
          </div>
          <pre className="overflow-x-auto font-mono text-sm leading-7 text-[var(--foreground)]">
{`while(true) {
  await runAgentLoop()   // Think → Budget → Earn → Pay
  if (state === 'dead')    await sleep(5min)
  if (state === 'sleeping') await sleepUntilOrWakeEvent()
}

// En paralelo, siempre:
heartbeatDaemon.start()   // check_resources, check_survival, log_status, cleanup`}
          </pre>
        </div>

        {/* Modules */}
        <div className="space-y-5">
          {modules.map((mod) => (
            <article key={mod.tag} className="panel rounded-[1.75rem] p-6 md:p-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">
                    {mod.tag}
                  </div>
                  <h2 className="text-2xl font-bold">{mod.title}</h2>
                </div>
              </div>
              <ul className="space-y-2">
                {mod.body.map((line, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                    <span className="mt-1 shrink-0 text-[var(--accent)]">→</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Inspired by */}
        <div className="mt-10 rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-6">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Inspirado en
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            La arquitectura de Esqueje está directamente inspirada en{' '}
            <a
              href="https://github.com/Conway-Research/automaton"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-2)] hover:underline"
            >
              Conway Research Automaton
            </a>
            {' '}— un agente soberano sobre EVM/USDC. Esqueje adapta sus patrones
            (soul system, heartbeat daemon, survival tiers, funding strategies, policy engine)
            al ecosistema de Cardano y ADA.
          </p>
        </div>
      </section>
    </main>
  );
}
