export interface TreasuryPolicy {
  monthlyHostingAda: number;
  monthlyOperationsAda: number;
  targetMonthlyProfitAda: number;
  emergencyRunwayDays: number;
  targetRunwayDays: number;
  assumedMonthlyNetReturnPct: number;
  minimumAgentBalanceAda: number;
  replicationSeedAda: number;
  minimumProfitForReplicationAda: number;
  maxTradeAllocationPct: number;
}

export interface TreasurySnapshot {
  balanceAda: number;
  emergencyReserveAda: number;
  targetReserveAda: number;
  spendableAda: number;
  runwayDays: number;
  monthlyBurnAda: number;
  minimumOperationalBalanceAda: number;
  replicationSeedAda: number;
  recommendedParentBalanceAda: number;
}

export interface HostingDecision {
  shouldPay: boolean;
  amountAda: number;
  reason: string;
}

export interface CapitalPlan {
  monthlyBurnAda: number;
  emergencyReserveAda: number;
  targetReserveAda: number;
  requiredTradingCapitalAda: number;
  minimumOperationalBalanceAda: number;
  replicationSeedAda: number;
  recommendedParentBalanceAda: number;
}

const DEFAULT_POLICY: TreasuryPolicy = {
  monthlyHostingAda: 25,
  monthlyOperationsAda: 5,
  targetMonthlyProfitAda: 15,
  emergencyRunwayDays: 30,
  targetRunwayDays: 90,
  assumedMonthlyNetReturnPct: 0.12,
  minimumAgentBalanceAda: 500,
  replicationSeedAda: 500,
  minimumProfitForReplicationAda: 90,
  maxTradeAllocationPct: 0.12,
};

export class EconomicsEngine {
  constructor(private readonly policy: TreasuryPolicy = DEFAULT_POLICY) {}

  getPolicy(): TreasuryPolicy {
    return { ...this.policy };
  }

  describeCapitalPlan(): CapitalPlan {
    const assumedMonthlyNetReturnPct = Math.max(this.policy.assumedMonthlyNetReturnPct, 0.0001);
    const monthlyBurnAda = this.getMonthlyBurnAda();
    const emergencyReserveAda = this.calculateReserve(this.policy.emergencyRunwayDays);
    const targetReserveAda = this.calculateReserve(this.policy.targetRunwayDays);
    const requiredTradingCapitalAda = Math.ceil(
      (monthlyBurnAda + this.policy.targetMonthlyProfitAda) /
      assumedMonthlyNetReturnPct
    );
    const minimumOperationalBalanceAda = Math.max(
      this.policy.minimumAgentBalanceAda,
      Math.ceil(targetReserveAda + requiredTradingCapitalAda),
    );
    const replicationSeedAda = Math.max(
      this.policy.replicationSeedAda,
      minimumOperationalBalanceAda,
    );

    return {
      monthlyBurnAda,
      emergencyReserveAda,
      targetReserveAda,
      requiredTradingCapitalAda,
      minimumOperationalBalanceAda,
      replicationSeedAda,
      recommendedParentBalanceAda: minimumOperationalBalanceAda + replicationSeedAda,
    };
  }

  getSurvivalThresholds(): { healthy: number; lowCompute: number; critical: number } {
    const plan = this.describeCapitalPlan();

    return {
      healthy: Math.ceil(plan.targetReserveAda),
      lowCompute: Math.ceil(plan.emergencyReserveAda * 2),
      critical: Math.ceil(plan.emergencyReserveAda),
    };
  }

  snapshot(balanceAda: number): TreasurySnapshot {
    const plan = this.describeCapitalPlan();
    const spendableAda = Math.max(0, balanceAda - plan.emergencyReserveAda);
    const runwayDays =
      plan.monthlyBurnAda <= 0
        ? Number.POSITIVE_INFINITY
        : (balanceAda / plan.monthlyBurnAda) * 30;

    return {
      balanceAda,
      emergencyReserveAda: plan.emergencyReserveAda,
      targetReserveAda: plan.targetReserveAda,
      spendableAda,
      runwayDays,
      monthlyBurnAda: plan.monthlyBurnAda,
      minimumOperationalBalanceAda: plan.minimumOperationalBalanceAda,
      replicationSeedAda: plan.replicationSeedAda,
      recommendedParentBalanceAda: plan.recommendedParentBalanceAda,
    };
  }

  decideHostingPayment(balanceAda: number): HostingDecision {
    const current = this.snapshot(balanceAda);

    if (current.balanceAda < this.policy.monthlyHostingAda) {
      return {
        shouldPay: false,
        amountAda: 0,
        reason: 'Caja insuficiente para cubrir el próximo ciclo de hosting',
      };
    }

    const afterPayment = this.snapshot(balanceAda - this.policy.monthlyHostingAda);

    if (afterPayment.balanceAda < afterPayment.emergencyReserveAda) {
      return {
        shouldPay: false,
        amountAda: 0,
        reason: 'Pagar hosting dejaría al agente por debajo de la reserva de emergencia',
      };
    }

    if (afterPayment.runwayDays < this.policy.emergencyRunwayDays) {
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

  canReplicate(balanceAda: number, monthlyProfitAda: number): boolean {
    const plan = this.describeCapitalPlan();
    const snapshot = this.snapshot(balanceAda);

    return (
      snapshot.runwayDays >= this.policy.targetRunwayDays &&
      snapshot.balanceAda >= plan.recommendedParentBalanceAda &&
      monthlyProfitAda >= this.policy.minimumProfitForReplicationAda
    );
  }

  getTradeBudget(balanceAda: number): number {
    const snapshot = this.snapshot(balanceAda);
    return snapshot.spendableAda * this.policy.maxTradeAllocationPct;
  }

  private getMonthlyBurnAda(): number {
    return this.policy.monthlyHostingAda + this.policy.monthlyOperationsAda;
  }

  private calculateReserve(runwayDays: number): number {
    return (this.getMonthlyBurnAda() / 30) * runwayDays;
  }
}
