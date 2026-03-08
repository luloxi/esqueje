// Motor de trading

export interface TradeSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
}

export interface TradeResult {
  success: boolean;
  profit: number;
  txHash?: string;
}

export class TradingEngine {
  private priceHistory: number[] = [];
  private maxHistory = 20;
  
  async evaluateSignal(currentPrice: number): Promise<TradeSignal> {
    // Guardar historial
    this.priceHistory.push(currentPrice);
    if (this.priceHistory.length > this.maxHistory) {
      this.priceHistory.shift();
    }
    
    // Estrategia simple: momentum
    if (this.priceHistory.length < 5) {
      return { action: 'hold', confidence: 0, reason: 'Insuficiente historial' };
    }
    
    const shortMA = this.calculateMA(5);
    const longMA = this.calculateMA(10);
    
    if (shortMA > longMA * 1.001) {
      return { 
        action: 'buy', 
        confidence: 0.7, 
        reason: 'Momentum alcista (MA5 > MA10)' 
      };
    } else if (shortMA < longMA * 0.999) {
      return { 
        action: 'sell', 
        confidence: 0.7, 
        reason: 'Momentum bajista (MA5 < MA10)' 
      };
    }
    
    return { action: 'hold', confidence: 0.5, reason: 'Sin señal clara' };
  }
  
  async executeTrade(signal: TradeSignal): Promise<TradeResult> {
    // En producción, ejecutar en Minswap
    // Por ahora, simulamos
    
    if (signal.action === 'hold') {
      return { success: false, profit: 0 };
    }
    
    // Simular resultado de trade
    const profit = (Math.random() - 0.45) * 2; // Ligeramente favorable
    
    return {
      success: true,
      profit: profit,
      txHash: `tx_${Math.random().toString(36).substring(2, 10)}`,
    };
  }
  
  private calculateMA(periods: number): number {
    const relevant = this.priceHistory.slice(-periods);
    return relevant.reduce((a, b) => a + b, 0) / relevant.length;
  }
}
