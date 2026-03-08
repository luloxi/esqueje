// DurableScheduler — executes heartbeat tasks based on DB schedule

import type { EsquejeDatabase } from '../state/database.js';
import type { SurvivalTier } from '../types.js';
import type { TaskFn, HeartbeatContext } from './tasks.js';
import { isTierAtLeast } from '../survival/monitor.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('scheduler');

function addMs(isoDate: string, ms: number): string {
  return new Date(new Date(isoDate).getTime() + ms).toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

export class DurableScheduler {
  private db: EsquejeDatabase;
  private tasks: Map<string, TaskFn>;
  private context: HeartbeatContext;

  constructor(
    db: EsquejeDatabase,
    tasks: Map<string, TaskFn>,
    context: HeartbeatContext,
  ) {
    this.db = db;
    this.tasks = tasks;
    this.context = context;
  }

  async tick(): Promise<void> {
    const now = nowIso();
    const currentTierStr = this.db.getKV('survival_tier') as SurvivalTier | null;
    const currentTier: SurvivalTier = currentTierStr ?? 'healthy';

    const entries = this.db.getHeartbeatEntries();
    const due = entries.filter((entry) => {
      if (!entry.enabled) return false;

      // Check tier requirement
      if (!isTierAtLeast(currentTier, entry.tierMinimum)) {
        return false;
      }

      // Check if the task is due
      if (!entry.nextRunAt) return true; // never run — due immediately
      return entry.nextRunAt <= now;
    });

    // Sort by priority descending
    due.sort((a, b) => b.priority - a.priority);

    for (const entry of due) {
      await this.executeTask(entry.taskName, this.context);
    }
  }

  async executeTask(name: string, context: HeartbeatContext): Promise<void> {
    const fn = this.tasks.get(name);
    if (!fn) {
      logger.warn('Task not found', { name });
      return;
    }

    const entry = this.db
      .getHeartbeatEntries()
      .find((e) => e.taskName === name);

    if (!entry) {
      logger.warn('Task has no schedule entry', { name });
      return;
    }

    const startedAt = nowIso();
    logger.debug('Executing task', { name, priority: entry.priority });

    try {
      await fn(context);

      const completedAt = nowIso();
      const intervalMs = entry.intervalMs ?? 60_000;
      const nextRunAt = addMs(completedAt, intervalMs);

      this.db.updateHeartbeatRun(name, completedAt, nextRunAt, true, 'ok');
      logger.debug('Task completed', { name, nextRunAt });
    } catch (err) {
      const completedAt = nowIso();
      const intervalMs = entry.intervalMs ?? 60_000;
      const nextRunAt = addMs(completedAt, intervalMs);
      const errorMsg = err instanceof Error ? err.message : String(err);

      this.db.updateHeartbeatRun(name, completedAt, nextRunAt, false, errorMsg);
      logger.error('Task failed', { name, error: errorMsg });
    }
  }
}
