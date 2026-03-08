import ClientWrapper from './ClientWrapper';

export const metadata = {
  title: 'Dashboard — Esqueje',
  description: 'Conectá tu wallet para gestionar vaults Marlowe y asignar presupuesto ADA a tus agentes.',
};

export default function Dashboard() {
  return (
    <main className="min-h-screen">
      <ClientWrapper />
    </main>
  );
}
