import type { TelegramInterface } from '../telegram/interface.js';
import type { EsquejeDatabase } from '../state/database.js';
import type { EconomicsEngine } from '../economics.js';
import type { TradeResult } from '../types.js';

export interface AlertConfig {
  minProfitThresholdAda: number;      // Alert on trades with profit > this
  criticalBalanceThresholdAda: number; // Alert when balance < this
  opportunityMinProfitPct: number;     // Alert on arbitrage opportunities > this
  dailySummaryEnabled: boolean;
}

export class AlertManager {
  private telegram: TelegramInterface;
  private db: EsquejeDatabase;
  private economics: EconomicsEngine;
  private config: AlertConfig;
  private lastAlertTimes: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown between same alert type

  constructor(
    telegram: TelegramInterface,
    db: EsquejeDatabase,
    economics: EconomicsEngine,
    config: AlertConfig
  ) {
    this.telegram = telegram;
    this.db = db;
    this.economics = economics;
    this.config = config;
  }

  private canSendAlert(alertType: string): boolean {
    const now = Date.now();
    const lastTime = this.lastAlertTimes.get(alertType) || 0;
    
    if (now - lastTime < this.COOLDOWN_MS) {
      return false; // Still in cooldown
    }
    
    this.lastAlertTimes.set(alertType, now);
    return true;
  }

  // Alert: Trade executed with significant profit
  async onTradeExecuted(trade: TradeResult, signal: { action: string; confidence: number }): Promise<void> {
    if (!trade.success) return;

    const profitAda = trade.profit;
    
    // Alert on significant profit
    if (profitAda >= this.config.minProfitThresholdAda) {
      await this.telegram.sendAlert(
        `🎉 *Trade Exitoso!*\n\n` +
        `Acción: ${signal.action.toUpperCase()}\n` +
        `Profit: +${profitAda.toFixed(4)} ADA\n` +
        `Confianza: ${(signal.confidence * 100).toFixed(1)}%\n\n` +
        `Tx: \`${trade.txHash || 'pending'}\``
      );
      return;
    }

    // Alert on significant loss
    if (profitAda <= -this.config.minProfitThresholdAda) {
      if (!this.canSendAlert('trade_loss')) return;
      
      await this.telegram.sendAlert(
        `⚠️ *Pérdida en Trade*\n\n` +
        `Acción: ${signal.action.toUpperCase()}\n` +
        `Pérdida: ${profitAda.toFixed(4)} ADA\n` +
        `Confianza: ${(signal.confidence * 100).toFixed(1)}%\n\n` +
        `Revisar estrategia si se repite.`
      );
    }
  }

  // Alert: Balance critical
  async onBalanceCheck(balanceAda: number): Promise<void> {
    const plan = this.economics.describeCapitalPlan();
    const runway = this.economics.calculateRunway(balanceAda);

    // Critical: Below minimum operational
    if (balanceAda < plan.minimumOperationalBalanceAda) {
      if (!this.canSendAlert('balance_critical')) return;

      await this.telegram.sendAlert(
        `🚨 *BALANCE CRÍTICO* 🚨\n\n` +
        `Balance actual: ${balanceAda.toFixed(2)} ADA\n` +
        `Mínimo requerido: ${plan.minimumOperationalBalanceAda} ADA\n` +
        `Runway: ${runway.days.toFixed(0)} días\n\n` +
        `⚠️ El agente está en riesgo de morir.\n` +
        `💡 Considera fondear con más ADA urgentemente.`
      );
      return;
    }

    // Warning: Below healthy threshold
    if (balanceAda < plan.minimumOperationalBalanceAda * 1.5) {
      if (!this.canSendAlert('balance_warning')) return;

      await this.telegram.sendAlert(
        `⚠️ *Balance Bajo*\n\n` +
        `Balance actual: ${balanceAda.toFixed(2)} ADA\n` +
        `Recomendado: ${plan.minimumOperationalBalanceAda * 1.5} ADA\n` +
        `Runway: ${runway.days.toFixed(0)} días\n\n` +
        `💡 Considera fondear para mantener salud económica.`
      );
    }
  }

  // Alert: Ready for replication
  async onReplicationCheck(balanceAda: number): Promise<void> {
    const plan = this.economics.describeCapitalPlan();
    const canReplicate = balanceAda >= plan.minimumOperationalBalanceAda + plan.replicationSeedAda;

    if (canReplicate) {
      if (!this.canSendAlert('replication_ready')) return;

      const childBalance = plan.replicationSeedAda;
      const parentRemaining = balanceAda - childBalance;

      await this.telegram.sendAlert(
        `🌱 *Replicación Posible!*\n\n` +
        `Balance actual: ${balanceAda.toFixed(2)} ADA\n\n` +
        `Si replicás ahora:\n` +
        `• Padre se queda: ${parentRemaining.toFixed(2)} ADA\n` +
        `• Hijo recibe: ${childBalance} ADA\n\n` +
        `Usá /replicate para verificar o esperá a que el agente decida automáticamente.`
      );
    }
  }

  // Alert: Opportunity detected (arbitrage, yield, etc)
  async onOpportunityDetected(opportunity: {
    type: string;
    profitPct: number;
    description: string;
  }): Promise<void> {
    if (opportunity.profitPct < this.config.opportunityMinProfitPct) return;
    if (!this.canSendAlert(`opportunity_${opportunity.type}`)) return;

    await this.telegram.sendAlert(
      `💎 *Oportunidad Detectada*\n\n` +
      `Tipo: ${opportunity.type}\n` +
      `Profit estimado: ${opportunity.profitPct.toFixed(2)}%\n\n` +
      `${opportunity.description}\n\n` +
      `El agente evaluará si ejecutar.`
    );
  }

  // Alert: State change
  async onStateChange(oldState: string, newState: string): Promise<void> {
    const stateEmojis: Record<string, string> = {
      healthy: '✅',
      low: '⚠️',
      critical: '🚨',
      dead: '💀',
      sleeping: '💤',
      running: '▶️',
    };

    await this.telegram.sendAlert(
      `${stateEmojis[newState] || 'ℹ️'} *Cambio de Estado*\n\n` +
      `${oldState} → ${newState}\n\n` +
      `El agente ajustó su comportamiento según su salud económica.`
    );
  }

  // Daily summary
  async sendDailySummary(balanceAda: number): Promise<void> {
    if (!this.config.dailySummaryEnabled) return;

    const today = new Date().toISOString().split('T')[0];
    const trades = this.db.getTradesForDate(today);
    
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const losingTrades = trades.filter(t => t.profit < 0).length;

    const runway = this.economics.calculateRunway(balanceAda);
    const plan = this.economics.describeCapitalPlan();

    await this.telegram.sendAlert(
      `📊 *Resumen Diario - ${today}*\n\n` +
      `💰 Balance: ${balanceAda.toFixed(2)} ADA\n` +
      `📈 Runway: ${runway.days.toFixed(0)} días\n\n` +
      `Trades hoy: ${trades.length}\n` +
      `✅ Ganadores: ${winningTrades}\n` +
      `❌ Perdedores: ${losingTrades}\n` +
      `💵 Profit total: ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(4)} ADA\n\n` +
      `Estado: ${balanceAda >= plan.minimumOperationalBalanceAda ? '✅ Saludable' : '⚠️ Necesita atención'}`
    );
  }

  // Alert: Error/exception
  async onError(error: Error, context?: string): Promise<void> {
    if (!this.canSendAlert('error')) return;

    await this.telegram.sendAlert(
      `❌ *Error en el Agente*\n\n` +
      `${context ? `Contexto: ${context}\n` : ''}` +
      `Error: ${error.message}\n\n` +
      `El agente intentará recuperarse automáticamente. ` +
      `Si persiste, revisá los logs.`
    );
  }
}
