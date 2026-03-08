// Monitor de supervivencia

export class SurvivalMonitor {
  private readonly HEALTHY_THRESHOLD = 50;  // ADA
  private readonly LOW_THRESHOLD = 20;      // ADA
  private readonly CRITICAL_THRESHOLD = 5;  // ADA
  private readonly REPLICATION_THRESHOLD = 200; // ADA
  private readonly MIN_TRADES_FOR_REPLICATION = 10;
  private readonly MIN_PROFIT_FOR_REPLICATION = 20; // ADA
  
  evaluateStatus(balance: number): 'healthy' | 'low' | 'critical' | 'dead' {
    if (balance <= 0) return 'dead';
    if (balance < this.CRITICAL_THRESHOLD) return 'critical';
    if (balance < this.LOW_THRESHOLD) return 'low';
    return 'healthy';
  }
  
  async shouldReplicate(
    balance: number,
    totalProfit: number,
    tradesCount: number
  ): Promise<boolean> {
    return (
      balance >= this.REPLICATION_THRESHOLD &&
      tradesCount >= this.MIN_TRADES_FOR_REPLICATION &&
      totalProfit >= this.MIN_PROFIT_FOR_REPLICATION
    );
  }
  
  getThresholds() {
    return {
      healthy: this.HEALTHY_THRESHOLD,
      low: this.LOW_THRESHOLD,
      critical: this.CRITICAL_THRESHOLD,
      replication: this.REPLICATION_THRESHOLD,
    };
  }
}
