// Trading engine for Esqueje Agent
// Implements MA momentum strategy; executes on Minswap (simulated in dev)

import type { TradeSignal, TradeResult } from './types.js';

// Re-export for any code that imports directly from this module
export type { TradeSignal, TradeResult };

export class TradingEngine {
  private priceHistory: number[] = [];
  private maxHistory = 20;

  async evaluateSignal(currentPrice: number): Promise<TradeSignal> {
    this.priceHistory.push(currentPrice);
    if (this.priceHistory.length > this.maxHistory) {
      this.priceHistory.shift();
    }

    // Need at least 5 data points
    if (this.priceHistory.length < 5) {
      return {
        action: 'hold',
        confidence: 0,
        reason: 'Insufficient price history',
        expectedEdgePct: 0,
        suggestedCapitalAda: 0,
      };
    }

    const shortMA = this.calculateMA(5);
    const longMA = this.calculateMA(Math.min(10, this.priceHistory.length));

    const momentumGap = shortMA / longMA - 1;
    const confidence = Math.min(0.92, Math.abs(momentumGap) * 140 + 0.55);

    if (shortMA > longMA * 1.001) {
      return {
        action: 'buy',
        confidence,
        reason: `Bullish momentum (MA5 > MA10, gap=${(momentumGap * 100).toFixed(3)}%)`,
        expectedEdgePct: Math.abs(momentumGap) * 100,
        suggestedCapitalAda: 8 + confidence * 20,
      };
    } else if (shortMA < longMA * 0.999) {
      return {
        action: 'sell',
        confidence,
        reason: `Bearish momentum (MA5 < MA10, gap=${(momentumGap * 100).toFixed(3)}%)`,
        expectedEdgePct: Math.abs(momentumGap) * 100,
        suggestedCapitalAda: 8 + confidence * 20,
      };
    }

    return {
      action: 'hold',
      confidence: 0.5,
      reason: 'No clear signal',
      expectedEdgePct: 0,
      suggestedCapitalAda: 0,
    };
  }

  /**
   * Execute a trade on Minswap (simulated in dev mode).
   * @param signal   Trade signal from evaluateSignal
   * @param budgetAda Optional ADA budget; defaults to 10 ADA if not provided
   */
  async executeTrade(
    signal: TradeSignal,
    budgetAda = signal.suggestedCapitalAda ?? 10,
  ): Promise<TradeResult> {
    if (signal.action === 'hold' || budgetAda <= 0) {
      return { success: false, profit: 0 };
    }

    // Simulate trade outcome
    // Slight positive edge + random noise - simulated 0.3% fee
    const edgePct = (signal.expectedEdgePct ?? signal.confidence) * 0.01;
    const volatility = (Math.random() - 0.5) * 0.025;
    const realizedReturn = edgePct + volatility - 0.003;
    const profit = budgetAda * realizedReturn;

    return {
      success: true,
      profit,
      txHash: `tx_${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  private calculateMA(periods: number): number {
    const relevant = this.priceHistory.slice(-periods);
    return relevant.reduce((a, b) => a + b, 0) / relevant.length;
  }
}
