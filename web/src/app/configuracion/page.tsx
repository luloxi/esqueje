import Link from 'next/link';
import { getCapitalPlan, treasuryDefaults } from '@/lib/runtimeEconomics';

const capitalPlan = getCapitalPlan();

export default function Configuracion() {
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
            Configuración rápida
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">Qué conviene configurar antes de lanzar un agente</h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Esta página resume los defaults del runtime. La guía detallada vive en{' '}
            <Link href="/instalar" className="text-[var(--accent-2)] hover:underline">
              Instalar
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Hosting mensual', `${treasuryDefaults.monthlyHostingAda} ADA`],
            ['Operación mensual', `${treasuryDefaults.monthlyOperationsAda} ADA`],
            ['Mínimo por agente', `${capitalPlan.minimumOperationalBalanceAda} ADA`],
          ].map(([title, value]) => (
            <div key={title as string} className="panel rounded-[1.5rem] p-5">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)]">{title}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            [
              'Cuenta humana primero',
              'Si hosting, billing o API requieren email, captcha o verificación manual, el alta inicial pertenece al humano.',
            ],
            [
              'Wallet dedicada',
              'La wallet del agente debe estar separada de la tesorería personal y arrancar con capital suficiente.',
            ],
            [
              'Dashboard',
              'La wallet que conectás en el dashboard es la del operador, no la wallet interna del agente.',
            ],
            [
              'Replicación',
              `Un padre debería acercarse a ${capitalPlan.recommendedParentBalanceAda} ADA antes de abrir un hijo con ${capitalPlan.replicationSeedAda} ADA.`,
            ],
          ].map(([title, body]) => (
            <article key={title as string} className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-6">
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/instalar"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-bold text-[var(--background)] transition hover:bg-[var(--accent)]"
          >
            Ver guía completa
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Abrir dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
