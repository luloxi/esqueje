'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AgentStats {
  balance: number;
  state: string;
  runwayDays: number;
  totalTrades: number;
  totalProfit: number;
  winRate: number;
  lastTrade: {
    action: string;
    profit: number;
    timestamp: string;
  } | null;
}

interface Trade {
  id: number;
  action: string;
  profit: number;
  timestamp: string;
}

interface BalancePoint {
  date: string;
  value: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/agent');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        setStats(data.stats);
        setTrades(data.trades);
        setBalanceHistory(data.balanceHistory);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to connect to agent');
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      healthy: 'text-green-400',
      running: 'text-blue-400',
      low: 'text-yellow-400',
      critical: 'text-red-400',
      dead: 'text-gray-400',
      sleeping: 'text-purple-400',
    };
    return colors[state] || 'text-gray-400';
  };

  const getStateEmoji = (state: string) => {
    const emojis: Record<string, string> = {
      healthy: '✅',
      running: '▶️',
      low: '⚠️',
      critical: '🚨',
      dead: '💀',
      sleeping: '💤',
    };
    return emojis[state] || '❓';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <div className="text-gray-400">Connecting to agent...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-red-400 mb-4">{error || 'Agent not found'}</div>
          <Link href="/" className="text-blue-400 hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold">Esqueje Dashboard</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Balance"
              value={`${stats.balance.toFixed(2)} ADA`}
              subtext={`+${stats.totalProfit.toFixed(2)} total`}
              subtextColor="text-green-400"
            />

            <StatCard
              label="State"
              value={`${getStateEmoji(stats.state)} ${stats.state.toUpperCase()}`}
              valueColor={getStateColor(stats.state)}
              subtext={`${stats.runwayDays} days runway`}
            />

            <StatCard
              label="Total Trades"
              value={stats.totalTrades.toString()}
              subtext={`${stats.winRate}% win rate`}
              subtextColor="text-blue-400"
            />

            <StatCard
              label="Last Trade"
              value={stats.lastTrade?.action.toUpperCase() || 'N/A'}
              subtext={stats.lastTrade ? `${stats.lastTrade.profit >= 0 ? '+' : ''}${stats.lastTrade.profit.toFixed(4)} ADA` : 'No trades'}
              subtextColor={stats.lastTrade && stats.lastTrade.profit >= 0 ? 'text-green-400' : 'text-red-400'}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BalanceChart data={balanceHistory} />
            <WinRateChart winRate={stats.winRate} />
          </div>

          {/* Trades Table */}
          <TradesTable trades={trades} />
        </div>
      </main>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, subtext, valueColor = '', subtextColor = 'text-gray-400' }: {
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
  subtextColor?: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
      <div className={`text-sm mt-1 ${subtextColor}`}>{subtext}</div>
    </div>
  );
}

function BalanceChart({ data }: { data: BalancePoint[] }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold mb-4">Balance History (7 days)</h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full">
              <div
                className="w-full bg-gradient-to-t from-green-500/50 to-green-400 rounded-t transition-all duration-500"
                style={{ height: `${((point.value - min) / (max - min || 1)) * 200}px` }}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 hover:opacity-100 transition">
                {point.value}
              </div>
            </div>
            <span className="text-xs text-gray-500">{point.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WinRateChart({ winRate }: { winRate: number }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = `${(winRate / 100) * circumference} ${circumference}`;
  
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold mb-4">Win Rate</h3>
      <div className="h-64 flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold">{winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-400">Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-700 rounded-full" />
          <span className="text-sm text-gray-400">Losses</span>
        </div>
      </div>
    </div>
  );
}

function TradesTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-white/10">
              <th className="pb-3">ID</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Profit</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 font-mono">#{trade.id}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trade.action === 'buy' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.action.toUpperCase()}
                  </span>
                </td>
                <td className={`py-3 font-mono ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(4)} ADA
                </td>
                <td className="py-3 text-gray-400">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
