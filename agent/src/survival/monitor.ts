// Resource monitor for Esqueje Agent
// Checks ADA balance, computes survival tier, detects tier changes

import type { FinancialState, SurvivalTier, EsquejeConfig } from '../types.js';
import type { EsquejeDatabase } from '../state/database.js';
import { ConfigManager } from '../config.js';
import { EconomicsEngine } from '../economics.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('monitor');
const economics = new EconomicsEngine(new ConfigManager().getTreasuryPolicy());

export interface ResourceStatus {
  financial: FinancialState;
  tier: SurvivalTier;
  previousTier: SurvivalTier | null;
  tierChanged: boolean;
}

const TIER_ORDER: Record<SurvivalTier, number> = {
  healthy: 3,
  low_compute: 2,
  critical: 1,
  dead: 0,
};

export function getSurvivalTier(
  adaBalance: number,
  thresholds: EsquejeConfig['thresholds'],
): SurvivalTier {
  if (adaBalance <= 0) return 'dead';
  if (adaBalance < thresholds.critical) return 'critical';
  if (adaBalance < thresholds.lowCompute) return 'low_compute';
  if (adaBalance < thresholds.healthy) return 'low_compute';
  return 'healthy';
}

export function isTierAtLeast(tier: SurvivalTier, minimum: SurvivalTier): boolean {
  return TIER_ORDER[tier] >= TIER_ORDER[minimum];
}

function estimateDailyBurnRate(db: EsquejeDatabase): number {
  // Use the configured monthly burn as a floor so runway calculations reflect real costs.
  const baselineDailyBurn = economics.describeCapitalPlan().monthlyBurnAda / 30;
  const recent = db.getRecentTrades(100);
  if (recent.length === 0) return baselineDailyBurn;

  // Sum losses
  const totalLoss = recent
    .filter((t) => t.profit !== null && (t.profit as number) < 0)
    .reduce((sum, t) => sum + Math.abs(t.profit as number), 0);

  // Assume 7-day window
  return Math.max(baselineDailyBurn, totalLoss / 7);
}

export async function checkResources(
  db: EsquejeDatabase,
  config: EsquejeConfig,
): Promise<ResourceStatus> {
  const now = new Date().toISOString();

  // Read balance from DB (updated by wallet module before calling this)
  const balanceStr = db.getKV('ada_balance');
  const adaBalance = balanceStr ? parseFloat(balanceStr) : 0;

  const lovelaceBalance = BigInt(Math.round(adaBalance * 1_000_000));

  const dailyBurnRate = estimateDailyBurnRate(db);
  const daysRemaining = dailyBurnRate > 0 ? adaBalance / dailyBurnRate : Infinity;

  const financial: FinancialState = {
    adaBalance,
    lovelaceBalance,
    dailyBurnRate,
    daysRemaining: isFinite(daysRemaining) ? Math.round(daysRemaining * 10) / 10 : 999,
    lastChecked: now,
  };

  const tier = getSurvivalTier(adaBalance, config.thresholds);

  const previousTierStr = db.getKV('survival_tier') as SurvivalTier | null;
  const previousTier = previousTierStr ?? null;
  const tierChanged = previousTier !== null && previousTier !== tier;

  // Persist tier
  db.setKV('survival_tier', tier);
  db.setKV('last_balance_check', now);

  if (tierChanged) {
    logger.warn('Survival tier changed', {
      from: previousTier,
      to: tier,
      balance: adaBalance,
    });
    db.insertWakeEvent('monitor', `Tier changed from ${previousTier} to ${tier}`);
  } else {
    logger.debug('Resources checked', { tier, balance: adaBalance });
  }

  return { financial, tier, previousTier, tierChanged };
}

export function formatResourceReport(status: ResourceStatus): string {
  const { financial, tier, previousTier, tierChanged } = status;

  const tierEmoji: Record<SurvivalTier, string> = {
    healthy: '[HEALTHY]',
    low_compute: '[LOW]',
    critical: '[CRITICAL]',
    dead: '[DEAD]',
  };

  const lines: string[] = [
    `=== Resource Report ===`,
    `Balance:       ${financial.adaBalance.toFixed(4)} ADA`,
    `Tier:          ${tierEmoji[tier]} ${tier.toUpperCase()}`,
    `Daily burn:    ~${financial.dailyBurnRate.toFixed(2)} ADA/day`,
    `Days remaining: ${financial.daysRemaining === 999 ? 'unknown' : financial.daysRemaining}`,
    `Checked at:    ${financial.lastChecked}`,
  ];

  if (tierChanged && previousTier) {
    lines.push(`TIER CHANGE: ${previousTier} -> ${tier}`);
  }

  return lines.join('\n');
}
