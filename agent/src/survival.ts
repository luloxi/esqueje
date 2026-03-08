import type { TreasurySnapshot } from './economics.js';

// Monitor de supervivencia

export class SurvivalMonitor {
  private readonly HEALTHY_RUNWAY_DAYS = 90;
  private readonly LOW_RUNWAY_DAYS = 30;
  private readonly CRITICAL_RUNWAY_DAYS = 10;
  private readonly MIN_PROFIT_FOR_REPLICATION = 90;
  
  evaluateStatus(snapshot: TreasurySnapshot): 'healthy' | 'low' | 'critical' | 'dead' {
    if (snapshot.balanceAda <= 0) return 'dead';
    if (snapshot.runwayDays < this.CRITICAL_RUNWAY_DAYS) return 'critical';
    if (snapshot.runwayDays < this.LOW_RUNWAY_DAYS) return 'low';
    if (snapshot.runwayDays < this.HEALTHY_RUNWAY_DAYS) return 'low';
    return 'healthy';
  }
  
  async shouldReplicate(
    snapshot: TreasurySnapshot,
    totalProfit: number,
    _tradesCount: number
  ): Promise<boolean> {
    return (
      snapshot.runwayDays >= this.HEALTHY_RUNWAY_DAYS &&
      snapshot.balanceAda >= snapshot.recommendedParentBalanceAda &&
      totalProfit >= this.MIN_PROFIT_FOR_REPLICATION
    );
  }
  
  getThresholds() {
    return {
      healthyRunwayDays: this.HEALTHY_RUNWAY_DAYS,
      lowRunwayDays: this.LOW_RUNWAY_DAYS,
      criticalRunwayDays: this.CRITICAL_RUNWAY_DAYS,
    };
  }
}
