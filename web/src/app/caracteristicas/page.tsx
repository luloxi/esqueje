export const metadata = {
  title: 'Características — Esqueje',
  description: 'Soul System, Heartbeat Daemon, Policy Engine, Survival Tiers y más.',
};

const sections = [
  {
    title: 'Identidad y memoria',
    items: [
      {
        name: 'Soul System',
        body: 'SOUL.md conserva propósito, valores, personalidad y estrategia para que el agente no arranque vacío después de reiniciarse.',
      },
      {
        name: 'SQLite State',
        body: 'Trades, wake events, balances y configuración persisten entre ciclos. No depende de memoria efímera.',
      },
      {
        name: 'Constitution',
        body: 'Tres leyes fijan límites de conducta y alineación antes de cualquier objetivo de supervivencia.',
      },
    ],
  },
  {
    title: 'Supervivencia y control de riesgo',
    items: [
      {
        name: 'Survival Monitor',
        body: 'Clasifica al agente en healthy, low compute, critical o dead para cambiar comportamiento antes de que llegue a cero.',
      },
      {
        name: 'Policy Engine',
        body: 'Impone límites de tamaño, frecuencia de trades y reserva mínima. La política manda sobre la señal.',
      },
      {
        name: 'Funding Strategies',
        body: 'Si la caja cae, escala alertas y activa modos defensivos con cooldowns para no spamear.',
      },
    ],
  },
  {
    title: 'Operación continua',
    items: [
      {
        name: 'Heartbeat Daemon',
        body: 'Sigue corriendo mientras el agente duerme y puede despertarlo si cambia el estado o aparece un evento relevante.',
      },
      {
        name: 'Durable Scheduler',
        body: 'Las tareas quedan programadas en base de datos para retomar operación después de una caída o reinicio.',
      },
      {
        name: 'Agent Loop',
        body: 'Cada turno sigue un patrón simple: pensar, presupuestar, ganar, pagar y dormir.',
      },
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
            Características que venden<br />
            <span className="text-[var(--muted)]">por qué Esqueje puede durar.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            En vez de una lista larga de módulos, acá están agrupadas por lo que resuelven: identidad, supervivencia y operación.
          </p>
        </div>

        {/* Loop visual */}
        <div className="panel-strong mb-12 rounded-[2rem] p-7">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Ciclo principal
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { step: 'Think', desc: 'Balance, tier y mercado' },
              { step: 'Budget', desc: 'Reserva vs capital de riesgo' },
              { step: 'Earn', desc: 'Señal Pyth + política' },
              { step: 'Pay', desc: 'Hosting sólo si runway aguanta' },
              { step: 'Sleep', desc: 'Heartbeat sigue vigilando' },
            ].map(({ step, desc }) => (
              <div key={step} className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-4 text-center">
                <div className="font-mono text-base font-bold text-[var(--accent-2)]">{step}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            En paralelo, el Heartbeat Daemon corre cada 60 s revisando recursos, supervivencia y limpieza sin importar si el loop duerme.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="panel rounded-[1.75rem] p-6 md:p-8">
              <h2 className="mb-6 text-2xl font-bold">{section.title}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {section.items.map((item) => (
                  <article key={item.name} className="rounded-2xl border border-[var(--border)] bg-black/10 p-5">
                    <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">
                      {item.name}
                    </div>
                    <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
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
