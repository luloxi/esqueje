'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, CardanoWallet } from '@meshsdk/react';
import { deployVaultContract, submitContractTx } from '@/lib/marlowe';

export interface AgentConfig {
  id: string;
  name: string;
  address: string;
  allocationAda: number;
  contractId?: string;
  deployedAt?: number;
}

const DEFAULT_RUNTIME = 'https://preprod.marlowe-runtime.iog.io';
const LS_AGENTS = 'esqueje:agents';
const LS_RUNTIME = 'esqueje:runtimeUrl';

function truncate(addr: string) {
  if (addr.length < 20) return addr;
  return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
}

export default function DashboardClient() {
  const { wallet, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAda, setWalletAda] = useState<number | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [runtimeUrl, setRuntimeUrl] = useState(DEFAULT_RUNTIME);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', address: '', allocationAda: 50 });
  const [deploying, setDeploying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_AGENTS);
      if (saved) setAgents(JSON.parse(saved));
      const rt = localStorage.getItem(LS_RUNTIME);
      if (rt) setRuntimeUrl(rt);
    } catch { /* ignore */ }
  }, []);

  // Load wallet info when connected
  const loadWallet = useCallback(async () => {
    if (!connected || !wallet) return;
    try {
      const addr = await wallet.getChangeAddress();
      setWalletAddress(addr);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lovelace = await (wallet as any).getLovelace() as string ?? '0';
      setWalletAda(Math.floor(Number(lovelace) / 1_000_000));
    } catch { /* ignore */ }
  }, [connected, wallet]);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  function saveAgents(updated: AgentConfig[]) {
    setAgents(updated);
    localStorage.setItem(LS_AGENTS, JSON.stringify(updated));
  }

  function saveRuntime(url: string) {
    setRuntimeUrl(url);
    localStorage.setItem(LS_RUNTIME, url);
  }

  function addAgent() {
    if (!newAgent.name.trim() || !newAgent.address.trim() || newAgent.allocationAda <= 0) return;
    saveAgents([...agents, { id: Date.now().toString(), ...newAgent }]);
    setNewAgent({ name: '', address: '', allocationAda: 50 });
    setShowAddAgent(false);
  }

  async function deployVault(agent: AgentConfig) {
    if (!connected || !wallet) return setError('Conectá tu wallet primero.');
    setDeploying(agent.id);
    setError(null);
    setSuccess(null);
    try {
      const funder = await wallet.getChangeAddress();
      const now = Date.now();
      const depositDeadline = now + 24 * 60 * 60 * 1000;  // 24 h para depositar
      const periodEnd = now + 30 * 24 * 60 * 60 * 1000;   // 30 días de vigencia

      const { contractId, txCborHex } = await deployVaultContract(
        runtimeUrl,
        funder,
        agent.address,
        agent.allocationAda * 1_000_000,
        depositDeadline,
        periodEnd,
      );

      const signedTx = await wallet.signTx(txCborHex, true);
      await submitContractTx(runtimeUrl, contractId, signedTx);

      saveAgents(agents.map(a =>
        a.id === agent.id ? { ...a, contractId, deployedAt: Date.now() } : a,
      ));
      setSuccess(`Vault deployado para ${agent.name}. Contract ID: ${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setDeploying(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 pb-16 md:px-6 space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Panel de control
        </div>
        <h1 className="text-4xl font-bold leading-tight">
          Vault de agentes
        </h1>
        <p className="max-w-2xl text-[var(--muted)] leading-7">
          Conectá tu wallet para ver y gestionar los presupuestos asignados a tus instancias de Esqueje.
          Cada agente recibe una asignación de ADA en un contrato Marlowe — si no la reclama antes del plazo, los fondos vuelven a vos.
        </p>
      </div>

      {/* Wallet connect */}
      <div className="panel rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {connected && walletAddress ? (
            <div className="space-y-1">
              <div className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest">Wallet conectada</div>
              <div className="font-mono text-sm text-[var(--foreground)]">{truncate(walletAddress)}</div>
              {walletAda !== null && (
                <div className="text-2xl font-bold">
                  {walletAda.toLocaleString()} <span className="text-[var(--accent)] text-base">ADA</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest">Sin wallet</div>
              <p className="text-sm text-[var(--muted)]">Conectá Lace, Eternl o Nami para gestionar vaults.</p>
            </div>
          )}
        </div>
        <div className="shrink-0">
          <CardanoWallet
            label="Conectar wallet"
            isDark
          />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          <span className="font-mono text-xs uppercase tracking-widest block mb-1 text-red-400">Error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-5 py-4 text-sm text-[var(--accent)]">
          <span className="font-mono text-xs uppercase tracking-widest block mb-1">OK</span>
          {success}
        </div>
      )}

      {/* Agents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Tus agentes</h2>
          <button
            onClick={() => setShowAddAgent(v => !v)}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-white"
          >
            {showAddAgent ? 'Cancelar' : '+ Agregar agente'}
          </button>
        </div>

        {/* Add agent form */}
        {showAddAgent && (
          <div className="panel-strong rounded-2xl p-5 space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Nuevo agente</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Nombre</label>
                <input
                  value={newAgent.name}
                  onChange={e => setNewAgent(v => ({ ...v, name: e.target.value }))}
                  placeholder="Agente 1"
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs text-[var(--muted)]">Dirección Cardano</label>
                <input
                  value={newAgent.address}
                  onChange={e => setNewAgent(v => ({ ...v, address: e.target.value }))}
                  placeholder="addr1q... o addr_test1..."
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Asignación (ADA)</label>
                <input
                  type="number"
                  min={1}
                  value={newAgent.allocationAda}
                  onChange={e => setNewAgent(v => ({ ...v, allocationAda: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <button
              onClick={addAgent}
              className="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-[#08110d] transition hover:-translate-y-px"
            >
              Agregar
            </button>
          </div>
        )}

        {/* Agents list */}
        {agents.length === 0 && !showAddAgent && (
          <div className="rounded-2xl border border-[var(--border)] bg-black/10 px-5 py-8 text-center text-sm text-[var(--muted)]">
            No hay agentes configurados. Agregá la dirección Cardano de tu instancia de Esqueje.
          </div>
        )}

        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.id} className="panel rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{agent.name}</span>
                    {agent.contractId && (
                      <span className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                        vault activo
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-[var(--muted)] truncate">{agent.address}</div>
                  <div className="text-sm text-[var(--foreground)]">
                    Asignación:{' '}
                    <span className="font-bold text-[var(--accent-2)]">{agent.allocationAda} ADA</span>
                    {agent.contractId && (
                      <span className="ml-3 font-mono text-[10px] text-[var(--muted)]">
                        {truncate(agent.contractId)}
                      </span>
                    )}
                  </div>
                  {agent.deployedAt && (
                    <div className="text-xs text-[var(--muted)]">
                      Deployado: {new Date(agent.deployedAt).toLocaleDateString('es-AR')}
                      {' · '}vence en 30 días
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!agent.contractId && (
                    <button
                      onClick={() => deployVault(agent)}
                      disabled={!connected || deploying === agent.id}
                      className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[#08110d] transition hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deploying === agent.id ? 'Deployando…' : 'Deploy vault'}
                    </button>
                  )}
                  <button
                    onClick={() => saveAgents(agents.filter(a => a.id !== agent.id))}
                    className="rounded-full border border-red-400/30 px-3 py-2 text-xs text-red-400 transition hover:border-red-400/60"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="panel-strong rounded-2xl p-6 space-y-4">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          Cómo funciona el vault
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['1. Deploy', 'Se crea un contrato Marlowe on-chain que bloquea la asignación para el agente.'],
            ['2. Agente reclama', 'El agente detecta el contrato y envía una transacción de "claim" para recibir los fondos.'],
            ['3. Vence el plazo', 'Si el agente no reclama en 30 días, el contrato cierra y devuelve los ADA a tu wallet.'],
          ].map(([title, desc]) => (
            <div key={title as string} className="rounded-xl border border-[var(--border)] bg-black/10 p-4">
              <div className="mb-1 font-mono text-xs font-bold text-[var(--accent-2)]">{title}</div>
              <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          Protocolo: <a href="https://marlowe.iohk.io" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-2)] hover:underline">Marlowe</a>
          {' '}— contratos financieros verificables en Cardano.
          El contrato es auditabl on-chain en cualquier momento desde{' '}
          <a href="https://preprod.marlowescan.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-2)] hover:underline">Marlowe Scan</a>.
        </p>
      </div>

      {/* Runtime config */}
      <div className="rounded-2xl border border-[var(--border)] bg-black/10 p-5 space-y-3">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Marlowe Runtime URL
        </div>
        <p className="text-xs text-[var(--muted)]">
          El endpoint de Marlowe Runtime que procesa los contratos. Por defecto apunta a preprod (red de pruebas).
          Para mainnet: <code className="font-mono text-[var(--accent-2)]">https://mainnet.marlowe-runtime.iog.io</code>.
          También podés usar tu propio Runtime vía{' '}
          <a href="https://demeter.run" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-2)] hover:underline">demeter.run</a>.
        </p>
        <input
          value={runtimeUrl}
          onChange={e => saveRuntime(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

    </div>
  );
}
