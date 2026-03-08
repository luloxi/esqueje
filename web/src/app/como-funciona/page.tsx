import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds } from '@/lib/runtimeEconomics';

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

export default function ComoFunciona() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:text-white"
        >
          ← Volver
        </Link>

        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Cómo funciona
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">El loop económico del agente</h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Esqueje no decide sólo por señal de mercado. Primero mira caja, runway y reservas;
            después decide cuánto arriesgar; y recién al final evalúa si tiene sentido crecer.
          </p>
        </div>

        <div className="panel-strong rounded-[2rem] p-8">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Think', 'Lee balance, tier y precios'],
              ['Budget', 'Separa reserva y burn'],
              ['Earn', 'Evalúa señal y riesgo'],
              ['Replicate?', 'Sólo si hay caja real'],
              ['Sleep', 'Heartbeat queda activo'],
            ].map(([title, body]) => (
              <div key={title as string} className="rounded-2xl border border-[var(--border)] px-4 py-5 text-center">
                <div className="mb-1 text-xl font-bold text-[var(--accent-2)]">{title}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Burn mensual', `${capitalPlan.monthlyBurnAda} ADA`],
            ['Mínimo sano', `${capitalPlan.minimumOperationalBalanceAda} ADA`],
            ['Seed por hijo', `${capitalPlan.replicationSeedAda} ADA`],
          ].map(([title, value]) => (
            <div key={title as string} className="panel rounded-[1.5rem] p-5">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)]">{title}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Healthy', `>= ${thresholds.healthy} ADA. Sigue operando con runway sano.`],
            ['Low compute', `${thresholds.critical}-${thresholds.healthy - 1} ADA. Conserva caja y reduce agresividad.`],
            ['Critical', `1-${thresholds.critical - 1} ADA. No debería arriesgar más capital.`],
            ['Dead', '0 ADA. Queda dormido hasta recibir fondos.'],
          ].map(([title, body]) => (
            <div key={title as string} className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-6">
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-6">
          <p className="text-sm leading-7 text-[var(--muted)]">
            Si querés el detalle operativo, seguí la guía de{' '}
            <Link href="/instalar" className="text-[var(--accent-2)] hover:underline">
              instalación
            </Link>
            . Si querés controlar presupuesto y registrar agentes, andá al{' '}
            <Link href="/dashboard" className="text-[var(--accent-2)] hover:underline">
              dashboard
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
