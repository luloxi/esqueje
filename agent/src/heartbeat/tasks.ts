// Built-in heartbeat tasks for Esqueje Agent

import type { EsquejeDatabase } from '../state/database.js';
import type { EsquejeConfig, EsquejeIdentity, SurvivalTier } from '../types.js';
import { checkResources, formatResourceReport } from '../survival/monitor.js';
import { executeFundingStrategies } from '../survival/funding.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('tasks');

export interface HeartbeatContext {
  db: EsquejeDatabase;
  config: EsquejeConfig;
  identity: EsquejeIdentity;
}

export type TaskFn = (context: HeartbeatContext) => Promise<void>;

// ---------------------------------------------------------------------------
// Task: check_resources
// ---------------------------------------------------------------------------

async function checkResourcesTask(ctx: HeartbeatContext): Promise<void> {
  const status = await checkResources(ctx.db, ctx.config);
  logger.info('Resource check complete', {
    tier: status.tier,
    balance: status.financial.adaBalance,
    daysRemaining: status.financial.daysRemaining,
  });

  if (status.tier !== 'healthy') {
    const attempts = await executeFundingStrategies(
      status.tier,
      ctx.identity,
      ctx.config,
      ctx.db,
    );
    if (attempts.length > 0) {
      logger.info('Funding strategies executed', { count: attempts.length, tier: status.tier });
    }
  }

  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug(formatResourceReport(status));
  }
}

// ---------------------------------------------------------------------------
// Task: check_survival
// ---------------------------------------------------------------------------

async function checkSurvivalTask(ctx: HeartbeatContext): Promise<void> {
  const tierStr = ctx.db.getKV('survival_tier') as SurvivalTier | null;
  const tier = tierStr ?? 'healthy';

  if (tier === 'dead') {
    logger.error('Agent is in DEAD tier — inserting wake event for shutdown');
    ctx.db.insertWakeEvent('survival_check', 'Agent tier is dead');
  } else if (tier === 'critical') {
    logger.warn('Agent is in CRITICAL tier');
    ctx.db.insertWakeEvent('survival_check', 'Agent tier is critical');
  }
}

// ---------------------------------------------------------------------------
// Task: log_status
// ---------------------------------------------------------------------------

async function logStatusTask(ctx: HeartbeatContext): Promise<void> {
  const tier = ctx.db.getKV('survival_tier') ?? 'unknown';
  const balance = ctx.db.getKV('ada_balance') ?? '0';
  const agentState = ctx.db.getAgentState();
  const turnCount = ctx.db.getTurnCount();

  logger.info('Agent status', {
    name: ctx.config.name,
    tier,
    balance: parseFloat(balance),
    state: agentState,
    turns: turnCount,
    network: ctx.config.network,
  });

  // Record status in DB as well
  ctx.db.setKV('last_status_log', new Date().toISOString());
}

// ---------------------------------------------------------------------------
// Task: cleanup
// ---------------------------------------------------------------------------

async function cleanupTask(ctx: HeartbeatContext): Promise<void> {
  logger.info('Running cleanup task');
  ctx.db.cleanup(30);
  logger.info('Cleanup complete');
}

// ---------------------------------------------------------------------------
// Export task map
// ---------------------------------------------------------------------------

export function buildBuiltinTasks(): Map<string, TaskFn> {
  const tasks = new Map<string, TaskFn>();
  tasks.set('check_resources', checkResourcesTask);
  tasks.set('check_survival', checkSurvivalTask);
  tasks.set('log_status', logStatusTask);
  tasks.set('cleanup', cleanupTask);
  return tasks;
}

// Default schedule entries for built-in tasks (interval in ms)
export interface DefaultTaskSchedule {
  taskName: string;
  intervalMs: number;
  priority: number;
  tierMinimum: SurvivalTier;
  enabled: boolean;
}

export const DEFAULT_TASK_SCHEDULES: DefaultTaskSchedule[] = [
  {
    taskName: 'check_resources',
    intervalMs: 5 * 60 * 1000,    // every 5 minutes
    priority: 10,
    tierMinimum: 'dead',           // always run, even when dead
    enabled: true,
  },
  {
    taskName: 'check_survival',
    intervalMs: 60 * 1000,         // every minute
    priority: 9,
    tierMinimum: 'dead',
    enabled: true,
  },
  {
    taskName: 'log_status',
    intervalMs: 10 * 60 * 1000,   // every 10 minutes
    priority: 5,
    tierMinimum: 'dead',
    enabled: true,
  },
  {
    taskName: 'cleanup',
    intervalMs: 24 * 60 * 60 * 1000, // daily
    priority: 1,
    tierMinimum: 'low_compute',
    enabled: true,
  },
];
