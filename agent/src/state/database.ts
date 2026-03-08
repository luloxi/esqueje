// SQLite database wrapper for Esqueje Agent
// Uses Node.js built-in node:sqlite (available since Node v22.5)

// @ts-ignore — node:sqlite is experimental in Node v22/v24, no @types yet
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { SCHEMA } from './schema.js';
import type { HeartbeatEntry, FundingAttempt, SurvivalTier, AgentState } from '../types.js';

export interface TurnInsert {
  startedAt: string;
  state: string;
  adaBalance?: number;
}

export interface TurnUpdate {
  completedAt: string;
  summary?: string;
  tokenCount?: number;
}

export interface TradeInsert {
  action: string;
  price: number;
  amount?: number;
  profit?: number;
  txHash?: string;
  success: boolean;
  reason?: string;
}

export interface FundingAttemptInsert {
  strategy: string;
  tier: string;
  success: boolean;
  details?: string;
}

export class EsquejeDatabase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly raw: any;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.raw = new DatabaseSync(dbPath);
    this.raw.exec('PRAGMA journal_mode = WAL');
    this.raw.exec('PRAGMA foreign_keys = ON');
    this.initSchema();
  }

  private initSchema(): void {
    // Execute each statement separately
    const statements = SCHEMA.split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    for (const stmt of statements) {
      this.raw.exec(stmt + ';');
    }
  }

  // ---- KV store ----

  getKV(key: string): string | null {
    const row = this.raw
      .prepare('SELECT value FROM kv_store WHERE key = ?')
      .get(key) as { value: string } | undefined;
    return row ? row.value : null;
  }

  setKV(key: string, value: string): void {
    this.raw
      .prepare(
        `INSERT INTO kv_store (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run(key, value);
  }

  deleteKV(key: string): void {
    this.raw.prepare('DELETE FROM kv_store WHERE key = ?').run(key);
  }

  // ---- Agent state ----

  getAgentState(): AgentState {
    const val = this.getKV('agent_state');
    return (val as AgentState) || 'sleeping';
  }

  setAgentState(state: AgentState): void {
    this.setKV('agent_state', state);
  }

  // ---- Turns ----

  getTurnCount(): number {
    const row = this.raw
      .prepare('SELECT COUNT(*) as cnt FROM turns')
      .get() as { cnt: number };
    return row.cnt;
  }

  insertTurn(data: TurnInsert): number {
    const result = this.raw
      .prepare(
        `INSERT INTO turns (started_at, state, ada_balance)
         VALUES (?, ?, ?)`
      )
      .run(data.startedAt, data.state, data.adaBalance ?? null);
    return result.lastInsertRowid as number;
  }

  completeTurn(id: number, data: TurnUpdate): void {
    this.raw
      .prepare(
        `UPDATE turns
         SET completed_at = ?, summary = ?, token_count = ?
         WHERE id = ?`
      )
      .run(data.completedAt, data.summary ?? null, data.tokenCount ?? 0, id);
  }

  // ---- Wake events ----

  insertWakeEvent(source: string, reason: string): void {
    this.raw
      .prepare(
        `INSERT INTO wake_events (source, reason)
         VALUES (?, ?)`
      )
      .run(source, reason);
  }

  consumeNextWakeEvent(): { id: number; source: string; reason: string; createdAt: string } | null {
    // node:sqlite has no .transaction() helper — use manual BEGIN/COMMIT
    this.raw.exec('BEGIN');
    try {
      const row = this.raw
        .prepare(
          `SELECT id, source, reason, created_at
           FROM wake_events
           WHERE consumed = 0
           ORDER BY id ASC
           LIMIT 1`
        )
        .get() as { id: number; source: string; reason: string; created_at: string } | undefined;

      if (!row) {
        this.raw.exec('ROLLBACK');
        return null;
      }

      this.raw
        .prepare('UPDATE wake_events SET consumed = 1 WHERE id = ?')
        .run(row.id);

      this.raw.exec('COMMIT');
      return {
        id: row.id,
        source: row.source,
        reason: row.reason,
        createdAt: row.created_at,
      };
    } catch (err) {
      this.raw.exec('ROLLBACK');
      throw err;
    }
  }

  // ---- Heartbeat schedule ----

  getHeartbeatEntries(): HeartbeatEntry[] {
    const rows = this.raw
      .prepare('SELECT * FROM heartbeat_schedule ORDER BY priority DESC')
      .all() as Array<{
        task_name: string;
        cron_expression: string | null;
        interval_ms: number | null;
        enabled: number;
        priority: number;
        tier_minimum: string;
        last_run_at: string | null;
        next_run_at: string | null;
        run_count: number;
        fail_count: number;
      }>;

    return rows.map((r) => ({
      taskName: r.task_name,
      cronExpression: r.cron_expression ?? undefined,
      intervalMs: r.interval_ms ?? undefined,
      enabled: r.enabled === 1,
      priority: r.priority,
      tierMinimum: r.tier_minimum as SurvivalTier,
      lastRunAt: r.last_run_at ?? undefined,
      nextRunAt: r.next_run_at ?? undefined,
      runCount: r.run_count,
      failCount: r.fail_count,
    }));
  }

  upsertHeartbeatEntry(entry: HeartbeatEntry): void {
    this.raw
      .prepare(
        `INSERT INTO heartbeat_schedule
           (task_name, cron_expression, interval_ms, enabled, priority, tier_minimum,
            last_run_at, next_run_at, run_count, fail_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(task_name) DO UPDATE SET
           cron_expression = excluded.cron_expression,
           interval_ms     = excluded.interval_ms,
           enabled         = excluded.enabled,
           priority        = excluded.priority,
           tier_minimum    = excluded.tier_minimum,
           last_run_at     = excluded.last_run_at,
           next_run_at     = excluded.next_run_at,
           run_count       = excluded.run_count,
           fail_count      = excluded.fail_count`
      )
      .run(
        entry.taskName,
        entry.cronExpression ?? null,
        entry.intervalMs ?? null,
        entry.enabled ? 1 : 0,
        entry.priority,
        entry.tierMinimum,
        entry.lastRunAt ?? null,
        entry.nextRunAt ?? null,
        entry.runCount,
        entry.failCount,
      );
  }

  updateHeartbeatRun(
    taskName: string,
    lastRunAt: string,
    nextRunAt: string,
    success: boolean,
    resultOrError?: string,
  ): void {
    if (success) {
      this.raw
        .prepare(
          `UPDATE heartbeat_schedule
           SET last_run_at = ?, next_run_at = ?, last_result = ?,
               run_count = run_count + 1
           WHERE task_name = ?`
        )
        .run(lastRunAt, nextRunAt, resultOrError ?? null, taskName);
    } else {
      this.raw
        .prepare(
          `UPDATE heartbeat_schedule
           SET last_run_at = ?, next_run_at = ?, last_error = ?,
               run_count = run_count + 1, fail_count = fail_count + 1
           WHERE task_name = ?`
        )
        .run(lastRunAt, nextRunAt, resultOrError ?? null, taskName);
    }
  }

  // ---- Funding attempts ----

  insertFundingAttempt(attempt: FundingAttemptInsert): void {
    this.raw
      .prepare(
        `INSERT INTO funding_attempts (strategy, tier, success, details)
         VALUES (?, ?, ?, ?)`
      )
      .run(attempt.strategy, attempt.tier, attempt.success ? 1 : 0, attempt.details ?? null);
  }

  getFundingAttempts(limit = 50): Array<{
    id: number;
    strategy: string;
    tier: string;
    success: boolean;
    details: string | null;
    timestamp: string;
  }> {
    return (
      this.raw
        .prepare(
          `SELECT id, strategy, tier, success, details, timestamp
           FROM funding_attempts
           ORDER BY id DESC
           LIMIT ?`
        )
        .all(limit) as Array<{
          id: number;
          strategy: string;
          tier: string;
          success: number;
          details: string | null;
          timestamp: string;
        }>
    ).map((r) => ({ ...r, success: r.success === 1 }));
  }

  getLastFundingAttemptForTier(tier: string): { timestamp: string } | null {
    const row = this.raw
      .prepare(
        `SELECT timestamp FROM funding_attempts
         WHERE tier = ?
         ORDER BY id DESC
         LIMIT 1`
      )
      .get(tier) as { timestamp: string } | undefined;
    return row ?? null;
  }

  // ---- Trades ----

  insertTrade(trade: TradeInsert): void {
    this.raw
      .prepare(
        `INSERT INTO trades (action, price, amount, profit, tx_hash, success, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        trade.action,
        trade.price,
        trade.amount ?? null,
        trade.profit ?? null,
        trade.txHash ?? null,
        trade.success ? 1 : 0,
        trade.reason ?? null,
      );
  }

  getRecentTrades(n: number): Array<{
    id: number;
    action: string;
    price: number;
    amount: number | null;
    profit: number | null;
    txHash: string | null;
    success: boolean;
    reason: string | null;
    timestamp: string;
  }> {
    return (
      this.raw
        .prepare(
          `SELECT id, action, price, amount, profit, tx_hash, success, reason, timestamp
           FROM trades
           ORDER BY id DESC
           LIMIT ?`
        )
        .all(n) as Array<{
          id: number;
          action: string;
          price: number;
          amount: number | null;
          profit: number | null;
          tx_hash: string | null;
          success: number;
          reason: string | null;
          timestamp: string;
        }>
    ).map((r) => ({ ...r, txHash: r.tx_hash, success: r.success === 1 }));
  }

  // ---- Identity (alias for KV with prefix) ----

  getIdentity(key: string): string | null {
    return this.getKV(`identity:${key}`);
  }

  setIdentity(key: string, value: string): void {
    this.setKV(`identity:${key}`, value);
  }

  // ---- Cleanup ----

  cleanup(keepDays = 30): void {
    const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000).toISOString();
    this.raw.prepare(`DELETE FROM turns WHERE completed_at < ?`).run(cutoff);
    this.raw.prepare(`DELETE FROM wake_events WHERE created_at < ? AND consumed = 1`).run(cutoff);
    this.raw.prepare(`DELETE FROM funding_attempts WHERE timestamp < ?`).run(cutoff);
    this.raw.prepare(`DELETE FROM trades WHERE timestamp < ?`).run(cutoff);
  }

  close(): void {
    this.raw.close();
  }
}
