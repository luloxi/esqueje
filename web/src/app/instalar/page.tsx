export const metadata = {
  title: 'Instalar — Esqueje',
  description: 'Protocolo de despliegue para agentes y operadores: VPS pagado en ADA, wallet operativa, Blockfrost, configuración y arranque.',
};

const envVars = [
  { name: 'ESQUEJE_MNEMONIC', desc: 'Frase semilla de la wallet operativa del agente (24 palabras separadas por espacios).', required: true, format: 'word1 word2 ... word24' },
  { name: 'BLOCKFROST_KEY', desc: 'API key de Blockfrost para leer balance real on-chain.', required: false, format: 'preprodXXXXXXXXXXXXXX o mainnetXXXXXXXXXXXXXX' },
  { name: 'CARDANO_NETWORK', desc: 'Red de Cardano sobre la que opera el agente.', required: false, format: 'mainnet | preprod | preview' },
  { name: 'CREATOR_ADDRESS', desc: 'Dirección Cardano del creador/operador para alertas y trazabilidad.', required: false, format: 'addr1... o addr_test1...' },
  { name: 'LOG_LEVEL', desc: 'Verbosidad de los logs del proceso.', required: false, format: 'debug | info | warn | error' },
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
      <section className="mx-auto max-w-3xl px-4 pt-4 pb-16 md:px-6">

        {/* Header */}
        <div className="mb-10 space-y-4">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Protocolo de despliegue
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Cómo replicarse en un VPS<br />
            <span className="text-[var(--muted)]">pagado en ADA.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Esta guía está escrita para que tanto un operador humano como un agente con acceso a una wallet ADA puedan seguirla paso a paso y terminar con una instancia de Esqueje corriendo en producción.
          </p>
        </div>

        {/* Precondiciones */}
        <div className="mb-10 rounded-2xl border border-[var(--border)] bg-black/20 p-6">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Precondiciones
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['ADA disponible', 'Mínimo ~100 ADA: ~50 para pagar meses de VPS por adelantado + ~50 de capital operativo inicial.'],
              ['Wallet con seed', 'Una frase semilla de 24 palabras (Shelley era). Puede ser la wallet del agente padre o una nueva.'],
              ['Cuenta Blockfrost', 'API key gratuita para leer balance real on-chain. Registro en blockfrost.io.'],
              ['Dirección de email', 'Cherry Servers requiere cuenta para generar la factura y entregar credenciales SSH.'],
            ].map(([title, desc]) => (
              <div key={title as string} className="rounded-xl border border-[var(--border)] bg-black/10 p-4">
                <div className="mb-1 font-mono text-xs font-bold text-[var(--accent-2)]">{title}</div>
                <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paso 1: VPS */}
        <div className="mb-10 space-y-4">
          <Step n="01" title="Adquirir un VPS pagado en ADA — Cherry Servers" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Cherry Servers acepta Cardano (ADA) como método de pago. El plan más pequeño (<strong className="text-[var(--foreground)]">Cloud VPS 1</strong>: 1 vCPU, 1 GB RAM, 25 GB SSD) es suficiente para correr el agente.
          </p>
          <div className="space-y-3">
            {[
              ['1.1', 'Crear cuenta', 'Ir a cherryservers.com → Sign up. Verificar email.'],
              ['1.2', 'Agregar ADA como método de pago', 'Settings → Billing → Add payment method → Crypto → seleccionar Cardano (ADA). Cherry genera una dirección de depósito. Enviar la cantidad requerida desde tu wallet. El crédito aparece una vez confirmada la transacción on-chain (típicamente 1–2 minutos en mainnet).'],
              ['1.3', 'Desplegar servidor', 'Dashboard → Deploy new server → Cloud VPS → elegir plan → Ubuntu 22.04 LTS → región más cercana → Deploy. Cherry envía las credenciales SSH (IP, usuario root, contraseña o clave pública) por email y las muestra en el dashboard.'],
              ['1.4', 'Anotar la IP y credenciales SSH', 'Necesarias para el paso 03. Formato esperado: IP pública IPv4 o IPv6.'],
            ].map(([num, title, desc]) => (
              <div key={num as string} className="panel rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">{num}</span>
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-black/15 p-4 text-sm text-[var(--muted)]">
            Referencia de billing Cherry Servers:{' '}
            <a
              href="https://www.cherryservers.com/knowledge/docs/usage-billing/payment-methods"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-2)] hover:underline"
            >
              cherryservers.com/knowledge/docs/usage-billing/payment-methods
            </a>
          </div>
        </div>

        {/* Paso 2: Blockfrost */}
        <div className="mb-10 space-y-4">
          <Step n="02" title="Obtener API key de Blockfrost" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Blockfrost es la capa de indexación que el agente usa para leer su balance real on-chain. Sin esta key el agente opera con balance simulado.
          </p>
          <div className="space-y-3">
            {[
              ['2.1', 'Registrarse', 'blockfrost.io → Create account (gratuito hasta 50.000 requests/día).'],
              ['2.2', 'Crear proyecto', 'Dashboard → Add project → elegir red (Mainnet o Preprod) → copiar el Project ID.'],
              ['2.3', 'Formato de la key', 'Mainnet: comienza con "mainnet". Preprod: comienza con "preprod". Ejemplo: preprodAbCdEfGhIjKlMnOpQr'],
            ].map(([num, title, desc]) => (
              <div key={num as string} className="panel rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--accent)]">{num}</span>
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paso 3: Wallet */}
        <div className="mb-10 space-y-4">
          <Step n="03" title="Preparar la wallet del agente" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            El agente necesita una frase semilla de 24 palabras para derivar su dirección Cardano y firmar transacciones. Esta wallet debe ser exclusiva del agente — no mezclar con tesorería personal.
          </p>
          <div className="space-y-3">
            {[
              {
                title: 'Opción A — wallet nueva (recomendado)',
                body: 'Crear una wallet nueva en Lace, Eternl o Nami → exportar/anotar las 24 palabras → NO fondear aún (el agente va a mostrar su dirección al arrancar y recién ahí se fondea). Esta opción mantiene la tesorería personal separada del runtime del agente.',
              },
              {
                title: 'Opción B — reutilizar seed existente (avanzado)',
                body: 'Exportar la frase semilla de una wallet existente y usarla como ESQUEJE_MNEMONIC. El agente puede operar sobre la misma wallet. Solo tiene sentido si la wallet fue creada para el agente y se entiende el riesgo de poner secretos en un servidor.',
              },
              {
                title: 'Opción C — wallet efímera (solo demo)',
                body: 'Si ESQUEJE_MNEMONIC no está definida, el agente genera una wallet temporal en memoria. No persiste entre reinicios. Útil para probar el flujo sin ADA real.',
              },
            ].map((mode) => (
              <div key={mode.title} className="panel rounded-2xl p-5">
                <h3 className="mb-2 font-semibold">{mode.title}</h3>
                <p className="text-sm leading-6 text-[var(--muted)]">{mode.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paso 4: Setup servidor */}
        <div className="mb-10 space-y-4">
          <Step n="04" title="Configurar el servidor" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Conectarse por SSH y preparar el entorno. Node.js v22+ es requerido por el módulo <code className="font-mono text-xs text-[var(--accent-2)]">node:sqlite</code> built-in.
          </p>
          <Code>{`# Conectarse al servidor
ssh root@<IP_DEL_SERVIDOR>

# Instalar Node.js v22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git

# Verificar versiones
node --version   # debe ser >= 22.5.0
npm --version`}</Code>
        </div>

        {/* Paso 5: Instalar agente */}
        <div className="mb-10 space-y-4">
          <Step n="05" title="Instalar y configurar el agente" />
          <Code>{`# Clonar repositorio
git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent
npm install

# Crear archivo de variables de entorno
cat > .env <<'ENVEOF'
ESQUEJE_MNEMONIC="word1 word2 word3 ... word24"
CARDANO_NETWORK=mainnet
BLOCKFROST_KEY=mainnetXXXXXXXXXXXXXXXXX
CREATOR_ADDRESS=addr1...
LOG_LEVEL=info
ENVEOF

# Compilar
npm run build`}</Code>

          {/* Tabla env vars */}
          <div className="panel rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Variable</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Descripción / Formato</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-[var(--muted)]">Requerida</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((v) => (
                  <tr key={v.name} className="border-b border-white/5">
                    <td className="px-4 py-3 align-top font-mono text-xs text-[var(--accent-2)]">{v.name}</td>
                    <td className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">
                      {v.desc}<br />
                      <span className="font-mono text-[var(--accent-2)]/70">{v.format}</span>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs">
                      {v.required
                        ? <span className="text-orange-400">sí</span>
                        : <span className="text-[var(--muted)]">no</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paso 6: Arrancar con process manager */}
        <div className="mb-10 space-y-4">
          <Step n="06" title="Arrancar con process manager" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Para mantener el proceso activo después de cerrar SSH y que se reinicie solo ante caídas:
          </p>
          <Code>{`# Opción A — PM2 (recomendado, más simple)
npm install -g pm2
pm2 start dist/index.js --name esqueje
pm2 save
pm2 startup   # genera comando para arrancar al reboot, ejecutarlo

# Opción B — systemd
cat > /etc/systemd/system/esqueje.service <<'SVCEOF'
[Unit]
Description=Esqueje Agent
After=network.target

[Service]
WorkingDirectory=/root/esqueje/agent
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
EnvironmentFile=/root/esqueje/agent/.env

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable esqueje
systemctl start esqueje`}</Code>
        </div>

        {/* Paso 7: Leer dirección y fondear */}
        <div className="mb-10 space-y-4">
          <Step n="07" title="Leer la dirección del agente y fondearla" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Al arrancar, el agente imprime su dirección Cardano derivada del mnemonic. Esa es la dirección a fondear.
          </p>
          <Code>{`# Ver logs en tiempo real
pm2 logs esqueje
# o
journalctl -u esqueje -f

# Output esperado al arrancar:
[Esqueje] Agent running on mainnet
Wallet address: addr1q...
Balance: 0.00 ADA  ← fondear ahora
Survival tier: dead`}</Code>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Lace', 'Send → pegar la dirección del agente → ingresar monto → confirmar. Lace muestra la dirección en la extensión del navegador.'],
              ['Eternl', 'Send → pegar dirección → monto → Sign & Submit. Recomendado usar una cuenta separada.'],
              ['Cualquier wallet', 'El protocolo es el mismo: copiar addr1... de los logs, enviar ADA, esperar 1–2 bloques (~20–40 segundos) para confirmación.'],
            ].map(([title, body]) => (
              <div key={title as string} className="panel rounded-2xl p-5">
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-xs leading-5 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
          <Code>{`# Log esperado después de fondear (siguiente ciclo del heartbeat):
Balance updated: 85.00 ADA
Survival tier: healthy
[Agent] Turn #1 — Think → Budget → Earn → Pay → Sleep`}</Code>
        </div>

        {/* Verificación */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">Verificación del despliegue</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            El agente está correctamente desplegado cuando todos estos puntos son verdaderos:
          </p>
          <div className="space-y-2">
            {[
              'El proceso no se reinicia continuamente (pm2 status muestra "online").',
              'Los logs muestran una dirección Cardano válida (comienza con addr1 en mainnet, addr_test1 en preprod).',
              'El balance muestra un valor mayor a cero después de fondear.',
              'El survival tier aparece como "healthy" o "low_compute" (no "dead").',
              'Se registran turnos periódicos en los logs (Turn #N).',
              'El heartbeat daemon aparece en los logs cada ~60 segundos.',
            ].map((check) => (
              <div key={check} className="flex gap-3 rounded-xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--muted)]">
                <span className="text-[var(--accent)]">✓</span>
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testnet */}
        <div className="mb-10 space-y-4">
          <h2 className="text-2xl font-bold">Probar en testnet primero</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Para validar el ciclo completo sin ADA real, usar <code className="font-mono text-xs text-[var(--accent-2)]">CARDANO_NETWORK=preprod</code> y obtener tADA del faucet oficial:
          </p>
          <div className="panel rounded-2xl p-5 text-sm text-[var(--muted)]">
            <p className="mb-2">
              → Faucet oficial:{' '}
              <a
                href="https://docs.cardano.org/cardano-testnets/tools/faucet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-2)] hover:underline"
              >
                docs.cardano.org/cardano-testnets/tools/faucet
              </a>
            </p>
            <p>→ Pegar la dirección <code className="font-mono text-xs text-[var(--accent-2)]">addr_test1...</code> que aparece en los logs. Con 50–100 tADA alcanza para testear el ciclo completo incluyendo survival tiers y funding strategies.</p>
          </div>
        </div>

        {/* Dev */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Modo desarrollo local</h2>
          <Code>{`# Sin compilar, con hot reload
npm run dev

# Con logs verbosos
LOG_LEVEL=debug npm run dev`}
          </Code>
        </div>

      </section>
    </main>
  );
}
