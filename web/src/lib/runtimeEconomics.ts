export const treasuryDefaults = {
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
} as const;

export function getCapitalPlan() {
  const assumedMonthlyNetReturnPct = Math.max(
    treasuryDefaults.assumedMonthlyNetReturnPct,
    0.0001
  );
  const monthlyBurnAda =
    treasuryDefaults.monthlyHostingAda + treasuryDefaults.monthlyOperationsAda;
  const emergencyReserveAda =
    (monthlyBurnAda / 30) * treasuryDefaults.emergencyRunwayDays;
  const targetReserveAda =
    (monthlyBurnAda / 30) * treasuryDefaults.targetRunwayDays;
  const requiredTradingCapitalAda = Math.ceil(
    (monthlyBurnAda + treasuryDefaults.targetMonthlyProfitAda) /
    assumedMonthlyNetReturnPct
  );
  const minimumOperationalBalanceAda = Math.max(
    treasuryDefaults.minimumAgentBalanceAda,
    Math.ceil(targetReserveAda + requiredTradingCapitalAda),
  );
  const replicationSeedAda = Math.max(
    treasuryDefaults.replicationSeedAda,
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

export function getSurvivalThresholds() {
  const plan = getCapitalPlan();

  return {
    healthy: Math.ceil(plan.targetReserveAda),
    lowCompute: Math.ceil(plan.emergencyReserveAda * 2),
    critical: Math.ceil(plan.emergencyReserveAda),
  };
}
