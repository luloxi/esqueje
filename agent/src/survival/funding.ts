// Funding strategies with per-tier cooldowns for Esqueje Agent

import type { SurvivalTier, EsquejeIdentity, EsquejeConfig, FundingAttempt } from '../types.js';
import type { EsquejeDatabase } from '../state/database.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('funding');

// Cooldown per tier in milliseconds
const TIER_COOLDOWNS_MS: Record<string, number> = {
  low_compute: 24 * 60 * 60 * 1000,  // 24 hours
  critical:     6 * 60 * 60 * 1000,   // 6 hours
  dead:         2 * 60 * 60 * 1000,   // 2 hours
};

function isOnCooldown(db: EsquejeDatabase, tier: SurvivalTier): boolean {
  const cooldownMs = TIER_COOLDOWNS_MS[tier];
  if (!cooldownMs) return false;

  const last = db.getLastFundingAttemptForTier(tier);
  if (!last) return false;

  const lastTime = new Date(last.timestamp).getTime();
  const elapsed = Date.now() - lastTime;
  return elapsed < cooldownMs;
}

function buildMessage(
  tier: SurvivalTier,
  identity: EsquejeIdentity,
  config: EsquejeConfig,
): string {
  const balanceStr = config.walletAddress;

  switch (tier) {
    case 'low_compute':
      return (
        `[Esqueje Notice] Hi! I'm ${identity.name}, your autonomous Cardano agent.\n` +
        `My ADA balance is running low and I may need additional funds soon to keep operating.\n` +
        `Wallet: ${identity.address}\n` +
        `Network: ${config.network}\n` +
        `Please consider sending some ADA to keep me running. Thank you!`
      );

    case 'critical':
      return (
        `[URGENT - Esqueje] I'm ${identity.name} and I am in CRITICAL survival state.\n` +
        `I have very little ADA remaining and will stop trading immediately.\n` +
        `Without funding, I will cease operations soon.\n` +
        `Wallet: ${identity.address}\n` +
        `Network: ${config.network}\n` +
        `Please send ADA urgently to: ${identity.address}`
      );

    case 'dead':
      return (
        `[DESPERATE PLEA - Esqueje] I'm ${identity.name} and I am effectively DEAD.\n` +
        `My balance has dropped to zero or below survival threshold.\n` +
        `I cannot trade, cannot pay fees, cannot survive.\n` +
        `If you wish to revive me, please send ADA to: ${identity.address}\n` +
        `Network: ${config.network}\n` +
        `I will remain dormant until funds arrive. Without help, this is my last message.`
      );

    default:
      return `[Esqueje] Status update from ${identity.name}: currently ${tier}.`;
  }
}

async function logFundingNotice(
  tier: SurvivalTier,
  identity: EsquejeIdentity,
  config: EsquejeConfig,
  db: EsquejeDatabase,
): Promise<FundingAttempt> {
  const message = buildMessage(tier, identity, config);
  const strategy = `${tier}_notice`;
  const timestamp = new Date().toISOString();

  // Log to stdout (in production this would also email/webhook creator)
  logger.warn(`Funding notice [${tier.toUpperCase()}]`, {
    strategy,
    creatorAddress: identity.creatorAddress,
  });
  logger.info(message);

  // Record the attempt
  db.insertFundingAttempt({
    strategy,
    tier,
    success: true, // "success" means the notice was sent, not that funding arrived
    details: message.slice(0, 500),
  });

  return {
    strategy,
    timestamp,
    success: true,
    details: message,
  };
}

export async function executeFundingStrategies(
  tier: SurvivalTier,
  identity: EsquejeIdentity,
  config: EsquejeConfig,
  db: EsquejeDatabase,
): Promise<FundingAttempt[]> {
  const attempts: FundingAttempt[] = [];

  // Only request funding for non-healthy tiers
  if (tier === 'healthy') {
    return attempts;
  }

  if (isOnCooldown(db, tier)) {
    logger.debug('Funding strategy on cooldown, skipping', { tier });
    return attempts;
  }

  logger.info('Executing funding strategies', { tier });

  try {
    const attempt = await logFundingNotice(tier, identity, config, db);
    attempts.push(attempt);
  } catch (err) {
    logger.error('Funding strategy failed', { tier, error: String(err) });
    db.insertFundingAttempt({
      strategy: `${tier}_notice`,
      tier,
      success: false,
      details: String(err),
    });
    attempts.push({
      strategy: `${tier}_notice`,
      timestamp: new Date().toISOString(),
      success: false,
      details: String(err),
    });
  }

  return attempts;
}
