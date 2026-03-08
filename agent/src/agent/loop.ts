// Main agent loop for Esqueje
// Handles one full turn: balance update → survival check → trade → sleep decision

import type {
  EsquejeIdentity,
  EsquejeConfig,
  AgentState,
  SurvivalTier,
} from '../types.js';
import type { EsquejeDatabase } from '../state/database.js';
import type { WalletManager } from '../wallet.js';
import type { PythClient } from '../pyth.js';
import type { TradingEngine } from '../trading.js';
import type { EconomicsEngine } from '../economics.js';
import { PolicyEngine } from './policy-engine.js';
import { checkResources } from '../survival/monitor.js';
import { executeFundingStrategies } from '../survival/funding.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('loop');

// Sleep durations by tier (ms)
const SLEEP_BY_TIER: Record<SurvivalTier, number> = {
  healthy:     5 * 60 * 1000,   // 5 minutes
  low_compute: 10 * 60 * 1000,  // 10 minutes
  critical:    30 * 60 * 1000,  // 30 minutes
  dead:         5 * 60 * 1000,  // 5 minutes (check back frequently in hope of funding)
};

// Conservative trade amount multiplier when low_compute
const LOW_COMPUTE_TRADE_MULTIPLIER = 0.5;
// Base trade amount as fraction of balance
const BASE_TRADE_FRACTION = 0.05; // 5% of balance per trade

export interface AgentLoopOptions {
  identity: EsquejeIdentity;
  config: EsquejeConfig;
  db: EsquejeDatabase;
  wallet: WalletManager;
  pyth: PythClient;
  trading: TradingEngine;
  policyEngine: PolicyEngine;
  economics: EconomicsEngine;
  onStateChange?: (state: AgentState) => void;
  onTurnComplete?: (turn: { id: number; summary: string }) => void;
}

export async function runAgentLoop(options: AgentLoopOptions): Promise<void> {
  const {
    identity,
    config,
    db,
    wallet,
    pyth,
    trading,
    policyEngine,
    economics,
    onStateChange,
    onTurnComplete,
  } = options;

  const now = new Date().toISOString();
  const turnId = db.insertTurn({ startedAt: now, state: 'running' });

  db.setAgentState('running');
  onStateChange?.('running');

  logger.info('Agent loop turn started', { turnId, name: config.name });

  let summary = 'no-op';

  try {
    // 1. Update ADA balance from wallet
    const adaBalance = await wallet.getBalance();
    db.setKV('ada_balance', adaBalance.toString());
    logger.info('Balance updated', { adaBalance });

    const treasurySnapshot = economics.snapshot(adaBalance);
    db.setKV('monthly_burn_ada', treasurySnapshot.monthlyBurnAda.toString());
    db.setKV('minimum_agent_balance_ada', treasurySnapshot.minimumOperationalBalanceAda.toString());
    db.setKV('replication_seed_ada', treasurySnapshot.replicationSeedAda.toString());
    db.setKV(
      'recommended_parent_balance_ada',
      treasurySnapshot.recommendedParentBalanceAda.toString(),
    );
    db.setKV(
      'economic_viability',
      adaBalance >= treasurySnapshot.minimumOperationalBalanceAda ? 'viable' : 'underfunded',
    );
    logger.info('Treasury snapshot', {
      runwayDays: Number(treasurySnapshot.runwayDays.toFixed(1)),
      spendableAda: Number(treasurySnapshot.spendableAda.toFixed(2)),
      minimumOperationalBalanceAda: treasurySnapshot.minimumOperationalBalanceAda,
      recommendedParentBalanceAda: treasurySnapshot.recommendedParentBalanceAda,
    });

    // 2. Check resources / survival tier
    const resourceStatus = await checkResources(db, config);
    const { tier } = resourceStatus;

    // Trigger funding strategies on non-healthy tiers
    if (tier !== 'healthy') {
      await executeFundingStrategies(tier, identity, config, db);
    }

    // 3. Dead: can't do anything
    if (tier === 'dead') {
      logger.error('Agent is dead — insufficient ADA balance', { adaBalance });
      db.setAgentState('dead');
      onStateChange?.('dead');
      summary = `dead at ${adaBalance} ADA`;
      db.completeTurn(turnId, {
        completedAt: new Date().toISOString(),
        summary,
      });
      onTurnComplete?.({ id: turnId, summary });
      return;
    }

    // 4. Critical: skip trading, log distress
    if (tier === 'critical') {
      logger.warn('Critical tier — skipping trading, in survival mode', { adaBalance });
      summary = `critical at ${adaBalance} ADA — no trade`;

      const sleepMs = SLEEP_BY_TIER.critical;
      const sleepUntil = new Date(Date.now() + sleepMs).toISOString();
      db.setKV('sleep_until', sleepUntil);
      db.setAgentState('sleeping');
      onStateChange?.('sleeping');

      db.completeTurn(turnId, { completedAt: new Date().toISOString(), summary });
      onTurnComplete?.({ id: turnId, summary });
      return;
    }

    // 5. Determine trade amount based on tier
    let tradeAmountMultiplier = 1.0;
    if (tier === 'low_compute') {
      tradeAmountMultiplier = LOW_COMPUTE_TRADE_MULTIPLIER;
      logger.info('Low compute tier — using conservative trade size');
    }

    const tradeBudget = Math.min(
      economics.getTradeBudget(adaBalance) * tradeAmountMultiplier,
      adaBalance * BASE_TRADE_FRACTION * tradeAmountMultiplier,
    );

    if (tradeBudget <= 0) {
      logger.info('Trade budget is zero after reserves', {
        adaBalance,
        emergencyReserveAda: treasurySnapshot.emergencyReserveAda,
      });
      summary = `capital locked in reserve at ${adaBalance.toFixed(2)} ADA`;

      const sleepMs = SLEEP_BY_TIER[tier];
      const sleepUntil = new Date(Date.now() + sleepMs).toISOString();
      db.setKV('sleep_until', sleepUntil);
      db.setAgentState('sleeping');
      onStateChange?.('sleeping');

      db.completeTurn(turnId, { completedAt: new Date().toISOString(), summary });
      onTurnComplete?.({ id: turnId, summary });
      return;
    }

    // 6. Check policy before trading
    const policyResult = policyEngine.check({
      action: 'trade',
      amount: tradeBudget,
      adaBalance,
      tier,
    });

    if (!policyResult.allowed) {
      logger.info('Policy blocked trade', { reason: policyResult.reason });
      summary = `policy blocked: ${policyResult.reason}`;

      const sleepMs = SLEEP_BY_TIER[tier];
      const sleepUntil = new Date(Date.now() + sleepMs).toISOString();
      db.setKV('sleep_until', sleepUntil);
      db.setAgentState('sleeping');
      onStateChange?.('sleeping');

      db.completeTurn(turnId, { completedAt: new Date().toISOString(), summary });
      onTurnComplete?.({ id: turnId, summary });
      return;
    }

    // 7. Get Pyth price
    let price: number;
    try {
      price = await pyth.getPrice('ADA/USD');
      db.setKV('last_ada_price', price.toString());
      logger.info('Price fetched', { price });
    } catch (err) {
      logger.error('Failed to get Pyth price', { error: String(err) });
      summary = 'price fetch failed';

      const sleepMs = SLEEP_BY_TIER[tier];
      const sleepUntil = new Date(Date.now() + sleepMs).toISOString();
      db.setKV('sleep_until', sleepUntil);
      db.setAgentState('sleeping');
      onStateChange?.('sleeping');

      db.completeTurn(turnId, { completedAt: new Date().toISOString(), summary });
      onTurnComplete?.({ id: turnId, summary });
      return;
    }

    // 8. Evaluate trading signal
    const signal = await trading.evaluateSignal(price);
    logger.info('Trade signal evaluated', {
      action: signal.action,
      confidence: signal.confidence,
      reason: signal.reason,
    });

    // 9. Execute trade if signal and policy allow
    let tradeSummary = `signal=${signal.action}`;
    const tradeAmount = Math.min(
      tradeBudget,
      signal.suggestedCapitalAda && signal.suggestedCapitalAda > 0
        ? signal.suggestedCapitalAda
        : tradeBudget,
    );

    if (signal.action !== 'hold') {
      const tradeResult = await trading.executeTrade(signal, tradeAmount);

      db.insertTrade({
        action: signal.action,
        price,
        amount: tradeAmount,
        profit: tradeResult.profit,
        txHash: tradeResult.txHash,
        success: tradeResult.success,
        reason: signal.reason,
      });

      if (tradeResult.success) {
        logger.info('Trade executed', {
          action: signal.action,
          amount: tradeAmount,
          profit: tradeResult.profit,
          txHash: tradeResult.txHash,
        });
        tradeSummary = `${signal.action} amount=${tradeAmount.toFixed(2)} profit=${tradeResult.profit.toFixed(4)}`;
      } else {
        logger.warn('Trade failed', { action: signal.action });
        tradeSummary = `${signal.action} amount=${tradeAmount.toFixed(2)} failed`;
      }
    }

    // 10. Check replication conditions
    const recentTrades = db.getRecentTrades(1000);
    const totalProfit = recentTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const monthlyProfit = recentTrades
      .filter((trade) => trade.timestamp >= oneMonthAgo)
      .reduce((sum, trade) => sum + (trade.profit ?? 0), 0);
    const tradeCount = db.getTurnCount();
    db.setKV('lifetime_profit_ada', totalProfit.toString());
    db.setKV('monthly_profit_ada', monthlyProfit.toString());

    const shouldReplicate = economics.canReplicate(adaBalance, monthlyProfit);

    if (shouldReplicate) {
      logger.info('Replication conditions met', {
        adaBalance,
        monthlyProfit,
        tradeCount,
        minimumOperationalBalanceAda: treasurySnapshot.minimumOperationalBalanceAda,
        replicationSeedAda: treasurySnapshot.replicationSeedAda,
      });
      db.insertWakeEvent('replication', 'Replication conditions met');
    }

    // 11. Decide sleep duration and set state
    const sleepMs = SLEEP_BY_TIER[tier];
    const sleepUntil = new Date(Date.now() + sleepMs).toISOString();
    db.setKV('sleep_until', sleepUntil);
    db.setAgentState('sleeping');
    onStateChange?.('sleeping');

    summary = `${tier} | price=${price.toFixed(4)} | ${tradeSummary} | sleep=${sleepMs / 1000}s`;
    logger.info('Agent loop turn complete', { summary, sleepUntil });
  } catch (err) {
    summary = `error: ${String(err)}`;
    logger.error('Agent loop turn failed', { error: String(err) });
    db.setAgentState('sleeping');
    onStateChange?.('sleeping');

    // Default sleep on error
    const sleepUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    db.setKV('sleep_until', sleepUntil);
  }

  db.completeTurn(turnId, {
    completedAt: new Date().toISOString(),
    summary,
  });
  onTurnComplete?.({ id: turnId, summary });
}
