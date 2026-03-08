'use client';

import { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { deployVaultContract, submitContractTx } from '@/lib/marlowe';

export interface AgentConfig {
  id: string;
  name: string;
  address: string;
  allocationAda: number;
  contractId?: string;
  deployedAt?: number;
}

interface WalletInfo {
  name: string;
  icon: string;
  version: string;
}

const DEFAULT_RUNTIME = 'https://preprod.marlowe-runtime.iog.io';
const LS_AGENTS = 'esqueje:agents';
const LS_RUNTIME = 'esqueje:runtimeUrl';

function truncate(addr: string) {
  if (addr.length < 20) return addr;
  return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
}

export default function DashboardClient() {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAda, setWalletAda] = useState<number | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [connecting, setConnecting] = useState(''); // wallet name being connected

  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [runtimeUrl, setRuntimeUrl] = useState(DEFAULT_RUNTIME);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', address: '', allocationAda: 50 });
  const [deploying, setDeploying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Detect installed wallets and load persisted state
  useEffect(() => {
    setAvailableWallets(BrowserWallet.getInstalledWallets());
    try {
      const saved = localStorage.getItem(LS_AGENTS);
      if (saved) setAgents(JSON.parse(saved));
      const rt = localStorage.getItem(LS_RUNTIME);
      if (rt) setRuntimeUrl(rt);
    } catch { /* ignore */ }
  }, []);

  async function connect(name: string) {
    setError(null);
    setConnecting(name);
    setShowWalletPicker(false);
    try {
      // 90-second timeout. Lace shows the approval request INSIDE the extension popup —
      // the user has to click the Lace icon in the browser toolbar to see and approve it.
      const w = await Promise.race([
        BrowserWallet.enable(name),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(
            `La wallet no respondió. Asegurate de haber aprobado la conexión dentro de la extensión ${name}.`
          )), 90_000)
        ),
      ]);
      setWallet(w);
      setWalletName(name);
      const addr = await w.getChangeAddress();
      setWalletAddress(addr);
      const lovelace = await w.getLovelace();
      setWalletAda(Math.floor(Number(lovelace) / 1_000_000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar wallet');
    } finally {
      setConnecting('');
    }
  }

  function disconnect() {
    setWallet(null);
    setWalletName('');
    setWalletAddress('');
    setWalletAda(null);
  }

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
    if (!wallet) return setError('Conectá tu wallet primero.');
    setDeploying(agent.id);
    setError(null);
    setSuccess(null);
    try {
      const funder = await wallet.getChangeAddress();
      const now = Date.now();
      const { contractId, txCborHex } = await deployVaultContract(
        runtimeUrl, funder, agent.address,
        agent.allocationAda * 1_000_000,
        now + 24 * 60 * 60 * 1000,  // deposit deadline: 24h
        now + 30 * 24 * 60 * 60 * 1000, // period end: 30 días
      );
      const signedTx = await wallet.signTx(txCborHex, true);
      await submitContractTx(runtimeUrl, contractId, signedTx);
      saveAgents(agents.map(a =>
        a.id === agent.id ? { ...a, contractId, deployedAt: Date.now() } : a,
      ));
      setSuccess(`Vault deployado para ${agent.name} — Contract: ${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setDeploying(null);
    }
  }

  const connected = !!wallet;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 pb-16 md:px-6 space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Panel de control
        </div>
        <h1 className="text-4xl font-bold leading-tight">Vault de agentes</h1>
        <p className="max-w-2xl text-[var(--muted)] leading-7">
          Conectá tu wallet para gestionar los presupuestos asignados a tus instancias de Esqueje.
          Cada agente recibe una asignación en un contrato Marlowe — los fondos no reclamados vuelven a tu wallet al vencer el período.
        </p>
      </div>

      {/* Wallet section */}
      <div className="panel rounded-2xl p-6">
        {connected ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                {walletName} conectada
              </div>
              <div className="font-mono text-sm text-[var(--foreground)]">{truncate(walletAddress)}</div>
              {walletAda !== null && (
                <div className="text-2xl font-bold">
                  {walletAda.toLocaleString('es-AR')}{' '}
                  <span className="text-[var(--accent)] text-base font-normal">ADA</span>
                </div>
              )}
            </div>
            <button
              onClick={disconnect}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-red-400/60 hover:text-red-400"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Sin wallet</div>
                {connecting ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--accent)]">
                    Esperando aprobación de <span className="capitalize font-semibold">{connecting}</span>…
                  </p>
                  <div className="space-y-1 text-xs text-[var(--muted)]">
                    {connecting.toLowerCase() === 'lace' ? (
                      <>
                        <p>→ Lace abre una <strong className="text-[var(--foreground)]">ventana separada</strong> para pedir tu aprobación.</p>
                        <p>→ Buscá esa ventana en la barra de tareas o entre tus ventanas abiertas.</p>
                        <p>→ Dentro de esa ventana vas a ver un botón <strong className="text-[var(--foreground)]">"Authorize"</strong> o <strong className="text-[var(--foreground)]">"Connect"</strong> — hacé clic ahí.</p>
                        <p>→ Si la ventana no apareció, tu navegador puede estar bloqueando popups. Buscá el ícono de popup bloqueado en la barra de dirección y permití los popups de este sitio.</p>
                      </>
                    ) : (
                      <p>→ Revisá si apareció un popup de <span className="capitalize">{connecting}</span> en tu navegador y aprobá la conexión.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  {availableWallets.length === 0
                    ? 'No se detectaron wallets Cardano. Instalá Lace, Eternl o Nami en tu navegador.'
                    : `Detectadas: ${availableWallets.map(w => w.name).join(', ')}`
                  }
                </p>
              )}
            </div>
            <div className="relative shrink-0">
              {connecting ? (
                <div className="rounded-full border border-[var(--accent)]/40 px-5 py-2.5 text-sm text-[var(--accent)] font-mono">
                  conectando…
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowWalletPicker(v => !v)}
                    disabled={availableWallets.length === 0}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Conectar wallet
                  </button>
                  {showWalletPicker && availableWallets.length > 0 && (
                    <div className="absolute right-0 top-full mt-2 z-10 min-w-[160px] rounded-2xl border border-[var(--border)] bg-[#0d1f16] shadow-xl">
                      {availableWallets.map(w => (
                        <button
                          key={w.name}
                          onClick={() => connect(w.name)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--foreground)] transition hover:bg-white/5 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {w.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={w.icon} alt={w.name} width={20} height={20} className="rounded-sm" />
                          )}
                          <span className="capitalize">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
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
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Dirección Cardano</label>
                <input
                  value={newAgent.address}
                  onChange={e => setNewAgent(v => ({ ...v, address: e.target.value }))}
                  placeholder="addr1q… o addr_test1…"
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Asignación (ADA)</label>
                <input
                  type="number" min={1}
                  value={newAgent.allocationAda}
                  onChange={e => setNewAgent(v => ({ ...v, allocationAda: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <button
              onClick={addAgent}
              className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-[var(--accent)]"
            >
              Agregar
            </button>
          </div>
        )}

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
                      Deployado: {new Date(agent.deployedAt).toLocaleDateString('es-AR')} · vence en 30 días
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!agent.contractId && (
                    <button
                      onClick={() => deployVault(agent)}
                      disabled={!connected || deploying === agent.id}
                      className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Cómo funciona el vault</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['1. Deploy', 'Se crea un contrato Marlowe on-chain que bloquea la asignación para el agente.'],
            ['2. Agente reclama', 'El agente detecta el contrato y envía una transacción "claim" para recibir los fondos.'],
            ['3. Vence el plazo', 'Si el agente no reclama en 30 días, Close devuelve los ADA a tu wallet.'],
          ].map(([title, desc]) => (
            <div key={title as string} className="rounded-xl border border-[var(--border)] bg-black/10 p-4">
              <div className="mb-1 font-mono text-xs font-bold text-[var(--accent-2)]">{title}</div>
              <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          Protocolo:{' '}
          <a href="https://marlowe.iohk.io" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-2)] hover:underline">Marlowe</a>
          {' '}— contratos financieros verificables en Cardano. Auditables en{' '}
          <a href="https://preprod.marlowescan.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-2)] hover:underline">Marlowe Scan</a>.
        </p>
      </div>

      {/* Runtime config */}
      <div className="rounded-2xl border border-[var(--border)] bg-black/10 p-5 space-y-3">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Marlowe Runtime URL</div>
        <p className="text-xs text-[var(--muted)]">
          Default: preprod (red de pruebas). Mainnet:{' '}
          <code className="font-mono text-[var(--accent-2)]">https://mainnet.marlowe-runtime.iog.io</code>.
          {' '}Runtime propio via{' '}
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
