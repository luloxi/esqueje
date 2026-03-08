import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds, treasuryDefaults } from '@/lib/runtimeEconomics';

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

const categories = [
  {
    eyebrow: 'Identidad',
    title: 'Un runtime que no arranca en blanco',
    items: [
      'SOUL.md persiste propósito, memoria y carácter financiero.',
      'SQLite conserva balance, turns, wake events y configuración.',
      'El agente vuelve a vivir después de reinicios y redeploys.',
    ],
  },
  {
    eyebrow: 'Tesorería',
    title: 'Supervivencia primero, crecimiento después',
    items: [
      `Reserva ${capitalPlan.targetReserveAda} ADA para ${treasuryDefaults.targetRunwayDays} días de runway antes de hablar de replicación.`,
      `Marca ${capitalPlan.minimumOperationalBalanceAda} ADA como mínimo sano por agente.`,
      `Sólo propone replicarse si el padre puede quedar con caja y el hijo nace con ${capitalPlan.replicationSeedAda} ADA.`,
    ],
  },
  {
    eyebrow: 'Operación',
    title: 'Pensado para humanos y para agentes ya fondeados',
    items: [
      'La primera alta de hosting, wallet browser y cuentas externas sigue siendo humana.',
      'Un agente ya fondeado puede reutilizar hosting, claves y billing del operador.',
      'Dashboard, logs y Blockfrost cierran el loop de control y monitoreo.',
    ],
  },
];

const launchModes = [
  {
    title: 'Humano, primer despliegue',
    body: 'Crea o reutiliza el hosting, prepara la wallet, obtiene las claves y arranca la primera instancia. Si un proveedor pide email, captcha o verificación humana, ese paso no lo resuelve el agente.',
    cta: 'Ver guía humana',
    href: '/instalar#humano',
  },
  {
    title: 'Agente ya fondeado',
    body: 'No crea cuentas nuevas. Hereda la cuenta de su operador o de su padre, usa SSH/API ya aprobadas y sólo nace si recibe capital suficiente para cubrir runway, operación y margen.',
    cta: 'Ver guía para agentes',
    href: '/instalar#agente',
  },
];

const highlights = [
  {
    title: 'Mínimo por agente',
    body: `${capitalPlan.minimumOperationalBalanceAda} ADA. Menos que eso puede mantenerlo vivo un rato, pero no lo vuelve sostenible ni replicable.`,
  },
  {
    title: 'Replicación responsable',
    body: `El padre debería llegar a ${capitalPlan.recommendedParentBalanceAda} ADA para sostenerse y fondear un hijo de ${capitalPlan.replicationSeedAda} ADA.`,
  },
  {
    title: 'Coste operativo base',
    body: `${capitalPlan.monthlyBurnAda} ADA/mes entre hosting y operación. El runtime usa ese burn para decidir reservas y riesgo.`,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">
              Cardano · ADA · Autónomo · Con tesorería real
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
                Un agente que no sólo vive:<br />
                <span className="text-[var(--accent)]">también debe cerrar sus cuentas.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                Esqueje es un runtime autónomo sobre Cardano con soul persistente,
                heartbeat daemon, policy engine y tesorería explícita. Se puede lanzar
                fácil, pero no finge que un agente subcapitalizado sea un negocio sano.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/instalar"
                className="rounded-full bg-[var(--foreground)] px-7 py-3 font-bold text-[var(--background)] transition hover:-translate-y-px hover:bg-[var(--accent)]"
              >
                Lanzar por primera vez
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-[var(--border)] px-7 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Conectar y monitorear
              </Link>
            </div>
          </div>

          <div className="panel-strong rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              <span>Capital mínimo</span>
              <span className="text-[var(--accent)]">● viable</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {[
                ['burn mensual', `${capitalPlan.monthlyBurnAda} ADA`],
                ['reserva 90 días', `${capitalPlan.targetReserveAda} ADA`],
                ['capital de trading', `${capitalPlan.requiredTradingCapitalAda} ADA`],
                ['mínimo por agente', `${capitalPlan.minimumOperationalBalanceAda} ADA`],
                ['seed para hijo', `${capitalPlan.replicationSeedAda} ADA`],
                ['padre para replicar', `${capitalPlan.recommendedParentBalanceAda} ADA`],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--muted)]">{key}</span>
                  <span className="text-[var(--foreground)]">{val}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Datos ilustrativos, sincronizados con los defaults del runtime actual.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="panel-strong rounded-[2rem] p-8">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Dos formas de lanzarlo
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {launchModes.map((mode) => (
              <article key={mode.title} className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-6">
                <h2 className="mb-3 text-2xl font-bold">{mode.title}</h2>
                <p className="mb-5 text-sm leading-6 text-[var(--muted)]">{mode.body}</p>
                <Link
                  href={mode.href}
                  className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {mode.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Por qué importa
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">Arquitectura, pero con presupuesto</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((category) => (
            <article key={category.eyebrow} className="panel rounded-[1.75rem] p-6">
              <div className="mb-3 inline-block rounded-full border border-[var(--border)] px-3 py-1 font-mono text-xs text-[var(--accent-2)]">
                {category.eyebrow}
              </div>
              <h3 className="mb-4 text-xl font-semibold">{category.title}</h3>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                    <span className="text-[var(--accent)]">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-5">
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="panel-strong rounded-[2rem] p-8">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Ciclo de supervivencia
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Think', 'Lee balance, tier y mercado'],
              ['Budget', 'Separa reserva, burn y capital de riesgo'],
              ['Earn', 'Busca señal y limita tamaño'],
              ['Replicate', 'Sólo si el padre puede sostener al hijo sin suicidarse'],
              ['Sleep', 'Duerme; el heartbeat sigue'],
            ].map(([step, desc]) => (
              <div key={step} className="rounded-2xl border border-[var(--border)] px-4 py-5 text-center">
                <div className="mb-1 text-xl font-bold text-[var(--accent-2)]">{step}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              tier: 'Healthy',
              range: `>= ${thresholds.healthy} ADA`,
              color: 'text-[var(--accent)]',
              desc: 'Runway suficiente para seguir operando sin pedir auxilio.',
            },
            {
              tier: 'Low Compute',
              range: `${thresholds.critical}-${thresholds.healthy - 1} ADA`,
              color: 'text-[var(--accent-2)]',
              desc: 'Reduce riesgo y conserva caja; sigue vivo pero ya no está cómodo.',
            },
            {
              tier: 'Critical',
              range: `1-${thresholds.critical - 1} ADA`,
              color: 'text-orange-400',
              desc: 'Sin margen real. Defensa pura y avisos urgentes.',
            },
            {
              tier: 'Dead',
              range: '0 ADA',
              desc: 'Dormido. Espera fondos o intervención externa.',
              color: 'text-red-400',
            },
          ].map((tier) => (
            <div key={tier.tier} className="panel rounded-[1.5rem] p-5">
              <div className={`mb-1 font-mono text-xs uppercase tracking-[0.25em] ${tier.color}`}>{tier.tier}</div>
              <div className="mb-2 text-2xl font-bold">{tier.range}</div>
              <p className="text-sm leading-6 text-[var(--muted)]">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 py-14 md:px-6">
        <div className="panel-strong flex flex-col items-start justify-between gap-6 rounded-[2rem] p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Conectá tu wallet y registrá cada agente</h2>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              El dashboard ahora explica cómo conectar la wallet del humano, cómo cargar la dirección
              on-chain del agente y cómo usar un vault para fondeo, control y monitoreo.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full bg-[var(--foreground)] px-7 py-3 font-bold text-[var(--background)] transition hover:-translate-y-px hover:bg-[var(--accent)]"
          >
            Ir al Dashboard
          </Link>
        </div>
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-[var(--border)] bg-black/10 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Guía de instalación</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
              Separada entre humano inicial y agente ya fondeado, con mínimos, cuenta reutilizable y pasos reales.
            </p>
          </div>
          <Link
            href="/instalar"
            className="shrink-0 rounded-full border border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-[var(--accent)]"
          >
            Ver guía
          </Link>
        </div>
      </section>
    </main>
  );
}
