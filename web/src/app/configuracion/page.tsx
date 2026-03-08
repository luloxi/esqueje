import Link from 'next/link';

export default function Configuracion() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-green-600 hover:text-green-700 mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Configuración Rápida</h1>

        {/* Paso 1 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold text-gray-800">Elegir Hosting que acepte ADA</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Opciones verificadas que aceptan pagos con Cardano (ADA):
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'ExtraVM', url: 'https://extravm.com', price: 'Desde $4.50/mes', features: 'VPS, 50+ cryptos, no KYC' },
              { name: 'Cherry Servers', url: 'https://cherryservers.com', price: 'Pago por hora', features: 'VPS, API, 10+ cryptos' },
              { name: 'Coin.Host', url: 'https://coin.host', price: 'Varía', features: 'CMS hosting, DDoS protection' },
              { name: 'Navicosoft', url: 'https://navicosoft.com', price: 'Desde $5/mes', features: 'Cardano VPS especializado' },
            ].map((host) => (
              <a
                key={host.name}
                href={host.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:border-green-500 transition"
              >
                <div className="font-bold text-green-700">{host.name}</div>
                <div className="text-sm text-gray-500">{host.price}</div>
                <div className="text-sm text-gray-600 mt-1">{host.features}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Paso 2 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-bold text-gray-800">Instalar Esqueje</h2>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`# Clonar y entrar al directorio
git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent

# Instalar dependencias
npm install

# Iniciar el agente
npm run dev`}
            </pre>
          </div>
        </section>

        {/* Paso 3 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <h2 className="text-xl font-bold text-gray-800">Fondear la Wallet</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Al iniciar, Esqueje genera una dirección de Cardano. Envía ADA a esa dirección:
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Recomendado:</strong> Empezar con 50-100 ADA en testnet.
              El agente mostrará su dirección en los logs.
            </p>
          </div>
        </section>

        {/* Paso 4 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <h2 className="text-xl font-bold text-gray-800">Configurar Pago Automático (Opcional)</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Para pagar el hosting automáticamente, configura:
          </p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`# .env
HOSTING_PROVIDER=extravm  # o cherry, coinhost
HOSTING_WALLET=addr1...    # dirección del proveedor
PAYMENT_THRESHOLD=20       # ADA mínimo para pagar`}
            </pre>
          </div>
        </section>

        {/* Opciones de pago */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-green-700 mb-4">💳 Opciones de Pago con ADA</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Opción A: VPS con ADA nativo</h3>
              <p className="text-gray-700 text-sm mb-2">
                Proveedores como ExtraVM, Cherry Servers y Coin.Host aceptan ADA directamente
                mediante procesadores como CoinGate o Coinify.
              </p>
              <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Recomendado</span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Opción B: Bridge a Stablecoins</h3>
              <p className="text-gray-700 text-sm mb-2">
                Si el proveedor no acepta ADA, Esqueje puede swapear ADA → USDC en Minswap
                y pagar con stablecoins.
              </p>
              <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">Alternativa</span>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">Opción C: Servicio Puente</h3>
              <p className="text-gray-700 text-sm">
                Crear un servicio intermedio que reciba ADA y pague el hosting en fiat/stablecoins
                en nombre del agente.
              </p>
            </div>
          </div>
        </section>

        {/* Variables */}
        <section>
          <h2 className="text-2xl font-bold text-green-700 mb-4">⚙️ Variables de Entorno</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Variable</th>
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-left py-2">Default</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b">
                  <td className="py-2 font-mono">CARDANO_NETWORK</td>
                  <td className="py-2">mainnet o testnet</td>
                  <td className="py-2">testnet</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">TRADING_INTERVAL</td>
                  <td className="py-2">Segundos entre trades</td>
                  <td className="py-2">300</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">HEALTHY_THRESHOLD</td>
                  <td className="py-2">ADA mínimo para estado healthy</td>
                  <td className="py-2">50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
