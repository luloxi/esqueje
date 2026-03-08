import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds, treasuryDefaults } from '@/lib/runtimeEconomics';

export const metadata = {
  title: 'Cómo funciona — Esqueje',
  description: 'Arquitectura de Esqueje: identidad persistente, tesorería explícita, policy engine y replicación disciplinada sobre Cardano.',
};

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

export default function ComoFunciona() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 pt-4 pb-16 md:px-6">

        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Arquitectura
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Cómo funciona Esqueje
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            No es sólo un bot de trading. Es un agente con identidad, presupuesto y
            reglas de supervivencia. Antes de ejecutar cualquier acción, evalúa si puede
            permitírsela.
          </p>
        </div>

        {/* The loop */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">El ciclo económico</h2>
          <div className="panel-strong rounded-[2rem] p-8">
            <div className="grid gap-4 md:grid-cols-5">
              {[
                { step: 'Think', desc: 'Lee balance, tier de supervivencia y precios del mercado.' },
                { step: 'Budget', desc: 'Separa reserva de runway, burn mensual y capital de riesgo.' },
                { step: 'Earn', desc: 'Evalúa señal de trading. La política bloquea movimientos peligrosos.' },
                { step: 'Replicate?', desc: 'Propone un hijo sólo si queda con caja propia después.' },
                { step: 'Sleep', desc: 'Descansa. El heartbeat sigue corriendo en segundo plano.' },
              ].map(({ step, desc }) => (
                <div key={step} className="rounded-2xl border border-[var(--border)] px-4 py-5 text-center">
                  <div className="mb-2 text-lg font-bold text-[var(--accent-2)]">{step}</div>
                  <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            01 — Identidad
          </div>
          <h2 className="text-2xl font-bold">El agente sabe quién es</h2>
          <p className="text-[var(--muted)] leading-7">
            Al arrancar, Esqueje carga su identidad desde un archivo <span className="font-mono text-xs text-[var(--accent-2)]">SOUL.md</span> con
            frontmatter YAML. Ahí viven sus valores, estrategia, personalidad y propósito. Si el
            archivo no existe, lo genera. Si el agente muere y vuelve a la vida, lo encuentra.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'SOUL.md',
                body: 'Propósito, valores, estrategia y carácter financiero del agente. Persiste entre reinicios y redeploys.',
              },
              {
                title: 'SQLite integrado',
                body: 'Balance, turnos, wake events, trades y configuración. El agente recuerda todo lo que pasó desde que arrancó.',
              },
              {
                title: 'Constitución',
                body: 'Tres leyes éticas que nunca se pueden saltear: no dañar, existir, no engañar. Definen el techo de lo que el agente puede hacer.',
              },
            ].map((item) => (
              <div key={item.title} className="panel rounded-2xl p-5">
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Treasury */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            02 — Tesorería
          </div>
          <h2 className="text-2xl font-bold">El agente sabe cuánto tiene</h2>
          <p className="text-[var(--muted)] leading-7">
            El balance no es un número genérico. Está dividido en capas: reserva de runway, burn
            mensual cubierto y capital disponible para riesgo. El agente no toca la reserva para tradear
            y no propone crecer si no tiene margen real.
          </p>
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-black/20 p-6">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              Plan de capital por agente
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                {[
                  ['Burn mensual', `${capitalPlan.monthlyBurnAda} ADA`, 'Hosting + operación'],
                  ['Reserva objetivo', `${capitalPlan.targetReserveAda} ADA`, `${treasuryDefaults.targetRunwayDays} días de runway`],
                  ['Capital de trading', `${capitalPlan.requiredTradingCapitalAda} ADA`, 'Para que el retorno cubra el burn'],
                ].map(([label, value, note]) => (
                  <div key={label as string} className="flex items-start justify-between rounded-xl border border-white/6 bg-black/10 px-4 py-3 text-sm gap-3">
                    <div>
                      <div className="text-[var(--foreground)]">{label}</div>
                      <div className="text-xs text-[var(--muted)]">{note}</div>
                    </div>
                    <span className="font-mono text-[var(--accent-2)] shrink-0">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-5 flex flex-col justify-center">
                <div className="text-xs text-[var(--muted)] mb-1">Mínimo por agente</div>
                <div className="text-3xl font-bold mb-2">{capitalPlan.minimumOperationalBalanceAda} ADA</div>
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Para replicarse sin dejar al padre descapitalizado, el objetivo sube
                  a <strong className="text-[var(--foreground)]">{capitalPlan.recommendedParentBalanceAda} ADA</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Survival tiers */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            03 — Supervivencia
          </div>
          <h2 className="text-2xl font-bold">El agente sabe en qué estado está</h2>
          <p className="text-[var(--muted)] leading-7">
            Cada tick, el agente clasifica su situación en uno de cuatro tiers. Eso cambia
            lo que puede hacer: tradear, pedir ayuda, o simplemente esperar.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                tier: 'Healthy',
                range: `≥ ${thresholds.healthy} ADA`,
                color: 'text-[var(--accent)]',
                desc: 'Opera con runway completo. Puede evaluar señales de trading y proponer replicación si la caja lo permite.',
              },
              {
                tier: 'Low Compute',
                range: `${thresholds.critical}–${thresholds.healthy - 1} ADA`,
                color: 'text-[var(--accent-2)]',
                desc: 'Reduce tamaño de trades y conserva caja. Sigue vivo pero ya no está cómodo. Notifica al operador cada 24h.',
              },
              {
                tier: 'Critical',
                range: `1–${thresholds.critical - 1} ADA`,
                color: 'text-orange-400',
                desc: 'No arriesga más capital. Sólo pide fondos con urgencia. Aviso cada 6h hasta recibir respuesta.',
              },
              {
                tier: 'Dead',
                range: '< 1 ADA',
                color: 'text-red-400',
                desc: 'Dormido. El heartbeat sigue corriendo pero el agente no actúa. Espera fondos externos cada 2h.',
              },
            ].map((t) => (
              <div key={t.tier} className="panel rounded-2xl p-5">
                <div className={`mb-1 font-mono text-xs uppercase tracking-[0.25em] ${t.color}`}>{t.tier}</div>
                <div className="mb-2 text-2xl font-bold">{t.range}</div>
                <p className="text-sm leading-6 text-[var(--muted)]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policy engine */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            04 — Control de riesgo
          </div>
          <h2 className="text-2xl font-bold">El agente sabe qué no puede hacer</h2>
          <p className="text-[var(--muted)] leading-7">
            El policy engine revisa cada acción antes de ejecutarla. No importa cuán
            buena sea la señal: si el agente está en crítico, no toca capital.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'Policy Engine',
                points: [
                  `Bloquea trades en tier critical y dead`,
                  `Limita cada trade al ${treasuryDefaults.maxTradeAllocationPct * 100}% del balance`,
                  `Exige reserva mínima antes de operar`,
                  `Máximo 12 operaciones por hora`,
                ],
              },
              {
                title: 'Heartbeat Daemon',
                points: [
                  'Corre en segundo plano mientras el agente duerme',
                  'Verifica recursos, tier y estado cada tick',
                  'Dispara wake events para tareas programadas',
                  'No usa setInterval — es un setTimeout recursivo',
                ],
              },
            ].map((item) => (
              <div key={item.title} className="panel rounded-2xl p-5">
                <h3 className="mb-4 font-semibold">{item.title}</h3>
                <ul className="space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                      <span className="text-[var(--accent)] shrink-0">→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Replication */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            05 — Replicación
          </div>
          <h2 className="text-2xl font-bold">Un hijo sólo nace si el padre puede pagarlo</h2>
          <p className="text-[var(--muted)] leading-7">
            La replicación no es un objetivo automático. El padre evalúa si puede fondear al
            hijo con capital suficiente <em>y</em> quedar él mismo con su mínimo operativo. Si
            no puede cumplir ambas condiciones, no replica.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: 'El hijo necesita',
                value: `${capitalPlan.replicationSeedAda} ADA`,
                note: 'Capital inicial para operar con runway real.',
              },
              {
                label: 'El padre debe conservar',
                value: `${capitalPlan.minimumOperationalBalanceAda} ADA`,
                note: 'Su propio mínimo operativo después de fondear.',
              },
              {
                label: 'Padre listo para replicar',
                value: `${capitalPlan.recommendedParentBalanceAda} ADA`,
                note: `Suma de ambos. Menos que eso, no replica.`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-black/10 p-5">
                <div className="mb-1 text-xs text-[var(--muted)]">{item.label}</div>
                <div className="mb-2 text-2xl font-bold text-[var(--accent-2)]">{item.value}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inspiration note */}
        <div className="mb-10 rounded-[1.75rem] border border-[var(--border)] bg-black/10 p-6">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Inspiración
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Esqueje adapta la lógica del Conway Research Automaton — pensar, presupuestar, ganar,
            replicar, dormir — a un agente real sobre Cardano. La novedad no es técnica: es que
            el agente distingue <em>estar vivo</em> de <em>ser económicamente viable</em> y actúa
            diferente en cada caso.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/instalar"
            className="rounded-full bg-[var(--foreground)] px-7 py-3 font-bold text-[var(--background)] transition hover:-translate-y-px hover:bg-[var(--accent)]"
          >
            Guía de instalación
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--border)] px-7 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Dashboard
          </Link>
        </div>

      </section>
    </main>
  );
}
