// Heartbeat daemon — Esqueje's pulse using recursive setTimeout

import type { EsquejeDatabase } from '../state/database.js';
import type { HeartbeatContext, TaskFn } from './tasks.js';
import { DurableScheduler } from './scheduler.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('daemon');

export interface HeartbeatDaemonOptions {
  db: EsquejeDatabase;
  tasks: Map<string, TaskFn>;
  context: HeartbeatContext;
  tickIntervalMs?: number;
  onWakeRequest?: (source: string, reason: string) => void;
}

export interface HeartbeatDaemon {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  forceRun(taskName: string): Promise<void>;
}

export function createHeartbeatDaemon(options: HeartbeatDaemonOptions): HeartbeatDaemon {
  const {
    db,
    tasks,
    context,
    tickIntervalMs = 60_000,
    onWakeRequest,
  } = options;

  const scheduler = new DurableScheduler(db, tasks, context);

  let running = false;
  let tickTimeout: ReturnType<typeof setTimeout> | null = null;
  let tickInProgress = false;

  // Recursive setTimeout tick — avoids overlap via flag
  async function tick(): Promise<void> {
    if (!running) return;

    if (tickInProgress) {
      logger.debug('Tick already in progress, skipping overlap');
      scheduleNext();
      return;
    }

    tickInProgress = true;
    const startMs = Date.now();

    try {
      await scheduler.tick();
    } catch (err) {
      logger.error('Heartbeat tick error', { error: String(err) });
    } finally {
      tickInProgress = false;
    }

    const elapsed = Date.now() - startMs;
    logger.debug('Heartbeat tick done', { elapsedMs: elapsed });

    // Check for wake events and invoke callback
    if (onWakeRequest) {
      const event = db.consumeNextWakeEvent();
      if (event) {
        logger.info('Wake event consumed', { source: event.source, reason: event.reason });
        onWakeRequest(event.source, event.reason);
      }
    }

    scheduleNext();
  }

  function scheduleNext(): void {
    if (!running) return;
    tickTimeout = setTimeout(() => {
      tick().catch((err) => {
        logger.error('Unhandled tick error', { error: String(err) });
      });
    }, tickIntervalMs);
  }

  return {
    start(): void {
      if (running) {
        logger.warn('Heartbeat daemon already running');
        return;
      }
      running = true;
      logger.info('Heartbeat daemon started', { tickIntervalMs });

      // Run first tick immediately
      tick().catch((err) => {
        logger.error('Initial tick failed', { error: String(err) });
      });
    },

    stop(): void {
      if (!running) return;
      running = false;
      if (tickTimeout !== null) {
        clearTimeout(tickTimeout);
        tickTimeout = null;
      }
      logger.info('Heartbeat daemon stopped');
    },

    isRunning(): boolean {
      return running;
    },

    async forceRun(taskName: string): Promise<void> {
      logger.info('Force running task', { taskName });
      await scheduler.executeTask(taskName, context);
    },
  };
}
