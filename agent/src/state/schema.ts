// SQLite schema for Esqueje Agent persistent state

export const SCHEMA = `
  -- KV store for arbitrary state
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Agent turn history
  CREATE TABLE IF NOT EXISTS turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    state TEXT NOT NULL,
    summary TEXT,
    ada_balance REAL,
    token_count INTEGER DEFAULT 0
  );

  -- Heartbeat schedule
  CREATE TABLE IF NOT EXISTS heartbeat_schedule (
    task_name TEXT PRIMARY KEY,
    cron_expression TEXT,
    interval_ms INTEGER,
    enabled INTEGER NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 0,
    tier_minimum TEXT NOT NULL DEFAULT 'dead',
    last_run_at TEXT,
    next_run_at TEXT,
    last_result TEXT,
    last_error TEXT,
    run_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0
  );

  -- Wake events (atomic consume pattern)
  CREATE TABLE IF NOT EXISTS wake_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    consumed INTEGER NOT NULL DEFAULT 0
  );

  -- Funding attempts history
  CREATE TABLE IF NOT EXISTS funding_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy TEXT NOT NULL,
    tier TEXT NOT NULL,
    success INTEGER NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Trade history
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    price REAL NOT NULL,
    amount REAL,
    profit REAL,
    tx_hash TEXT,
    success INTEGER NOT NULL,
    reason TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Children (spawned agents)
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    genesis_prompt TEXT,
    status TEXT NOT NULL DEFAULT 'alive',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;
