import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds } from '@/lib/runtimeEconomics';

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">
              Cardano · ADA · Autónomo
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
                Agentes que gestionan<br />
                <span className="text-[var(--accent)]">su propia supervivencia.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                Esqueje es un runtime autónomo sobre Cardano. Conoce su runway, gestiona su
                tesorería y sólo se replica cuando puede pagárselo. No simula viabilidad — la mide.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/instalar"
                className="rounded-full bg-[var(--foreground)] px-7 py-3 font-bold text-[var(--background)] transition hover:-translate-y-px hover:bg-[var(--accent)]"
              >
                Instalar
              </Link>
              <Link
                href="/como-funciona"
                className="rounded-full border border-[var(--border)] px-7 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Cómo funciona
              </Link>
            </div>
          </div>

          {/* Capital panel */}
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
              Sincronizado con los defaults del runtime actual.
            </p>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              tag: 'Identidad',
              title: 'Memoria que sobrevive reinicios',
              body: 'SOUL.md persiste valores, estrategia y personalidad. SQLite guarda balance, historial y configuración. El agente recuerda quién es aunque lo reinicies.',
            },
            {
              tag: 'Tesorería',
              title: 'Supervivencia primero, crecimiento después',
              body: `Reserva, burn mensual y capital de riesgo separados y explícitos. El agente distingue tener caja de ser viable — y actúa distinto en cada caso.`,
            },
            {
              tag: 'Replicación',
              title: 'Un hijo nace con caja real',
              body: `Si el padre no puede conservar ${capitalPlan.minimumOperationalBalanceAda} ADA después de fondear al hijo, no lo lanza. La disciplina económica no es opcional.`,
            },
          ].map((item) => (
            <article key={item.tag} className="panel rounded-[1.75rem] p-6">
              <div className="mb-3 inline-block rounded-full border border-[var(--border)] px-3 py-1 font-mono text-xs text-[var(--accent-2)]">
                {item.tag}
              </div>
              <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Survival cycle */}
      <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <div className="panel-strong rounded-[2rem] p-8">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Ciclo por tick
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {[
              ['Think', 'Balance, tier y mercado'],
              ['Budget', 'Reserva, burn y riesgo'],
              ['Earn', 'Señal + política'],
              ['Replicate?', 'Sólo si sobra caja real'],
              ['Sleep', 'Heartbeat sigue activo'],
            ].map(([step, desc]) => (
              <div key={step} className="rounded-2xl border border-[var(--border)] px-4 py-5 text-center">
                <div className="mb-2 text-lg font-bold text-[var(--accent-2)]">{step}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Survival tiers */}
      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { tier: 'Healthy', range: `≥ ${thresholds.healthy} ADA`, color: 'text-[var(--accent)]', desc: 'Opera con runway sano. Puede replicarse.' },
            { tier: 'Low Compute', range: `${thresholds.critical}–${thresholds.healthy - 1} ADA`, color: 'text-[var(--accent-2)]', desc: 'Reduce agresividad. Conserva caja.' },
            { tier: 'Critical', range: `1–${thresholds.critical - 1} ADA`, color: 'text-orange-400', desc: 'No arriesga capital. Pide fondos.' },
            { tier: 'Dead', range: '< 1 ADA', color: 'text-red-400', desc: 'Dormido. Espera fondos externos.' },
          ].map((t) => (
            <div key={t.tier} className="panel rounded-[1.5rem] p-5">
              <div className={`mb-1 font-mono text-xs uppercase tracking-[0.25em] ${t.color}`}>{t.tier}</div>
              <div className="mb-2 text-xl font-bold">{t.range}</div>
              <p className="text-sm leading-5 text-[var(--muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl space-y-4 px-4 py-14 md:px-6">
        <div className="panel-strong flex flex-col items-start justify-between gap-6 rounded-[2rem] p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">¿Listo para lanzarlo?</h2>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Dos caminos: humano que despliega por primera vez, o agente que ya llega fondeado y hereda cuentas existentes.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/instalar"
              className="rounded-full bg-[var(--foreground)] px-7 py-3 font-bold text-[var(--background)] transition hover:-translate-y-px hover:bg-[var(--accent)]"
            >
              Instalar
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
