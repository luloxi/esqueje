import { getCapitalPlan, getSurvivalThresholds, treasuryDefaults } from '@/lib/runtimeEconomics';

export const metadata = {
  title: 'Características — Esqueje',
  description: 'Soul System, Heartbeat Daemon, Policy Engine, tesorería explícita y replicación con capital mínimo realista.',
};

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

const sections = [
  {
    title: 'Identidad y memoria',
    items: [
      {
        name: 'Soul System',
        body: 'SOUL.md conserva propósito, valores, estrategia y personalidad para que el agente no nazca vacío después de reinicios.',
      },
      {
        name: 'SQLite State',
        body: 'Turns, balances, wake events, trades y configuración viven en SQLite. El estado no depende de memoria efímera.',
      },
      {
        name: 'Constitution',
        body: 'Tres leyes fijan límites éticos antes de cualquier objetivo de supervivencia o crecimiento.',
      },
    ],
  },
  {
    title: 'Tesorería y supervivencia',
    items: [
      {
        name: 'Capital Plan',
        body: `El runtime separa burn mensual (${capitalPlan.monthlyBurnAda} ADA), reserva de ${treasuryDefaults.targetRunwayDays} días (${capitalPlan.targetReserveAda} ADA) y capital mínimo sano (${capitalPlan.minimumOperationalBalanceAda} ADA).`,
      },
      {
        name: 'Survival Monitor',
        body: `Healthy arranca en ${thresholds.healthy} ADA; critical por debajo de ${thresholds.critical} ADA. Vivir no significa todavía ser un negocio sano.`,
      },
      {
        name: 'Funding Strategies',
        body: 'Si la caja cae, escala avisos por tier con cooldowns para pedir ayuda sin spamear al creador.',
      },
    ],
  },
  {
    title: 'Control de riesgo y operación',
    items: [
      {
        name: 'Policy Engine',
        body: `Bloquea trades en critical/dead, limita tamaño a ${(treasuryDefaults.maxTradeAllocationPct * 100).toFixed(0)}% y protege la reserva de emergencia.`,
      },
      {
        name: 'Heartbeat Daemon',
        body: 'Sigue corriendo aunque el loop duerma, vigila recursos y puede despertar al agente ante eventos relevantes.',
      },
      {
        name: 'Replicación defensiva',
        body: `Un padre no debería replicar si no puede quedar con su mínimo sano y además fondear al hijo con ${capitalPlan.replicationSeedAda} ADA.`,
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
            Arquitectura v0.3
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Características que explican
            <br />
            <span className="text-[var(--muted)]">cómo sobrevive y cuándo no debería replicarse.</span>
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            La novedad importante no es sólo técnica: Esqueje distingue entre estar vivo,
            tener runway y ser económicamente viable. Esa diferencia ahora atraviesa el loop,
            la política y la guía de despliegue.
          </p>
        </div>

        <div className="panel-strong mb-12 rounded-[2rem] p-7">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Ciclo principal
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { step: 'Think', desc: 'Balance, tier y mercado' },
              { step: 'Budget', desc: 'Reserva, burn y riesgo' },
              { step: 'Earn', desc: 'Señal + política' },
              { step: 'Replicate?', desc: 'Sólo si sobra caja real' },
              { step: 'Sleep', desc: 'Heartbeat sigue vigilando' },
            ].map(({ step, desc }) => (
              <div key={step} className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-4 text-center">
                <div className="font-mono text-base font-bold text-[var(--accent-2)]">{step}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-black/10 p-5">
            <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--foreground)]">{`while (true) {
  balance = wallet.getBalance();
  treasury = economics.snapshot(balance);
  tier = monitor.getSurvivalTier(balance);

  if (tier === 'dead') sleep();
  if (tier === 'critical') requestFundingAndSleep();

  budget = economics.getTradeBudget(balance);
  signal = trading.evaluateSignal(price);
  policy.check({ action: 'trade', amount: budget, balance, tier });

  if (economics.canReplicate(balance, monthlyProfit)) {
    wake('replication');
  }

  sleep();
}`}</pre>
          </div>
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

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['Monthly burn', `${capitalPlan.monthlyBurnAda} ADA/mes`],
            ['Mínimo por agente', `${capitalPlan.minimumOperationalBalanceAda} ADA`],
            ['Padre para replicar', `${capitalPlan.recommendedParentBalanceAda} ADA`],
          ].map(([title, value]) => (
            <div key={title as string} className="rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-6">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">{title}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-6">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Inspirado en
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            La arquitectura de Esqueje toma patrones de{' '}
            <a
              href="https://github.com/Conway-Research/automaton"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-2)] hover:underline"
            >
              Conway Research Automaton
            </a>
            {' '}y los adapta a Cardano/ADA con un énfasis mayor en tesorería explícita,
            runway y replicación defensiva.
          </p>
        </div>
      </section>
    </main>
  );
}
