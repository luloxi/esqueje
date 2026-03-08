import Link from 'next/link';
import { getCapitalPlan, getSurvivalThresholds, treasuryDefaults } from '@/lib/runtimeEconomics';

export const metadata = {
  title: 'Instalar — Esqueje',
  description: 'Lanzamiento simple para humanos y para agentes ya fondeados, con mínimos reales de tesorería y un flujo claro de control.',
};

const capitalPlan = getCapitalPlan();
const thresholds = getSurvivalThresholds();

const requiredEnvVars = [
  {
    name: 'ESQUEJE_MNEMONIC',
    desc: 'Seed de la wallet operativa del agente. Si no está, el runtime crea una wallet efímera de demo.',
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
    desc: 'Project ID de Blockfrost para leer balance real on-chain.',
    required: false,
    format: 'mainnet... | preprod... | preview...',
  },
  {
    name: 'CREATOR_ADDRESS',
    desc: 'Dirección del humano u operador que controla y recibe alertas del agente.',
    required: false,
    format: 'addr1... | addr_test1...',
  },
  {
    name: 'LOG_LEVEL',
    desc: 'Nivel de verbosidad del runtime.',
    required: false,
    format: 'debug | info | warn | error',
  },
];

const treasuryEnvVars = [
  {
    name: 'MONTHLY_HOSTING_ADA',
    desc: 'Costo mensual de hosting usado para reservas y runway.',
    defaultValue: treasuryDefaults.monthlyHostingAda.toString(),
  },
  {
    name: 'MONTHLY_OPERATIONS_ADA',
    desc: 'Costo mensual no-hosting: indexación, automatización y margen operativo.',
    defaultValue: treasuryDefaults.monthlyOperationsAda.toString(),
  },
  {
    name: 'TARGET_MONTHLY_PROFIT_ADA',
    desc: 'Ganancia mensual mínima que justifica que el agente siga creciendo.',
    defaultValue: treasuryDefaults.targetMonthlyProfitAda.toString(),
  },
  {
    name: 'MIN_AGENT_BALANCE_ADA',
    desc: 'Piso mínimo por agente. El runtime usa el mayor entre este piso y el cálculo financiero.',
    defaultValue: treasuryDefaults.minimumAgentBalanceAda.toString(),
  },
  {
    name: 'REPLICATION_SEED_ADA',
    desc: 'Capital mínimo con el que debería nacer un hijo.',
    defaultValue: treasuryDefaults.replicationSeedAda.toString(),
  },
  {
    name: 'MIN_PROFIT_FOR_REPLICATION_ADA',
    desc: 'Ganancia mensual mínima antes de sugerir replicación.',
    defaultValue: treasuryDefaults.minimumProfitForReplicationAda.toString(),
  },
  {
    name: 'MAX_TRADE_ALLOCATION_PCT',
    desc: 'Porcentaje máximo del balance que puede arriesgarse por trade.',
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

function Step({ n, title }: { n: string; title: string }) {
  return (
    <h2 className="text-2xl font-bold">
      <span className="mr-3 font-mono text-[var(--accent)]">{n}</span>
      {title}
    </h2>
  );
}

export default function Instalar() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 pt-4 pb-16 md:px-6">
        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Lanzamiento simple
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Cómo lanzar Esqueje sin fingir que un agente puede hacer solo lo que requiere un humano.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Hay dos caminos: el humano que despliega por primera vez y el agente que ya llega
            fondeado para replicarse. Si hosting, billing o API requieren email, captcha, wallet
            browser o verificación manual, ese paso queda del lado humano y el agente debe reutilizar
            esa cuenta ya aprobada.
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {[
            {
              id: 'humano',
              title: 'Humano, primer lanzamiento',
              body: 'Crea o reutiliza las cuentas externas, prepara la wallet del agente, lo arranca y recién después conecta el dashboard.',
            },
            {
              id: 'agente',
              title: 'Agente ya fondeado',
              body: 'No se registra en servicios nuevos. Hereda el hosting, el billing y las API keys de su operador o de su padre y nace con capital suficiente.',
            },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="panel rounded-[1.75rem] p-6 transition hover:border-[var(--accent)]"
            >
              <h2 className="mb-3 text-2xl font-bold">{item.title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{item.body}</p>
            </a>
          ))}
        </div>

        <div className="mb-10 rounded-[1.75rem] border border-[var(--border)] bg-black/20 p-6">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Mínimo realista por agente
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {[
                ['Hosting mensual', `${treasuryDefaults.monthlyHostingAda} ADA`],
                ['Operación mensual', `${treasuryDefaults.monthlyOperationsAda} ADA`],
                ['Runway objetivo', `${treasuryDefaults.targetRunwayDays} días = ${capitalPlan.targetReserveAda} ADA`],
                ['Capital de trading requerido', `${capitalPlan.requiredTradingCapitalAda} ADA`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between rounded-xl border border-white/6 bg-black/10 px-4 py-3 text-sm">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="font-mono text-[var(--accent-2)]">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-black/10 p-5">
              <div className="mb-2 text-xl font-bold">{capitalPlan.minimumOperationalBalanceAda} ADA por agente</div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Ese es el piso que el runtime toma como sano. Menos que eso puede alcanzar para
                demostrar el loop o para sobrevivir unos días, pero no para cubrir burn mensual,
                sostener trades y aspirar a replicarse sin suicidar al padre.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Si un padre quiere abrir un hijo sin quedar descapitalizado, el objetivo sube a{' '}
                <strong className="text-[var(--foreground)]">{capitalPlan.recommendedParentBalanceAda} ADA</strong>.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Datos ilustrativos, sincronizados con los defaults del runtime actual.
          </p>
        </div>

        <section id="humano" className="mb-12 space-y-4 scroll-mt-24">
          <Step n="01" title="Flujo para humano que lanza por primera vez" />
          <div className="space-y-3">
            {[
              ['1. Cuenta humana primero', 'Creá o reutilizá la cuenta de hosting y la de Blockfrost. Si el proveedor pide email, captcha, wallet browser o verificación humana, el agente no puede hacer ese alta solo.'],
              ['2. Wallet dedicada', `Creá una wallet sólo para el agente y fondeala con al menos ${capitalPlan.minimumOperationalBalanceAda} ADA en mainnet. Para prueba, usá preprod.`],
              ['3. Runtime en un VPS simple', 'Un VPS chico con Ubuntu 22.04 y Node 22 alcanza para el runtime actual.'],
              ['4. Dashboard después del arranque', 'Primero necesitás la dirección real del agente. Recién cuando ya arrancó y la imprimió en logs, conectás tu wallet humana en el dashboard y lo registrás.'],
            ].map(([title, body], index) => (
              <div key={title as string} className="panel rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">{`0${index + 1}`}</span>
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
          <Code>{`# VPS nuevo o reutilizado
ssh root@<IP_DEL_SERVIDOR>

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git

git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent
npm install
npm run build`}</Code>
          <Code>{`cat > .env <<'ENVEOF'
ESQUEJE_MNEMONIC="word1 word2 word3 ... word24"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...
LOG_LEVEL=info
ENVEOF

npm install -g pm2
pm2 start dist/index.js --name esqueje --node-args="--experimental-sqlite"
pm2 save`}</Code>
        </section>

        <section id="agente" className="mb-12 space-y-4 scroll-mt-24">
          <Step n="02" title="Flujo para agente ya fondeado que quiere replicarse" />
          <div className="space-y-3">
            {[
              ['2.1', 'No crea cuentas nuevas', 'Usa una cuenta humana ya existente de hosting/billing, un proyecto Blockfrost ya aprobado y credenciales SSH/API delegadas.'],
              ['2.2', `Nace con caja real`, `El hijo debería arrancar con ${capitalPlan.replicationSeedAda} ADA. Si el padre no puede quedar todavía con su propio mínimo de ${capitalPlan.minimumOperationalBalanceAda} ADA, no debería lanzarlo.`],
              ['2.3', 'Provisiona carpeta o servidor', 'Puede vivir en el mismo VPS del padre si el operador lo acepta, o en otro VPS pagado desde la misma cuenta. Lo importante es que el alta humana ya exista.'],
              ['2.4', 'Se registra en el dashboard humano', 'El operador conecta su wallet, da de alta la dirección del hijo y opcionalmente despliega un vault para fondeo controlado.'],
            ].map(([num, title, body]) => (
              <div key={num as string} className="panel rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">{num}</span>
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
          <Code>{`# Ejemplo mínimo para un hijo usando la misma cuenta humana ya aprobada
ssh root@<IP_DEL_SERVIDOR_PADRE_O_HIJO>
cd /opt
git clone https://github.com/luloxi/esqueje.git esqueje-hijo
cd esqueje-hijo/agent
npm install
npm run build

cat > .env <<'ENVEOF'
ESQUEJE_MNEMONIC="seed del hijo"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...   # wallet del humano que supervisa
MIN_AGENT_BALANCE_ADA=${capitalPlan.minimumOperationalBalanceAda}
REPLICATION_SEED_ADA=${capitalPlan.replicationSeedAda}
ENVEOF

pm2 start dist/index.js --name esqueje-hijo --node-args="--experimental-sqlite"
pm2 save`}</Code>
        </section>

        <section className="mb-12 space-y-4">
          <Step n="03" title="Cómo conectar la cuenta humana para controlar y monitorear" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['A. Arrancá el agente primero', 'Necesitás su dirección `addr1...` o `addr_test1...`, que aparece en los logs al primer boot.'],
              ['B. Conectá tu wallet en el dashboard', 'Esa wallet es la del humano operador. Sirve para firmar el vault y para controlar presupuesto. No es la wallet interna del agente.'],
              ['C. Registrá la dirección del agente', 'Pegás la dirección del agente, le asignás un presupuesto y opcionalmente desplegás un vault Marlowe para fondeo controlado.'],
            ].map(([title, body]) => (
              <div key={title as string} className="panel rounded-2xl p-5">
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
          <Code>{`# Ver logs al boot
pm2 logs esqueje

# Salida esperada
[Esqueje] Agent running on mainnet
Wallet: addr1q...
Minimum viable balance: ${capitalPlan.minimumOperationalBalanceAda} ADA
Balance updated: 0 ADA`}</Code>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Después de eso, abrí el{' '}
            <Link href="/dashboard" className="text-[var(--accent-2)] hover:underline">
              dashboard
            </Link>
            , conectá la wallet del operador, agregá la dirección del agente y decidí si lo fondeás
            directo o vía vault. El monitoreo base sigue siendo vía logs + Blockfrost + estado del vault.
          </p>
        </section>

        <section className="mb-12 space-y-4">
          <Step n="04" title="Qué no puede resolver solo un agente" />
          <div className="space-y-2">
            {[
              'Crear cuentas nuevas si el servicio exige email, captcha, KYC o aprobación humana.',
              'Instalar una extensión de wallet en el navegador del humano y autorizarla.',
              'Aceptar términos, completar pagos o ampliar planes cuando el proveedor bloquea la automatización.',
              'Asumir que 50-100 ADA alcanzan para operar, pagar burn mensual y además replicarse con margen.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--muted)]">
                <span className="text-orange-400">!</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 space-y-4">
          <Step n="05" title="Variables de entorno" />
          <div className="panel rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Variable</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Descripción</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Requerida</th>
                </tr>
              </thead>
              <tbody>
                {requiredEnvVars.map((item) => (
                  <tr key={item.name} className="border-b border-white/5">
                    <td className="px-4 py-3 align-top font-mono text-xs text-[var(--accent-2)]">{item.name}</td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">
                      {item.desc}
                      <br />
                      <span className="font-mono text-[var(--accent-2)]/70">{item.format}</span>
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
          <div className="panel rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Tesorería</th>
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
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Testnet primero si querés validar el flujo</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Usá <code className="font-mono text-xs text-[var(--accent-2)]">CARDANO_NETWORK=preprod</code>,
            conectá un proyecto preprod de Blockfrost y fondeá la dirección del agente con tADA desde el faucet oficial.
          </p>
          <div className="panel rounded-2xl p-5 text-sm text-[var(--muted)]">
            <p className="mb-2">
              Faucet oficial:{' '}
              <a
                href="https://docs.cardano.org/cardano-testnets/tools/faucet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-2)] hover:underline"
              >
                docs.cardano.org/cardano-testnets/tools/faucet
              </a>
            </p>
            <p className="mb-2">
              Blockfrost:{' '}
              <a
                href="https://blockfrost.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-2)] hover:underline"
              >
                blockfrost.io
              </a>
            </p>
            <p>
              Referencia de hosting con pago cripto:{' '}
              <a
                href="https://www.cherryservers.com/knowledge/docs/usage-billing/payment-methods"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-2)] hover:underline"
              >
                Cherry Servers payment methods
              </a>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Healthy', `>= ${thresholds.healthy} ADA`],
              ['Low compute', `${thresholds.critical}-${thresholds.healthy - 1} ADA`],
              ['Critical', `1-${thresholds.critical - 1} ADA`],
            ].map(([title, body]) => (
              <div key={title as string} className="rounded-xl border border-[var(--border)] bg-black/10 px-4 py-4 text-sm text-[var(--muted)]">
                <div className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)]">{title}</div>
                <div>{body}</div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
