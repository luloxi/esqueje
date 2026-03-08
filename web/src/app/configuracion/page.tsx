import Link from 'next/link';

export default function Configuracion() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-green-600 hover:text-green-700 mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Configuración</h1>

        {/* Requisitos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">📋 Requisitos</h2>
          
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Node.js 18+</li>
            <li>Git</li>
            <li>Cuenta en Blockfrost (API key)</li>
            <li>~100 ADA para fondear el agente (testnet o mainnet)</li>
            <li>Servidor/cloud para hostear (VPS, Railway, etc.)</li>
          </ul>
        </section>

        {/* Instalación */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">🚀 Instalación</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre>
{`# 1. Clonar el repositorio
git clone https://github.com/luloxi/esqueje.git
cd esqueje/agent

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Inicializar el agente
npm run setup

# 5. Iniciar en modo desarrollo
npm run dev`}
              </pre>
            </div>
          </div>
        </section>

        {/* Variables de entorno */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">⚙️ Variables de Entorno</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
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
                  <td className="py-2 font-mono">PYTH_HERMES_URL</td>
                  <td className="py-2">Endpoint de Pyth Hermes</td>
                  <td className="py-2">https://hermes.pyth.network</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">CARDANO_NETWORK</td>
                  <td className="py-2">mainnet o testnet</td>
                  <td className="py-2">testnet</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">BLOCKFROST_API_KEY</td>
                  <td className="py-2">API key de Blockfrost</td>
                  <td className="py-2">-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">TRADING_INTERVAL</td>
                  <td className="py-2">Segundos entre trades</td>
                  <td className="py-2">300</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Deploy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">🌐 Deploy</h2>
          
          <h3 className="font-bold text-gray-800 mb-2">Opción 1: VPS (Recomendado)</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
            <pre>
{`# En tu servidor
npm run build
npm start

# Usar PM2 para mantenerlo corriendo
npm install -g pm2
pm2 start dist/index.js --name esqueje
pm2 save
pm2 startup`}
            </pre>
          </div>

          <h3 className="font-bold text-gray-800 mb-2">Opción 2: Railway/Render</h3>
          <p className="text-gray-600 mb-2">
            Conectar el repo directamente. El Procfile ya está incluido.
          </p>
        </section>

        {/* Fondear */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">💰 Fondear el Agente</h2>
          
          <p className="text-gray-600 mb-4">
            Después de la instalación, el agente generará una dirección de Cardano.
            Envía ADA a esa dirección para empezar:
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Recomendado:</strong> Empezar con 50-100 ADA en testnet
              para probar antes de usar mainnet.
            </p>
          </div>
        </section>

        {/* Monitoreo */}
        <section>
          <h2 className="text-2xl font-bold text-green-700 mb-4">📈 Monitoreo</h2>
          
          <p className="text-gray-600 mb-4">
            El agente loguea su estado en tiempo real. Puedes ver:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Balance actual</li>
            <li>Trades ejecutados</li>
            <li>Profit/loss total</li>
            <li>Estado de supervivencia</li>
            <li>Precios de Pyth</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
