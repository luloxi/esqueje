'use client';

import { useEffect, useState } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import { deployVaultContract, submitContractTx } from '@/lib/marlowe';
import { getCapitalPlan } from '@/lib/runtimeEconomics';

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

const capitalPlan = getCapitalPlan();
const DEFAULT_RUNTIME = 'https://preprod.marlowe-runtime.iog.io';
const LS_AGENTS = 'esqueje:agents';
const LS_RUNTIME = 'esqueje:runtimeUrl';

function truncate(value: string) {
  if (value.length < 20) return value;
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

function isCardanoAddress(value: string) {
  return value.startsWith('addr1') || value.startsWith('addr_test1');
}

export default function DashboardClient() {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAda, setWalletAda] = useState<number | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [connecting, setConnecting] = useState('');

  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [runtimeUrl, setRuntimeUrl] = useState(DEFAULT_RUNTIME);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    address: '',
    allocationAda: capitalPlan.minimumOperationalBalanceAda,
  });
  const [deploying, setDeploying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setAvailableWallets(BrowserWallet.getInstalledWallets());
    try {
      const savedAgents = localStorage.getItem(LS_AGENTS);
      const savedRuntime = localStorage.getItem(LS_RUNTIME);
      if (savedAgents) setAgents(JSON.parse(savedAgents));
      if (savedRuntime) setRuntimeUrl(savedRuntime);
    } catch {
      // ignore local storage parsing failures
    }
  }, []);

  async function connect(name: string) {
    setError(null);
    setSuccess(null);
    setConnecting(name);
    setShowWalletPicker(false);

    try {
      const enabledWallet = await Promise.race([
        BrowserWallet.enable(name),
        new Promise<never>((_, reject) =>
          setTimeout(() => {
            reject(
              new Error(
                `La wallet ${name} no respondió. Revisá la extensión y aprobá la conexión.`
              )
            );
          }, 90_000)
        ),
      ]);

      setWallet(enabledWallet);
      setWalletName(name);
      const addr = await enabledWallet.getChangeAddress();
      setWalletAddress(addr);
      const lovelace = await enabledWallet.getLovelace();
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
    setError(null);
    setSuccess(null);

    if (!newAgent.name.trim()) {
      setError('Poné un nombre para identificar el agente.');
      return;
    }

    if (!isCardanoAddress(newAgent.address.trim())) {
      setError('La dirección del agente debe empezar con addr1 o addr_test1.');
      return;
    }

    if (newAgent.allocationAda < capitalPlan.minimumOperationalBalanceAda) {
      setError(
        `La asignación mínima recomendada es ${capitalPlan.minimumOperationalBalanceAda} ADA por agente.`
      );
      return;
    }

    saveAgents([
      ...agents,
      {
        id: Date.now().toString(),
        name: newAgent.name.trim(),
        address: newAgent.address.trim(),
        allocationAda: newAgent.allocationAda,
      },
    ]);
    setNewAgent({
      name: '',
      address: '',
      allocationAda: capitalPlan.minimumOperationalBalanceAda,
    });
    setShowAddAgent(false);
    setSuccess('Agente registrado en el dashboard local.');
  }

  async function deployVault(agent: AgentConfig) {
    if (!wallet) {
      setError('Conectá la wallet del operador antes de desplegar un vault.');
      return;
    }

    setDeploying(agent.id);
    setError(null);
    setSuccess(null);

    try {
      const funder = await wallet.getChangeAddress();
      const now = Date.now();
      const { contractId, txCborHex } = await deployVaultContract(
        runtimeUrl,
        funder,
        agent.address,
        agent.allocationAda * 1_000_000,
        now + 24 * 60 * 60 * 1000,
        now + 30 * 24 * 60 * 60 * 1000,
      );

      const signedTx = await wallet.signTx(txCborHex, true);
      await submitContractTx(runtimeUrl, contractId, signedTx);

      saveAgents(
        agents.map((current) =>
          current.id === agent.id
            ? { ...current, contractId, deployedAt: Date.now() }
            : current
        )
      );
      setSuccess(`Vault desplegado para ${agent.name}. Contract ID: ${contractId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al desplegar el vault');
    } finally {
      setDeploying(null);
    }
  }

  const connected = !!wallet;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pt-4 pb-16 md:px-6">
      <div className="space-y-3">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Control y monitoreo
        </div>
        <h1 className="text-4xl font-bold leading-tight">Dashboard de agentes</h1>
        <p className="max-w-3xl text-[var(--muted)] leading-7">
          Acá conectás la <strong className="text-[var(--foreground)]">wallet del humano operador</strong>,
          no la wallet interna del agente. La usás para fondear, crear vaults y llevar un inventario local
          de direcciones de agentes que después seguís con logs, Blockfrost y contratos on-chain.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            '1. Conectar wallet',
            'Es la wallet del humano que firma el vault y controla presupuesto. Debe tener ADA para fondear.',
          ],
          [
            '2. Registrar agente',
            'Pegá la dirección `addr1...` o `addr_test1...` que el agente imprimió en logs después del primer boot.',
          ],
          [
            '3. Monitorear',
            'El dashboard guarda contrato, presupuesto y dirección. El estado operativo real hoy se sigue por logs y Blockfrost.',
          ],
        ].map(([title, body]) => (
          <div key={title as string} className="panel rounded-2xl p-5">
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--accent-2)]">
              {title}
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">{body}</p>
          </div>
        ))}
      </div>

      <div className="panel-strong rounded-[1.75rem] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Presupuesto recomendado
            </div>
            <h2 className="mt-1 text-2xl font-bold">{capitalPlan.minimumOperationalBalanceAda} ADA por agente</h2>
          </div>
          <div className="rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs text-[var(--muted)]">
            Padre para replicar: {capitalPlan.recommendedParentBalanceAda} ADA
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['burn mensual', `${capitalPlan.monthlyBurnAda} ADA`],
            ['reserva 90 días', `${capitalPlan.targetReserveAda} ADA`],
            ['capital de trading', `${capitalPlan.requiredTradingCapitalAda} ADA`],
            ['seed por hijo', `${capitalPlan.replicationSeedAda} ADA`],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border border-[var(--border)] bg-black/10 px-4 py-4">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">{label}</div>
              <div className="text-lg font-bold text-[var(--foreground)]">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Datos ilustrativos. Si registrás un agente por debajo de ese mínimo, el dashboard lo toma como subcapitalizado.
        </p>
      </div>

      <div className="panel rounded-2xl p-6">
        {connected ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                {walletName} conectada
              </div>
              <div className="font-mono text-sm text-[var(--foreground)]">{truncate(walletAddress)}</div>
              {walletAda !== null && (
                <div className="text-2xl font-bold">
                  {walletAda.toLocaleString('es-AR')}{' '}
                  <span className="text-base font-normal text-[var(--accent)]">ADA</span>
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
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                Wallet del operador
              </div>
              {connecting ? (
                <div className="space-y-1 text-sm text-[var(--muted)]">
                  <p className="text-[var(--accent)]">
                    Esperando aprobación de <span className="font-semibold capitalize">{connecting}</span>.
                  </p>
                  <p>Revisá la extensión o el popup de tu navegador y autorizá la conexión.</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  {availableWallets.length === 0
                    ? 'No se detectaron wallets Cardano. Instalá Lace, Eternl o Nami.'
                    : `Detectadas: ${availableWallets.map((current) => current.name).join(', ')}`}
                </p>
              )}
            </div>

            <div className="relative shrink-0">
              {connecting ? (
                <div className="rounded-full border border-[var(--accent)]/40 px-5 py-2.5 text-sm font-mono text-[var(--accent)]">
                  conectando...
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowWalletPicker((value) => !value)}
                    disabled={availableWallets.length === 0}
                    className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-bold text-[var(--background)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Conectar wallet
                  </button>
                  {showWalletPicker && availableWallets.length > 0 && (
                    <div className="absolute right-0 top-full z-10 mt-2 min-w-[180px] rounded-2xl border border-[var(--border)] bg-[#0d1f16] shadow-xl">
                      {availableWallets.map((available) => (
                        <button
                          key={available.name}
                          onClick={() => connect(available.name)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--foreground)] transition hover:bg-[var(--panel)] first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {available.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={available.icon} alt={available.name} width={20} height={20} className="rounded-sm" />
                          )}
                          <span className="capitalize">{available.name}</span>
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

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          <span className="mb-1 block font-mono text-xs uppercase tracking-widest text-red-400">Error</span>
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-5 py-4 text-sm text-[var(--accent)]">
          <span className="mb-1 block font-mono text-xs uppercase tracking-widest">OK</span>
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Tus agentes</h2>
          <button
            onClick={() => setShowAddAgent((value) => !value)}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-white"
          >
            {showAddAgent ? 'Cancelar' : '+ Registrar agente'}
          </button>
        </div>

        {showAddAgent && (
          <div className="panel-strong rounded-2xl p-5 space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Nuevo agente
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Nombre</label>
                <input
                  value={newAgent.name}
                  onChange={(event) =>
                    setNewAgent((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Esqueje hijo 01"
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Dirección Cardano</label>
                <input
                  value={newAgent.address}
                  onChange={(event) =>
                    setNewAgent((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="addr1... o addr_test1..."
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Asignación ADA</label>
                <input
                  type="number"
                  min={capitalPlan.minimumOperationalBalanceAda}
                  value={newAgent.allocationAda}
                  onChange={(event) =>
                    setNewAgent((current) => ({
                      ...current,
                      allocationAda: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Usá la dirección que el agente ya imprimió en logs. El dashboard no genera esa wallet.
            </p>
            <button
              onClick={addAgent}
              className="rounded-full bg-[var(--foreground)] px-6 py-2 text-sm font-bold text-[var(--background)] transition hover:bg-[var(--accent)]"
            >
              Guardar agente
            </button>
          </div>
        )}

        {agents.length === 0 && !showAddAgent && (
          <div className="rounded-2xl border border-[var(--border)] bg-black/10 px-5 py-8 text-center text-sm text-[var(--muted)]">
            No hay agentes registrados. Arrancá una instancia, copiá su dirección desde los logs y cargala acá.
          </div>
        )}

        <div className="space-y-3">
          {agents.map((agent) => {
            const underfunded = agent.allocationAda < capitalPlan.minimumOperationalBalanceAda;

            return (
              <div key={agent.id} className="panel rounded-2xl p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold">{agent.name}</span>
                      {agent.contractId && (
                        <span className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                          vault activo
                        </span>
                      )}
                      {underfunded && (
                        <span className="rounded-full border border-orange-400/30 px-2 py-0.5 font-mono text-[10px] text-orange-300">
                          subcapitalizado
                        </span>
                      )}
                    </div>
                    <div className="truncate font-mono text-xs text-[var(--muted)]">{agent.address}</div>
                    <div className="text-sm text-[var(--foreground)]">
                      Asignación:{' '}
                      <span className="font-bold text-[var(--accent-2)]">{agent.allocationAda} ADA</span>
                      {agent.contractId && (
                        <span className="ml-3 font-mono text-[10px] text-[var(--muted)]">
                          {truncate(agent.contractId)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {underfunded
                        ? `Debajo del mínimo recomendado de ${capitalPlan.minimumOperationalBalanceAda} ADA.`
                        : `Dentro del rango sano definido por el runtime (${capitalPlan.minimumOperationalBalanceAda}+ ADA).`}
                    </div>
                    {agent.deployedAt && (
                      <div className="text-xs text-[var(--muted)]">
                        Vault desplegado: {new Date(agent.deployedAt).toLocaleDateString('es-AR')} · vence en 30 días
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {!agent.contractId && (
                      <button
                        onClick={() => deployVault(agent)}
                        disabled={!connected || deploying === agent.id}
                        className="rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-bold text-[var(--background)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deploying === agent.id ? 'Deployando...' : 'Deploy vault'}
                      </button>
                    )}
                    <button
                      onClick={() => saveAgents(agents.filter((current) => current.id !== agent.id))}
                      className="rounded-full border border-red-400/30 px-3 py-2 text-xs text-red-400 transition hover:border-red-400/60"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel-strong rounded-2xl p-6 space-y-4">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          Qué monitoreás realmente hoy
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Vault', 'Contract ID, fecha de despliegue y vencimiento del presupuesto.'],
            ['Dirección', 'La wallet on-chain del agente, necesaria para fondeo y trazabilidad.'],
            ['Estado operativo', 'Todavía se sigue afuera del dashboard: `pm2 logs`, Blockfrost y el host donde corre el runtime.'],
          ].map(([title, desc]) => (
            <div key={title as string} className="rounded-xl border border-[var(--border)] bg-black/10 p-4">
              <div className="mb-1 font-mono text-xs font-bold text-[var(--accent-2)]">{title}</div>
              <p className="text-xs leading-5 text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          Protocolo:{' '}
          <a
            href="https://marlowe.iohk.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-2)] hover:underline"
          >
            Marlowe
          </a>
          {' '}para vaults on-chain. El contrato es auditable en{' '}
          <a
            href="https://preprod.marlowescan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-2)] hover:underline"
          >
            Marlowe Scan
          </a>
          .
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-black/10 p-5 space-y-3">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Runtime Marlowe
        </div>
        <p className="text-xs text-[var(--muted)]">
          Default: preprod. Si querés mainnet, cambiá el endpoint. Este valor sólo afecta el vault del dashboard.
        </p>
        <input
          value={runtimeUrl}
          onChange={(event) => saveRuntime(event.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}
