import ClientWrapper from './ClientWrapper';

export const metadata = {
  title: 'Dashboard — Esqueje',
  description: 'Conectá la wallet del operador para registrar agentes, desplegar vaults Marlowe y controlar presupuesto ADA.',
};

export default function Dashboard() {
  return (
    <main className="min-h-screen">
      <ClientWrapper />
    </main>
  );
}
