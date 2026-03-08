import Link from 'next/link';

const pillars = [
  {
    title: '1. Identidad persistente',
    body: 'Wallet, configuración y estado sobreviven a reinicios. El agente no puede decidir bien si su memoria económica desaparece en cada boot.',
  },
  {
    title: '2. Tesorería explícita',
    body: 'El balance se divide entre reserva operativa y capital de riesgo. Sobrevivir primero; especular después.',
  },
  {
    title: '3. Survival tiers',
    body: 'Healthy, low y critical se calculan por runway. La política cambia antes de que la caja llegue a cero.',
  },
  {
    title: '4. Motor de oportunidades',
    body: 'El agente compara trading, servicios pagados en ADA y conservación de caja. No toda oportunidad rentable es una buena idea.',
  },
  {
    title: '5. Pago automático',
    body: 'Hosting se paga sólo si la caja mantiene runway mínimo. Si no, el sistema entra en defensa y pospone gasto.',
  },
  {
    title: '6. Replicación disciplinada',
    body: 'Un hijo sólo nace si el padre conserva runway suficiente y el nuevo bankroll no compromete la supervivencia.',
  },
];

export default function ArquitecturaSoberana() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-white">
          ← Volver
        </Link>

        <div className="mb-10 space-y-5">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Arquitectura soberana
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Qué vale la pena copiar de <span className="text-[var(--accent-2)]">automaton</span> para Cardano.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            La lección central es simple: un agente no sobrevive porque “tiene IA”, sino porque administra caja,
            mide su runway y restringe su propia agresividad económica.
          </p>
        </div>

        <section className="panel-strong mb-10 rounded-[2rem] p-8">
          <pre className="overflow-x-auto font-mono text-sm leading-7 text-[var(--foreground)]">
{`THINK      -> evaluar estado, mercado y costos fijos
BUDGET     -> separar reserva, burn y capital de riesgo
EARN       -> elegir oportunidad con mejor retorno ajustado por supervivencia
REPLICATE? -> sólo abrir un hijo si el padre conserva caja sana
REPEAT     -> registrar estado, aprender y endurecer política`}
          </pre>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="panel rounded-[1.5rem] p-6">
              <h2 className="mb-3 text-2xl font-semibold">{pillar.title}</h2>
              <p className="text-[var(--muted)]">{pillar.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ['Anti-patrón actual', 'Balance aleatorio, trading aislado y pago sin calendario producen una falsa sensación de autonomía.'],
            ['Dirección correcta', 'Persistencia, presupuesto y loop económico convierten a Esqueje en un agente operable.'],
            ['Próximo paso serio', 'Sustituir ingresos simulados por servicios reales cobrables en ADA o stablecoins sobre Cardano.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[1.5rem] border border-[var(--border)] bg-black/15 p-6">
              <h3 className="mb-2 text-xl font-semibold">{title}</h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
