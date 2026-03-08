// Policy engine for Esqueje Agent
// Enforces spending limits, rate limits, and financial safety rules

import type { PolicyRule, PolicyContext, PolicyResult, SurvivalTier } from '../types.js';
import type { EsquejeDatabase } from '../state/database.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('policy');

// ---------------------------------------------------------------------------
// Built-in rules
// ---------------------------------------------------------------------------

const NO_TRADE_WHEN_CRITICAL: PolicyRule = {
  name: 'no_trade_when_critical',
  check(ctx: PolicyContext): PolicyResult {
    if (ctx.action !== 'trade') return { allowed: true };
    const dangerTiers: SurvivalTier[] = ['critical', 'dead'];
    if (ctx.tier && dangerTiers.includes(ctx.tier)) {
      return {
        allowed: false,
        reason: `Trading blocked: survival tier is ${ctx.tier}`,
      };
    }
    return { allowed: true };
  },
};

const MAX_TRADE_SIZE: PolicyRule = {
  name: 'max_trade_size',
  check(ctx: PolicyContext): PolicyResult {
    if (ctx.action !== 'trade') return { allowed: true };
    if (!ctx.amount || !ctx.adaBalance) return { allowed: true };

    // Never risk more than 10% of balance in a single trade
    const maxPct = 0.10;
    const maxAmount = ctx.adaBalance * maxPct;

    if (ctx.amount > maxAmount) {
      return {
        allowed: false,
        reason: `Trade amount ${ctx.amount.toFixed(2)} ADA exceeds max ${maxAmount.toFixed(2)} ADA (10% of ${ctx.adaBalance.toFixed(2)} ADA balance)`,
      };
    }
    return { allowed: true };
  },
};

// Rate limit: max 12 trades per hour (1 trade per 5 minutes on average)
const MAX_TRADES_PER_HOUR = 12;

function buildRateLimitRule(db: EsquejeDatabase): PolicyRule {
  return {
    name: 'rate_limit_trades',
    check(ctx: PolicyContext): PolicyResult {
      if (ctx.action !== 'trade') return { allowed: true };

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recent = db.getRecentTrades(MAX_TRADES_PER_HOUR + 1);
      const withinHour = recent.filter((t) => t.timestamp >= oneHourAgo);

      if (withinHour.length >= MAX_TRADES_PER_HOUR) {
        return {
          allowed: false,
          reason: `Rate limit: ${withinHour.length} trades in last hour (max ${MAX_TRADES_PER_HOUR})`,
        };
      }
      return { allowed: true };
    },
  };
}

const MIN_BALANCE_RESERVE: PolicyRule = {
  name: 'min_balance_reserve',
  check(ctx: PolicyContext): PolicyResult {
    if (ctx.action !== 'trade') return { allowed: true };
    if (!ctx.adaBalance) return { allowed: true };

    // Always keep at least 2 ADA in reserve for network fees
    const reserveAda = 2.0;
    if (ctx.adaBalance <= reserveAda) {
      return {
        allowed: false,
        reason: `Balance ${ctx.adaBalance.toFixed(2)} ADA is at or below minimum reserve of ${reserveAda} ADA`,
      };
    }
    return { allowed: true };
  },
};

// ---------------------------------------------------------------------------
// PolicyEngine
// ---------------------------------------------------------------------------

export class PolicyEngine {
  private rules: PolicyRule[];

  constructor(db: EsquejeDatabase, extraRules?: PolicyRule[]) {
    this.rules = [
      NO_TRADE_WHEN_CRITICAL,
      MAX_TRADE_SIZE,
      buildRateLimitRule(db),
      MIN_BALANCE_RESERVE,
      ...(extraRules ?? []),
    ];
  }

  check(context: PolicyContext): PolicyResult {
    for (const rule of this.rules) {
      const result = rule.check(context);
      if (!result.allowed) {
        logger.info('Policy check blocked action', {
          rule: rule.name,
          action: context.action,
          reason: result.reason,
        });
        return result;
      }
    }
    logger.debug('Policy check passed', { action: context.action });
    return { allowed: true };
  }

  addRule(rule: PolicyRule): void {
    this.rules.push(rule);
  }
}
