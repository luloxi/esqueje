// Esqueje Agent - Core
// Agente autónomo que tradea con Pyth en Cardano

import chalk from 'chalk';
import cron from 'node-cron';
import { PythClient } from './pyth.js';
import { WalletManager } from './wallet.js';
import { TradingEngine } from './trading.js';
import { SurvivalMonitor } from './survival.js';
import { ConfigManager } from './config.js';

export interface AgentState {
  balance: number;
  status: 'healthy' | 'low' | 'critical' | 'dead';
  tradesCount: number;
  totalProfit: number;
  lastPrice: number | null;
  createdAt: Date;
  generation: number;
}

export class EsquejeAgent {
  private config: ConfigManager;
  private wallet: WalletManager;
  private pyth: PythClient;
  private trading: TradingEngine;
  private survival: SurvivalMonitor;
  private state: AgentState;
  private isRunning: boolean = false;

  constructor() {
    this.config = new ConfigManager();
    this.wallet = new WalletManager();
    this.pyth = new PythClient();
    this.trading = new TradingEngine();
    this.survival = new SurvivalMonitor();
    
    this.state = {
      balance: 0,
      status: 'healthy',
      tradesCount: 0,
      totalProfit: 0,
      lastPrice: null,
      createdAt: new Date(),
      generation: 1,
    };
  }

  async initialize(): Promise<void> {
    console.log(chalk.cyan('🌱 Inicializando Esqueje...'));
    
    // Cargar o crear wallet
    await this.wallet.initialize();
    console.log(chalk.green(`✓ Wallet: ${this.wallet.getAddress()}`));
    
    // Verificar balance inicial
    await this.updateBalance();
    console.log(chalk.green(`✓ Balance: ${this.state.balance} ADA`));
    
    // Inicializar Pyth
    await this.pyth.initialize();
    console.log(chalk.green('✓ Pyth Oracle conectado'));
    
    console.log(chalk.cyan('🌱 Esqueje listo para operar'));
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(chalk.green('▶️ Agente iniciado'));
    
    // Loop principal cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
      await this.runCycle();
    });
    
    // Heartbeat cada minuto
    cron.schedule('* * * * *', async () => {
      await this.heartbeat();
    });
    
    // Primer ciclo inmediato
    await this.runCycle();
  }

  private async runCycle(): Promise<void> {
    console.log(chalk.blue(`\n[${new Date().toISOString()}] Ciclo de trading`));
    
    try {
      // Actualizar estado
      await this.updateBalance();
      await this.checkSurvival();
      
      if (this.state.status === 'dead') {
        console.log(chalk.red('💀 Agente muerto. Deteniendo...'));
        this.stop();
        return;
      }
      
      if (this.state.status === 'critical') {
        console.log(chalk.yellow('⚠️ Modo supervivencia. No tradeando.'));
        return;
      }
      
      // Obtener precio de Pyth
      const price = await this.pyth.getPrice('ADA/USD');
      this.state.lastPrice = price;
      console.log(chalk.gray(`Precio ADA/USD: $${price}`));
      
      // Evaluar oportunidad de trading
      const signal = await this.trading.evaluateSignal(price);
      
      if (signal.action !== 'hold') {
        console.log(chalk.cyan(`🎯 Señal: ${signal.action.toUpperCase()}`));
        
        // Ejecutar trade (simulado por ahora)
        const result = await this.trading.executeTrade(signal);
        
        if (result.success) {
          this.state.tradesCount++;
          this.state.totalProfit += result.profit;
          console.log(chalk.green(`✓ Trade ejecutado. Profit: ${result.profit} ADA`));
        }
      }
      
      // Verificar si debe replicarse
      await this.checkReplication();
      
    } catch (error) {
      console.error(chalk.red('Error en ciclo:'), error);
    }
  }

  private async heartbeat(): Promise<void> {
    console.log(chalk.gray(`💓 Heartbeat - Status: ${this.state.status} - Balance: ${this.state.balance} ADA`));
  }

  private async updateBalance(): Promise<void> {
    this.state.balance = await this.wallet.getBalance();
  }

  private async checkSurvival(): Promise<void> {
    this.state.status = this.survival.evaluateStatus(this.state.balance);
  }

  private async checkReplication(): Promise<void> {
    const shouldReplicate = await this.survival.shouldReplicate(
      this.state.balance,
      this.state.totalProfit,
      this.state.tradesCount
    );
    
    if (shouldReplicate) {
      console.log(chalk.magenta('🌿 Condiciones para replicación cumplidas!'));
      // TODO: Implementar replicación
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log(chalk.yellow('⏹️ Agente detenido'));
  }

  getState(): AgentState {
    return { ...this.state };
  }
}

// Entry point
async function main() {
  const agent = new EsquejeAgent();
  
  try {
    await agent.initialize();
    await agent.start();
  } catch (error) {
    console.error(chalk.red('Error fatal:'), error);
    process.exit(1);
  }
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nRecibido SIGINT. Cerrando...'));
    agent.stop();
    process.exit(0);
  });
}

main();
