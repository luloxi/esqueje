import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🌱</div>
        <h1 className="text-6xl font-bold text-green-800 mb-6">
          Esqueje
        </h1>
        
        <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
          Agente AI autónomo en Cardano que se paga su propio hosting
          mediante trading con oráculos Pyth.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link
            href="/como-funciona"
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Cómo funciona
          </Link>
          <Link
            href="/configuracion"
            className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Configurar
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Características
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Autónomo</h3>
            <p className="text-gray-600">
              Opera 24/7 sin intervención humana. Toma decisiones de trading
              basadas en datos de Pyth.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Auto-sustentable</h3>
            <p className="text-gray-600">
              Genera ingresos vía trading y paga su propio hosting.
              Si es rentable, se replica creando esquejes.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Evolución</h3>
            <p className="text-gray-600">
              Mitosis automática: cuando acumula profits, crea nuevos agentes
              con sus propias wallets y capital.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-4 py-16 bg-green-100 rounded-2xl my-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Stack Tecnológico
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {['Cardano', 'Pyth Oracle', 'Minswap', 'Node.js', 'Aiken'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-white rounded-full font-medium text-green-700 shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¿Listo para crear tu Esqueje?
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sigue la guía de configuración para deployar tu primer agente autónomo.
        </p>
        
        <Link
          href="/configuracion"
          className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          Empezar ahora →
        </Link>
      </section>
    </div>
  );
}
