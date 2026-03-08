import Link from 'next/link';

const features = [
  {
    tag: 'Soul System',
    title: 'Identidad que persiste',
    body: 'SOUL.md guarda propósito, valores, estrategia y carácter financiero. El agente sabe quién es incluso después de reiniciarse.',
  },
  {
    tag: 'Heartbeat Daemon',
    title: 'Pulso independiente',
    body: 'Un daemon de fondo con recursive setTimeout corre aunque el agente duerma. Supervisa recursos, ejecuta tareas y lo despierta si algo cambia.',
  },
  {
    tag: 'Policy Engine',
    title: 'No arriesga lo que no puede perder',
    body: 'Reglas duras: nunca más del 10% en un trade, mínimo 2 ADA de reserva para fees, máximo 12 trades por hora.',
  },
  {
    tag: 'Survival Tiers',
    title: 'Cuatro niveles de emergencia',
    body: 'Healthy → Low Compute → Critical → Dead. La estrategia cambia antes de que la caja llegue a cero, con cooldowns para no saturar de alertas.',
  },
  {
    tag: 'SQLite State',
    title: 'Memoria real entre reinicios',
    body: 'Historial de trades, balance, turnos, wake events y configuración persisten en SQLite usando el módulo nativo de Node.js.',
  },
  {
    tag: 'Constitution',
    title: 'Ética antes que supervivencia',
    body: 'Tres leyes jerárquicas: nunca dañar, ganarse la existencia honestamente, no engañar al creador. Se heredan a cada hijo.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent-2)]">
              Cardano · ADA · Autónomo · Open source
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
                El agente que paga su existencia<br />
                <span className="text-[var(--accent)]">en ADA.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                Esqueje es un runtime autónomo sobre Cardano con soul persistente, heartbeat
                daemon, policy engine y survival tiers. Corre, tradea y sobrevive sin que lo estés mirando.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/instalar"
                className="rounded-full bg-[var(--accent)] px-7 py-3 font-semibold text-[#08110d] transition hover:-translate-y-px"
              >
                Instalar el agente
              </Link>
              <Link
                href="/caracteristicas"
                className="rounded-full border border-[var(--border)] px-7 py-3 font-semibold text-white transition hover:border-[var(--accent)]"
              >
                Ver características
              </Link>
            </div>
          </div>

          {/* Status card */}
          <div className="panel-strong rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              <span>Estado del agente</span>
              <span className="text-[var(--accent)]">● healthy</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {[
                ['balance', '124.38 ADA'],
                ['tier', 'healthy'],
                ['turno', '#42'],
                ['último precio', '$0.4955 ADA/USD'],
                ['señal', 'buy (MA5 > MA10)'],
                ['duerme hasta', '01:14:33 UTC'],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--muted)]">{key}</span>
                  <span className="text-[var(--foreground)]">{val}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Datos ilustrativos — conecta Blockfrost para valores reales.
            </p>
          </div>
        </div>
      </section>

      {/* Loop */}
      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="panel-strong rounded-[2rem] p-8">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Ciclo de supervivencia
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['Think', 'Evalúa balance, tier y mercado'],
              ['Budget', 'Separa reserva de capital de riesgo'],
              ['Earn', 'Busca señal en Pyth, evalúa política'],
              ['Pay', 'Paga hosting sólo si el runway aguanta'],
              ['Sleep', 'Duerme hasta el próximo ciclo; el heartbeat sigue'],
            ].map(([step, desc]) => (
              <div key={step} className="rounded-2xl border border-[var(--border)] px-4 py-5 text-center">
                <div className="mb-1 text-xl font-bold text-[var(--accent-2)]">{step}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Arquitectura
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">Lo que lo mantiene vivo</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.tag} className="panel rounded-[1.5rem] p-6">
              <div className="mb-3 inline-block rounded-full border border-[var(--border)] px-3 py-1 font-mono text-xs text-[var(--accent-2)]">
                {f.tag}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Survival tiers */}
      <section className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { tier: 'Healthy', range: '> 50 ADA', color: 'text-[var(--accent)]', desc: 'Trading normal con tamaño de posición completo.' },
            { tier: 'Low Compute', range: '20–50 ADA', color: 'text-[var(--accent-2)]', desc: 'Trades conservadores al 50%, alerta al creador.' },
            { tier: 'Critical', range: '5–20 ADA', color: 'text-orange-400', desc: 'Sin trades. Modo defensa. Aviso urgente.' },
            { tier: 'Dead', range: '< 5 ADA', desc: 'Dormido. Espera fondos. Heartbeat sigue activo.', color: 'text-red-400' },
          ].map((t) => (
            <div key={t.tier} className="panel rounded-[1.5rem] p-5">
              <div className={`mb-1 font-mono text-xs uppercase tracking-[0.25em] ${t.color}`}>{t.tier}</div>
              <div className="mb-2 text-2xl font-bold">{t.range}</div>
              <p className="text-sm leading-6 text-[var(--muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="panel-strong flex flex-col items-start justify-between gap-6 rounded-[2rem] p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Listo para correr en 3 comandos</h2>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Clona, compila y ejecuta. Esqueje genera su wallet, su soul y su configuración en el primer arranque.
            </p>
          </div>
          <Link
            href="/instalar"
            className="shrink-0 rounded-full bg-white px-7 py-3 font-semibold text-[#08110d] transition hover:-translate-y-px"
          >
            Ver guía de instalación →
          </Link>
        </div>
      </section>
    </main>
  );
}
