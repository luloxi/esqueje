// Gestor de configuración

import dotenv from 'dotenv';
import type { TreasuryPolicy } from './economics.js';

dotenv.config();

export class ConfigManager {
  getPythHermesUrl(): string {
    return process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network';
  }
  
  getTradingInterval(): number {
    return parseInt(process.env.TRADING_INTERVAL || '300'); // 5 minutos
  }
  
  getNetwork(): 'mainnet' | 'testnet' {
    return (process.env.CARDANO_NETWORK as 'mainnet' | 'testnet') || 'testnet';
  }
  
  getBlockfrostKey(): string {
    return process.env.BLOCKFROST_API_KEY || '';
  }

  getTreasuryPolicy(): TreasuryPolicy {
    return {
      monthlyHostingAda: parseFloat(process.env.MONTHLY_HOSTING_ADA || '15'),
      emergencyRunwayDays: parseInt(process.env.EMERGENCY_RUNWAY_DAYS || '30'),
      targetRunwayDays: parseInt(process.env.TARGET_RUNWAY_DAYS || '90'),
      maxTradeAllocationPct: parseFloat(process.env.MAX_TRADE_ALLOCATION_PCT || '0.18'),
      maxReplicationAllocationPct: parseFloat(process.env.MAX_REPLICATION_ALLOCATION_PCT || '0.3'),
    };
  }
}
