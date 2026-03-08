export interface TreasuryPolicy {
  monthlyHostingAda: number;
  emergencyRunwayDays: number;
  targetRunwayDays: number;
  maxTradeAllocationPct: number;
  maxReplicationAllocationPct: number;
}

export interface TreasurySnapshot {
  balanceAda: number;
  reserveAda: number;
  spendableAda: number;
  runwayDays: number;
  monthlyHostingAda: number;
}

export interface HostingDecision {
  shouldPay: boolean;
  amountAda: number;
  reason: string;
}

const DEFAULT_POLICY: TreasuryPolicy = {
  monthlyHostingAda: 15,
  emergencyRunwayDays: 30,
  targetRunwayDays: 90,
  maxTradeAllocationPct: 0.18,
  maxReplicationAllocationPct: 0.3,
};

export class EconomicsEngine {
  constructor(private readonly policy: TreasuryPolicy = DEFAULT_POLICY) {}

  getPolicy(): TreasuryPolicy {
    return { ...this.policy };
  }

  snapshot(balanceAda: number): TreasurySnapshot {
    const reserveAda = this.calculateReserve(balanceAda);
    const spendableAda = Math.max(0, balanceAda - reserveAda);
    const runwayDays =
      this.policy.monthlyHostingAda <= 0
        ? Number.POSITIVE_INFINITY
        : (balanceAda / this.policy.monthlyHostingAda) * 30;

    return {
      balanceAda,
      reserveAda,
      spendableAda,
      runwayDays,
      monthlyHostingAda: this.policy.monthlyHostingAda,
    };
  }

  decideHostingPayment(balanceAda: number): HostingDecision {
    const snapshot = this.snapshot(balanceAda);

    if (snapshot.balanceAda < this.policy.monthlyHostingAda) {
      return {
        shouldPay: false,
        amountAda: 0,
        reason: 'Caja insuficiente para cubrir el próximo ciclo de hosting',
      };
    }

    if (snapshot.runwayDays < this.policy.emergencyRunwayDays) {
      return {
        shouldPay: false,
        amountAda: 0,
        reason: 'Runway en emergencia, conservar liquidez',
      };
    }

    return {
      shouldPay: true,
      amountAda: this.policy.monthlyHostingAda,
      reason: 'Runway suficiente para sostener el siguiente ciclo',
    };
  }

  canReplicate(balanceAda: number, totalProfitAda: number): boolean {
    const snapshot = this.snapshot(balanceAda);
    const replicationBankroll = balanceAda * this.policy.maxReplicationAllocationPct;

    return (
      snapshot.runwayDays >= this.policy.targetRunwayDays &&
      snapshot.spendableAda >= replicationBankroll &&
      totalProfitAda >= this.policy.monthlyHostingAda * 2
    );
  }

  getTradeBudget(balanceAda: number): number {
    const snapshot = this.snapshot(balanceAda);
    return snapshot.spendableAda * this.policy.maxTradeAllocationPct;
  }

  private calculateReserve(balanceAda: number): number {
    const reserveFromRunway =
      (this.policy.monthlyHostingAda / 30) * this.policy.targetRunwayDays;

    return Math.min(balanceAda, reserveFromRunway);
  }
}
