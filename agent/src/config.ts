// Gestor de configuración

import dotenv from 'dotenv';

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
}
