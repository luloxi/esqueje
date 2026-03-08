// Gestor de configuración

import dotenv from 'dotenv';
import type { TreasuryPolicy } from './economics.js';

dotenv.config();

export class ConfigManager {
  private readNumber(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;

    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private readPct(name: string, fallback: number): number {
    const parsed = this.readNumber(name, fallback);
    return parsed > 1 ? parsed / 100 : parsed;
  }

  getPythHermesUrl(): string {
    return process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network';
  }
  
  getTradingInterval(): number {
    return parseInt(process.env.TRADING_INTERVAL || '300'); // 5 minutos
  }
  
  getNetwork(): 'mainnet' | 'preprod' | 'preview' {
    return (process.env.CARDANO_NETWORK as 'mainnet' | 'preprod' | 'preview') || 'preprod';
  }
  
  getBlockfrostKey(): string {
    return process.env.BLOCKFROST_KEY || process.env.BLOCKFROST_API_KEY || '';
  }

  getTreasuryPolicy(): TreasuryPolicy {
    return {
      monthlyHostingAda: this.readNumber('MONTHLY_HOSTING_ADA', 25),
      monthlyOperationsAda: this.readNumber('MONTHLY_OPERATIONS_ADA', 5),
      targetMonthlyProfitAda: this.readNumber('TARGET_MONTHLY_PROFIT_ADA', 15),
      emergencyRunwayDays: parseInt(process.env.EMERGENCY_RUNWAY_DAYS || '30', 10),
      targetRunwayDays: parseInt(process.env.TARGET_RUNWAY_DAYS || '90', 10),
      assumedMonthlyNetReturnPct: this.readPct('ASSUMED_MONTHLY_NET_RETURN_PCT', 0.12),
      minimumAgentBalanceAda: this.readNumber('MIN_AGENT_BALANCE_ADA', 500),
      replicationSeedAda: this.readNumber('REPLICATION_SEED_ADA', 500),
      minimumProfitForReplicationAda: this.readNumber('MIN_PROFIT_FOR_REPLICATION_ADA', 90),
      maxTradeAllocationPct: this.readPct('MAX_TRADE_ALLOCATION_PCT', 0.12),
    };
  }
}
