import Link from 'next/link';

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-green-600 hover:text-green-700 mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Cómo funciona Esqueje</h1>

        {/* Concepto */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">🌱 Concepto</h2>
          <p className="text-gray-600 mb-4">
            Esqueje es un agente de inteligencia artificial que corre en la nube
            y opera de forma completamente autónoma en la blockchain de Cardano.
          </p>
          <p className="text-gray-600">
            Su objetivo es simple: generar suficientes ingresos mediante trading
            para pagar su propio hosting y, eventualmente, replicarse creando
            nuevos agentes (esquejes) con capital propio.
          </p>
        </section>

        {/* Ciclo de vida */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">🔄 Ciclo de Vida</h2>
          
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Nacimiento',
                desc: 'Se crea una wallet de Cardano y se fondea con capital inicial.',
              },
              {
                step: '2',
                title: 'Operación',
                desc: 'El agente consulta precios de Pyth cada 5 minutos y ejecuta trades en Minswap.',
              },
              {
                step: '3',
                title: 'Supervivencia',
                desc: 'Monitorea su balance. Si baja de cierto umbral, entra en modo conservación.',
              },
              {
                step: '4',
                title: 'Replicación',
                desc: 'Si acumula profits suficientes, crea un nuevo esqueje con su propia wallet.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Estados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">📊 Estados del Agente</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { status: 'Healthy', color: 'bg-green-100 text-green-700', desc: 'Balance > 50 ADA. Operación normal.' },
              { status: 'Low', color: 'bg-yellow-100 text-yellow-700', desc: 'Balance 20-50 ADA. Reduce frecuencia.' },
              { status: 'Critical', color: 'bg-red-100 text-red-700', desc: 'Balance 5-20 ADA. Modo supervivencia.' },
              { status: 'Dead', color: 'bg-gray-100 text-gray-700', desc: 'Balance = 0. Agente detenido.' },
            ].map((item) => (
              <div key={item.status} className={`p-4 rounded-lg ${item.color}`}>
                <div className="font-bold">{item.status}</div>
                <div className="text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Arquitectura */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">🏗️ Arquitectura</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Esqueje   │────▶│  Pyth Oracle│◀────│  Mercados   │
│   (Agente)  │     │  (Precios)  │     │  (Crypto)   │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Minswap    │────▶│  Cardano    │◀────│   Hosting   │
│   (DEX)     │     │  (Blockchain)│     │   (Cloud)   │
└─────────────┘     └─────────────┘     └─────────────┘`}
            </pre>
          </div>
        </section>

        {/* Estrategia */}
        <section>
          <h2 className="text-2xl font-bold text-green-700 mb-4">🎯 Estrategia de Trading</h2>
          
          <p className="text-gray-600 mb-4">
            Por defecto, Esqueje usa una estrategia de momentum simple:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Calcula medias móviles de 5 y 10 períodos</li>
            <li>Compra cuando MA5 {'>'} MA10 (momentum alcista)</li>
            <li>Vende cuando MA5 {'<'} MA10 (momentum bajista)</li>
            <li>Usa Pyth Entropy para factor aleatorio en decisiones</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
