export const metadata = {
  title: 'Instalar — Esqueje',
  description: 'Guía de instalación y configuración del agente Esqueje.',
};

const envVars = [
  { name: 'ESQUEJE_MNEMONIC', desc: 'Frase semilla de la wallet (24 palabras). Sin esto se genera una efímera.', required: true },
  { name: 'BLOCKFROST_KEY', desc: 'API key de Blockfrost para leer balance real de la blockchain.', required: false },
  { name: 'CARDANO_NETWORK', desc: 'Red de Cardano: mainnet, preprod o preview.', default: 'preprod' },
  { name: 'CREATOR_ADDRESS', desc: 'Tu dirección de Cardano. El agente te notifica cuando entra en modo crítico.', required: false },
  { name: 'HEARTBEAT_INTERVAL_MS', desc: 'Intervalo del tick del heartbeat en milisegundos.', default: '60000' },
  { name: 'LOG_LEVEL', desc: 'Nivel de logging: debug, info, warn, error.', default: 'info' },
  { name: 'MOCK_ADA_BALANCE', desc: 'Balance ADA mock para tests (cuando no hay Blockfrost).', required: false },
];

const tiers = [
  { tier: 'Healthy', range: '> 50 ADA', action: 'Trading normal, posición completa.', color: 'text-[var(--accent)]' },
  { tier: 'Low Compute', range: '20–50 ADA', action: 'Posición al 50%, aviso al creador (cooldown 24h).', color: 'text-[var(--accent-2)]' },
  { tier: 'Critical', range: '5–20 ADA', action: 'Sin trading, modo defensa, aviso urgente (cooldown 6h).', color: 'text-orange-400' },
  { tier: 'Dead', range: '< 5 ADA', action: 'Dormido esperando fondos, heartbeat sigue (cooldown 2h).', color: 'text-red-400' },
];

function Code({ children }: { children: string }) {
  return (
    <div className="panel-strong overflow-x-auto rounded-2xl p-5">
      <pre className="font-mono text-sm leading-7 text-[var(--foreground)]">{children}</pre>
    </div>
  );
}

export default function Instalar() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-4 pt-4 pb-16 md:px-6">
        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Guía de instalación
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            De cero a agente corriendo<br />
            <span className="text-[var(--muted)]">en tres pasos.</span>
          </h1>
        </div>

        {/* Requisitos */}
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-black/15 p-5">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Requisitos
          </div>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li>→ Node.js v22.5 o superior (para <code className="text-[var(--foreground)]">node:sqlite</code> nativo)</li>
            <li>→ npm o pnpm</li>
            <li>→ Una wallet de Cardano con ADA en preprod o mainnet</li>
          </ul>
        </div>

        {/* Paso 1 */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">
            <span className="mr-3 font-mono text-[var(--accent)]">01</span>
            Clonar e instalar
          </h2>
          <Code>{`git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent
npm install`}</Code>
        </div>

        {/* Paso 2 */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">
            <span className="mr-3 font-mono text-[var(--accent)]">02</span>
            Configurar variables de entorno
          </h2>
          <Code>{`# Crea el archivo .env en esqueje/agent/
cp .env.example .env   # o crea el archivo desde cero

ESQUEJE_MNEMONIC="word1 word2 ... word24"
CARDANO_NETWORK=preprod
BLOCKFROST_KEY=preproduJJ...
CREATOR_ADDRESS=addr_test1...`}</Code>
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
                {envVars.map((v) => (
                  <tr key={v.name} className="border-b border-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--accent-2)]">{v.name}</td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">{v.desc}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {v.default ?? (v.required ? <span className="text-red-400">requerido</span> : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">
            <span className="mr-3 font-mono text-[var(--accent)]">03</span>
            Compilar y ejecutar
          </h2>
          <Code>{`npm run build
node --experimental-sqlite dist/index.js`}</Code>
          <p className="text-sm leading-6 text-[var(--muted)]">
            En el primer arranque, el agente crea <code className="text-[var(--foreground)]">~/.esqueje/config.json</code>,{' '}
            <code className="text-[var(--foreground)]">~/.esqueje/SOUL.md</code> y la base de datos SQLite.
            La dirección de la wallet aparece en los logs.
          </p>
          <div className="panel rounded-2xl p-4 font-mono text-xs leading-6">
            <div className="text-[var(--accent)]">[ INFO] [main] Esqueje agent starting</div>
            <div className="text-[var(--muted)]">[ INFO] [main] Database initialized</div>
            <div className="text-[var(--muted)]">[ INFO] [main] Soul loaded</div>
            <div className="text-[var(--accent-2)]">[ INFO] [main] Initial balance seeded &#123;"adaBalance":124&#125;</div>
            <div className="text-[var(--muted)]">[ INFO] [daemon] Heartbeat daemon started</div>
            <div className="text-[var(--accent)]">
              [Esqueje] Agent running on preprod<br />
              Wallet: addr_test1q...
            </div>
          </div>
        </div>

        {/* Fondear */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">Fondear la wallet</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Para empezar en testnet (preprod), obtén ADA de faucet gratis:
          </p>
          <div className="panel rounded-2xl p-5 text-sm text-[var(--muted)]">
            <p className="mb-2">
              → Faucet oficial de Cardano:{' '}
              <a
                href="https://docs.cardano.org/cardano-testnets/tools/faucet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-2)] hover:underline"
              >
                docs.cardano.org/cardano-testnets/tools/faucet
              </a>
            </p>
            <p>→ Envía la dirección que aparece en los logs al faucet. Con 50–100 tADA alcanza para testear el ciclo completo.</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">Survival tiers</h2>
          <p className="text-sm text-[var(--muted)]">El agente ajusta su comportamiento automáticamente según el balance:</p>
          <div className="space-y-3">
            {tiers.map((t) => (
              <div key={t.tier} className="panel flex items-start gap-4 rounded-2xl p-4">
                <div className={`w-28 shrink-0 font-mono text-xs uppercase ${t.color}`}>{t.tier}</div>
                <div className="text-xs leading-5 text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">{t.range}</span> — {t.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dev */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Modo desarrollo</h2>
          <Code>{`npm run dev
# equivale a:
# node --experimental-sqlite --import tsx/esm src/index.ts

# Para ver más detalle:
LOG_LEVEL=debug npm run dev

# Para simular balance bajo:
MOCK_ADA_BALANCE=8 npm run dev   # fuerza tier critical`}</Code>
        </div>
      </section>
    </main>
  );
}
