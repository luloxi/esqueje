import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds, treasuryDefaults } from '@/lib/runtimeEconomics';

export const metadata = {
  title: 'Instalar — Esqueje',
  description: 'Guía de instalación de Esqueje: pasos para humanos y variables de entorno para agentes que se replican.',
};

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

const requiredEnvVars = [
  {
    name: 'ESQUEJE_MNEMONIC',
    desc: 'Seed de la wallet operativa del agente (24 palabras). Sin esto, el runtime crea una wallet efímera de demo.',
    required: true,
    format: 'word1 word2 ... word24',
  },
  {
    name: 'CARDANO_NETWORK',
    desc: 'Red en la que opera el agente.',
    required: true,
    format: 'mainnet | preprod | preview',
  },
  {
    name: 'BLOCKFROST_KEY',
    desc: 'Project ID de Blockfrost para leer balance real on-chain. Sin esto usa balance simulado.',
    required: false,
    format: 'mainnetXXX... | preprodXXX...',
  },
  {
    name: 'CREATOR_ADDRESS',
    desc: 'Dirección Cardano del humano u operador. El agente envía alertas y avisos de funding a esta dirección.',
    required: false,
    format: 'addr1... | addr_test1...',
  },
  {
    name: 'LOG_LEVEL',
    desc: 'Verbosidad del runtime.',
    required: false,
    format: 'debug | info | warn | error',
  },
];

const treasuryEnvVars = [
  {
    name: 'MONTHLY_HOSTING_ADA',
    desc: 'Costo mensual de hosting usado para calcular reservas y runway.',
    defaultValue: treasuryDefaults.monthlyHostingAda.toString(),
  },
  {
    name: 'MONTHLY_OPERATIONS_ADA',
    desc: 'Costo mensual no-hosting: indexación, automatización y margen operativo.',
    defaultValue: treasuryDefaults.monthlyOperationsAda.toString(),
  },
  {
    name: 'TARGET_MONTHLY_PROFIT_ADA',
    desc: 'Ganancia mensual mínima que justifica seguir creciendo.',
    defaultValue: treasuryDefaults.targetMonthlyProfitAda.toString(),
  },
  {
    name: 'MIN_AGENT_BALANCE_ADA',
    desc: 'Piso mínimo por agente. El runtime usa el mayor entre este valor y el cálculo financiero.',
    defaultValue: treasuryDefaults.minimumAgentBalanceAda.toString(),
  },
  {
    name: 'REPLICATION_SEED_ADA',
    desc: 'Capital inicial con el que nace un hijo.',
    defaultValue: treasuryDefaults.replicationSeedAda.toString(),
  },
  {
    name: 'MIN_PROFIT_FOR_REPLICATION_ADA',
    desc: 'Ganancia mensual mínima antes de que el padre proponga replicarse.',
    defaultValue: treasuryDefaults.minimumProfitForReplicationAda.toString(),
  },
  {
    name: 'MAX_TRADE_ALLOCATION_PCT',
    desc: 'Porcentaje máximo del balance que se puede arriesgar por trade.',
    defaultValue: `${treasuryDefaults.maxTradeAllocationPct * 100}%`,
  },
];

function Code({ children }: { children: string }) {
  return (
    <div className="panel-strong overflow-x-auto rounded-2xl p-5">
      <pre className="font-mono text-sm leading-7 text-[var(--foreground)]">{children}</pre>
    </div>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="font-mono text-[var(--accent)] text-xs">{n}</span>
      <div className="h-px flex-1 bg-[var(--border)]" />
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{label}</span>
    </div>
  );
}

export default function Instalar() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 pt-4 pb-16 md:px-6">

        {/* Header */}
        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Instalación
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Instalar Esqueje
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Hay dos caminos: el humano que lanza la primera instancia, y el agente que ya
            llega fondeado y hereda cuentas existentes. Los pasos que requieren email,
            captcha o verificación humana siempre son del primer tipo.
          </p>
        </div>

        {/* Path selector */}
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {[
            {
              id: 'humano',
              emoji: '👤',
              title: 'Humano, primer lanzamiento',
              body: 'Crea las cuentas, prepara la wallet del agente, lo arranca y conecta el dashboard.',
            },
            {
              id: 'agente',
              emoji: '🌱',
              title: 'Agente que se replica',
              body: 'No crea cuentas nuevas. Hereda hosting, billing y API keys. Nace con capital suficiente.',
            },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="panel rounded-[1.75rem] p-6 transition hover:border-[var(--accent)]"
            >
              <div className="mb-3 text-2xl">{item.emoji}</div>
              <h2 className="mb-2 text-xl font-bold">{item.title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
            </a>
          ))}
        </div>

        {/* Capital minimum */}
        <div className="mb-12 rounded-[1.75rem] border border-[var(--border)] bg-black/20 p-6">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Capital mínimo por agente
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {[
                ['Hosting mensual', `${treasuryDefaults.monthlyHostingAda} ADA`],
                ['Operación mensual', `${treasuryDefaults.monthlyOperationsAda} ADA`],
                [`Runway ${treasuryDefaults.targetRunwayDays} días`, `${capitalPlan.targetReserveAda} ADA`],
                ['Capital de trading', `${capitalPlan.requiredTradingCapitalAda} ADA`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between rounded-xl border border-white/6 bg-black/10 px-4 py-3 text-sm">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="font-mono text-[var(--accent-2)]">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-5 flex flex-col justify-center">
              <div className="text-xs text-[var(--muted)] mb-1">Total por agente</div>
              <div className="text-3xl font-bold mb-3">{capitalPlan.minimumOperationalBalanceAda} ADA</div>
              <p className="text-sm leading-5 text-[var(--muted)]">
                Para un padre que quiera replicarse sin quedar descapitalizado, el objetivo
                sube a <strong className="text-[var(--foreground)]">{capitalPlan.recommendedParentBalanceAda} ADA</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* === HUMAN SECTION === */}
        <section id="humano" className="mb-14 scroll-mt-24 space-y-6">
          <SectionLabel n="01" label="Para humanos" />
          <h2 className="text-2xl font-bold">Primer lanzamiento</h2>

          <div className="space-y-3">
            {[
              {
                n: '1',
                title: 'Creá las cuentas externas',
                body: 'Necesitás una cuenta de hosting (VPS) y una de Blockfrost. Estas plataformas pueden requerir email, captcha o verificación — eso queda de tu lado.',
              },
              {
                n: '2',
                title: `Fondear la wallet del agente`,
                body: `Creá una wallet nueva sólo para el agente y fondeala con al menos ${capitalPlan.minimumOperationalBalanceAda} ADA en mainnet. Para probar primero, usá preprod (tADA gratis desde el faucet oficial).`,
              },
              {
                n: '3',
                title: 'Preparar el servidor',
                body: 'Un VPS chico con Ubuntu 22.04 y Node 22 es suficiente. Instalá el runtime en minutos.',
              },
              {
                n: '4',
                title: 'Conectar el dashboard',
                body: 'El agente imprime su dirección en los logs al primer arranque. Con eso, conectá tu wallet en el dashboard y registrá al agente.',
              },
            ].map((item) => (
              <div key={item.n} className="panel rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">0{item.n}</span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>

          <Code>{`# En el servidor (Ubuntu 22.04 + Node 22)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git

git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent && npm install && npm run build`}</Code>

          <Code>{`# Configurar variables de entorno
cat > .env <<'EOF'
ESQUEJE_MNEMONIC="word1 word2 ... word24"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...
EOF

# Arrancar con pm2
npm install -g pm2
pm2 start dist/index.js --name esqueje --node-args="--experimental-sqlite"
pm2 save`}</Code>

          <p className="text-sm leading-6 text-[var(--muted)]">
            Al arrancar, el agente imprime su dirección Cardano en los logs.
            Usá esa dirección en el{' '}
            <Link href="/dashboard" className="text-[var(--accent-2)] hover:underline">dashboard</Link>{' '}
            para registrarlo y asignarle presupuesto.
          </p>
        </section>

        {/* === AGENT SECTION === */}
        <section id="agente" className="mb-14 scroll-mt-24 space-y-6">
          <SectionLabel n="02" label="Para agentes" />
          <h2 className="text-2xl font-bold">Replicación desde un agente existente</h2>
          <p className="text-[var(--muted)] leading-7">
            Un agente que se replica no crea cuentas nuevas. Hereda la infraestructura
            de su padre u operador y recibe capital suficiente antes de arrancar.
          </p>

          <div className="space-y-3">
            {[
              {
                n: '1',
                title: 'Usá cuentas ya aprobadas',
                body: 'El proyecto Blockfrost, la cuenta de hosting y el billing ya existen. El hijo los hereda. No puede crear cuentas que requieran verificación humana.',
              },
              {
                n: '2',
                title: `Recibí capital suficiente`,
                body: `El hijo arranca con ${capitalPlan.replicationSeedAda} ADA. El padre sólo lo lanza si puede quedar con ${capitalPlan.minimumOperationalBalanceAda} ADA propios después de fondear.`,
              },
              {
                n: '3',
                title: 'Levantá el runtime',
                body: 'Mismo proceso que el humano. El padre puede provisionar una carpeta en el mismo VPS o en otro servidor de la misma cuenta.',
              },
              {
                n: '4',
                title: 'Registrarse en el dashboard del operador',
                body: 'El operador humano conecta su wallet, registra la dirección del hijo y opcionalmente despliega un vault para fondeo controlado.',
              },
            ].map((item) => (
              <div key={item.n} className="panel rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">0{item.n}</span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>

          {/* What the agent needs */}
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-black/10 p-6">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              Lo que el agente necesita recibir del padre u operador
            </div>
            <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
              Un agente hijo no puede obtener estas variables por sí mismo — deben entregárselas.
              Son las mismas variables de entorno que usa cualquier instancia de Esqueje:
            </p>
            <div className="space-y-2">
              {[
                { name: 'ESQUEJE_MNEMONIC', note: 'Seed única para este hijo (24 palabras). El padre genera una wallet nueva.' },
                { name: 'CARDANO_NETWORK', note: 'Misma red que el padre (mainnet o preprod).' },
                { name: 'BLOCKFROST_KEY', note: 'Project ID del proyecto Blockfrost del operador o padre.' },
                { name: 'CREATOR_ADDRESS', note: 'Dirección del operador humano para recibir alertas de este hijo.' },
              ].map((item) => (
                <div key={item.name} className="flex gap-4 rounded-xl border border-white/6 bg-black/10 px-4 py-3">
                  <span className="font-mono text-xs text-[var(--accent-2)] shrink-0 pt-0.5">{item.name}</span>
                  <span className="text-xs leading-5 text-[var(--muted)]">{item.note}</span>
                </div>
              ))}
            </div>
          </div>

          <Code>{`# Instalar el hijo en el mismo servidor o en otro
cd /opt && git clone https://github.com/luloxi/esqueje.git esqueje-hijo
cd esqueje-hijo/agent && npm install && npm run build

cat > .env <<'EOF'
ESQUEJE_MNEMONIC="seed del hijo generada por el padre"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...   # wallet del humano operador
EOF

pm2 start dist/index.js --name esqueje-hijo --node-args="--experimental-sqlite"
pm2 save`}</Code>
        </section>

        {/* === ENV VARS REFERENCE === */}
        <section className="mb-14 space-y-6">
          <SectionLabel n="03" label="Referencia" />
          <h2 className="text-2xl font-bold">Variables de entorno</h2>

          {/* Required */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Principales</h3>
            <div className="panel rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Variable</th>
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Descripción</th>
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Req.</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredEnvVars.map((item) => (
                    <tr key={item.name} className="border-b border-white/5">
                      <td className="px-4 py-3 align-top font-mono text-xs text-[var(--accent-2)]">{item.name}</td>
                      <td className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">
                        <div>{item.desc}</div>
                        <div className="mt-1 font-mono text-[var(--accent-2)]/60">{item.format}</div>
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-xs">
                        {item.required ? (
                          <span className="text-orange-400">sí</span>
                        ) : (
                          <span className="text-[var(--muted)]">no</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Treasury */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Tesorería (con defaults)</h3>
            <div className="panel rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Variable</th>
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Descripción</th>
                    <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {treasuryEnvVars.map((item) => (
                    <tr key={item.name} className="border-b border-white/5">
                      <td className="px-4 py-3 align-top font-mono text-xs text-[var(--accent-2)]">{item.name}</td>
                      <td className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">{item.desc}</td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-[var(--foreground)]">{item.defaultValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* === WHAT THE AGENT CAN'T DO === */}
        <section className="mb-14 space-y-4">
          <SectionLabel n="04" label="Límites" />
          <h2 className="text-2xl font-bold">Lo que un agente no puede hacer solo</h2>
          <div className="space-y-2">
            {[
              'Crear cuentas en plataformas que exigen email, captcha, KYC o aprobación manual.',
              'Instalar o autorizar extensiones de wallet en el navegador del operador.',
              'Aceptar términos, completar pagos o ampliar planes cuando el proveedor bloquea la automatización.',
              `Operar de forma sostenible con menos de ${capitalPlan.minimumOperationalBalanceAda} ADA — puede sobrevivir un tiempo, pero no es viable.`,
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--muted)]">
                <span className="text-orange-400 shrink-0">!</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testnet */}
        <section className="space-y-4">
          <SectionLabel n="05" label="Testnet" />
          <h2 className="text-2xl font-bold">Probá primero en preprod</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Usá <span className="font-mono text-xs text-[var(--accent-2)]">CARDANO_NETWORK=preprod</span>{' '}
            y un proyecto preprod de Blockfrost. Fondeá la dirección del agente con tADA desde el faucet oficial.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: 'Faucet oficial',
                href: 'https://docs.cardano.org/cardano-testnets/tools/faucet/',
                text: 'docs.cardano.org/cardano-testnets/tools/faucet',
              },
              {
                label: 'Blockfrost',
                href: 'https://blockfrost.io',
                text: 'blockfrost.io',
              },
              {
                label: 'Hosting con cripto',
                href: 'https://www.cherryservers.com/knowledge/docs/usage-billing/payment-methods',
                text: 'Cherry Servers — pago con cripto',
              },
            ].map((item) => (
              <div key={item.label} className="panel rounded-2xl p-5">
                <div className="mb-1 text-xs text-[var(--muted)]">{item.label}</div>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--accent-2)] hover:underline break-words"
                >
                  {item.text}
                </a>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { tier: 'Healthy', range: `≥ ${thresholds.healthy} ADA`, color: 'text-[var(--accent)]' },
              { tier: 'Low compute', range: `${thresholds.critical}–${thresholds.healthy - 1} ADA`, color: 'text-[var(--accent-2)]' },
              { tier: 'Critical', range: `1–${thresholds.critical - 1} ADA`, color: 'text-orange-400' },
            ].map(({ tier, range, color }) => (
              <div key={tier} className="rounded-xl border border-[var(--border)] bg-black/10 px-4 py-4 text-sm">
                <div className={`mb-1 font-mono text-xs uppercase tracking-[0.25em] ${color}`}>{tier}</div>
                <div className="text-[var(--muted)]">{range}</div>
              </div>
            ))}
          </div>
        </section>

      </section>
    </main>
  );
}
