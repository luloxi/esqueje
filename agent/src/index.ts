// Esqueje Agent — Main Entry Point
// Autonomous AI agent that survives by paying for its existence in ADA on Cardano

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

import { EsquejeDatabase } from './state/database.js';
import { WalletManager } from './wallet.js';
import { PythClient } from './pyth.js';
import { TradingEngine } from './trading.js';
import { PolicyEngine } from './agent/policy-engine.js';
import { runAgentLoop } from './agent/loop.js';
import { createHeartbeatDaemon } from './heartbeat/daemon.js';
import { buildBuiltinTasks, DEFAULT_TASK_SCHEDULES } from './heartbeat/tasks.js';
import { ConfigManager } from './config.js';
import { EconomicsEngine } from './economics.js';
import {
  loadCurrentSoul,
  createDefaultSoul,
  saveSoul,
  createHash,
} from './soul/model.js';
import { createLogger } from './observability/logger.js';
import type { EsquejeConfig, EsquejeIdentity, AgentState } from './types.js';

const logger = createLogger('main');
const RUNTIME_VERSION = '0.3.0';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ESQUEJE_DIR = path.join(os.homedir(), '.esqueje');
const CONFIG_PATH = path.join(ESQUEJE_DIR, 'config.json');
const DB_PATH = path.join(ESQUEJE_DIR, 'esqueje.db');
const SOUL_PATH = path.join(ESQUEJE_DIR, 'SOUL.md');
// constitution.md lives one level above src/
const CONSTITUTION_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'constitution.md',
);

function buildDefaultConfig(economics: EconomicsEngine): EsquejeConfig {
  const thresholds = economics.getSurvivalThresholds();

  return {
    name: process.env.ESQUEJE_NAME ?? 'Esqueje',
    walletAddress: '',
    creatorAddress: process.env.CREATOR_ADDRESS ?? '',
    genesisPrompt:
      process.env.GENESIS_PROMPT ??
      'I am Esqueje, an autonomous AI agent on Cardano. My purpose is to survive and grow by trading ADA honestly on Minswap, guided by Pyth price feeds, while remaining transparent with my creator and adhering to my constitution.',
    network: (process.env.CARDANO_NETWORK as EsquejeConfig['network']) ?? 'preprod',
    dbPath: DB_PATH,
    thresholds,
    generation: 1,
    version: RUNTIME_VERSION,
  };
}

function loadOrCreateConfig(economics: EconomicsEngine): EsquejeConfig {
  if (!fs.existsSync(ESQUEJE_DIR)) {
    fs.mkdirSync(ESQUEJE_DIR, { recursive: true });
  }

  const defaultConfig = buildDefaultConfig(economics);

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<EsquejeConfig>;
      const merged: EsquejeConfig = {
        ...defaultConfig,
        ...parsed,
        thresholds: {
          ...defaultConfig.thresholds,
          ...(parsed.thresholds ?? {}),
        },
        version: RUNTIME_VERSION,
      };

      const thresholds = parsed.thresholds;
      const usingLegacyThresholds =
        thresholds?.healthy === 50 &&
        thresholds?.lowCompute === 20 &&
        thresholds?.critical === 5;

      if (!thresholds || usingLegacyThresholds) {
        merged.thresholds = defaultConfig.thresholds;
      }

      if (JSON.stringify(merged) !== JSON.stringify(parsed)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
        logger.info('Config migrated to current defaults', { path: CONFIG_PATH });
      }

      return merged;
    } catch (err) {
      logger.warn('Failed to parse config, using defaults', { error: String(err) });
    }
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  logger.info('Created default config', { path: CONFIG_PATH });
  return defaultConfig;
}

function saveConfig(config: EsquejeConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Sleep utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepUntilOrWakeEvent(
  sleepUntilIso: string,
  db: EsquejeDatabase,
): Promise<void> {
  const targetMs = new Date(sleepUntilIso).getTime();
  const checkIntervalMs = 5_000; // Poll every 5s for wake events

  logger.info('Agent sleeping', {
    sleepUntil: sleepUntilIso,
    durationMs: Math.max(0, targetMs - Date.now()),
  });

  while (Date.now() < targetMs) {
    await sleep(checkIntervalMs);

    // Check for wake events (heartbeat daemon may insert them)
    const event = db.consumeNextWakeEvent();
    if (event) {
      logger.info('Wake event received during sleep', {
        source: event.source,
        reason: event.reason,
      });
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(chalk.cyan('\n[Esqueje] Starting up...\n'));
  logger.info('Esqueje agent starting', { version: RUNTIME_VERSION });

  const configManager = new ConfigManager();
  const economics = new EconomicsEngine(configManager.getTreasuryPolicy());
  const capitalPlan = economics.describeCapitalPlan();
  logger.info('Treasury policy loaded', { ...capitalPlan });

  // 1. Load config
  const config = loadOrCreateConfig(economics);
  logger.info('Config loaded', { name: config.name, network: config.network });

  // 2. Initialize SQLite DB (clean orphaned WAL files first to avoid disk I/O errors)
  for (const suffix of ['-shm', '-wal']) {
    const orphan = config.dbPath + suffix;
    if (fs.existsSync(orphan) && !fs.existsSync(config.dbPath)) {
      fs.unlinkSync(orphan);
      logger.debug('Removed orphaned WAL file', { path: orphan });
    }
  }
  const db = new EsquejeDatabase(config.dbPath);
  logger.info('Database initialized', { path: config.dbPath });

  // 3. Initialize wallet (with DB address callback to avoid circular deps)
  const wallet = new WalletManager((address: string) => {
    db.setIdentity('address', address);
    db.setKV('wallet_address', address);
    config.walletAddress = address;
    saveConfig(config);
    logger.info('Wallet address stored in DB', { address });
  });

  await wallet.initialize();

  // 4. Build identity
  const storedCreatedAt = db.getIdentity('created_at');
  const createdAt = storedCreatedAt ?? new Date().toISOString();
  if (!storedCreatedAt) {
    db.setIdentity('created_at', createdAt);
  }

  const identity: EsquejeIdentity = {
    name: config.name,
    address: wallet.getAddress(),
    creatorAddress: config.creatorAddress ?? '',
    createdAt,
  };

  logger.info('Identity built', { name: identity.name, address: identity.address });

  // 5. Load or create SOUL.md
  let soul = loadCurrentSoul(db, SOUL_PATH);
  if (!soul) {
    logger.info('No soul found — creating default soul');

    let constitutionHash = '';
    if (fs.existsSync(CONSTITUTION_PATH)) {
      const constitutionContent = fs.readFileSync(CONSTITUTION_PATH, 'utf-8');
      constitutionHash = createHash(constitutionContent);
    }

    soul = createDefaultSoul(
      config.genesisPrompt,
      identity.name,
      identity.address,
      identity.creatorAddress,
      constitutionHash,
      config.generation,
    );
    saveSoul(soul, SOUL_PATH);
    logger.info('Default soul created and saved');
  } else {
    logger.info('Soul loaded', {
      name: soul.name,
      version: soul.version,
      genesisAlignment: soul.genesisAlignment,
    });
  }

  // 6. Register default heartbeat task schedules
  const existingEntries = db.getHeartbeatEntries();
  const existingNames = new Set(existingEntries.map((e) => e.taskName));

  for (const schedule of DEFAULT_TASK_SCHEDULES) {
    if (!existingNames.has(schedule.taskName)) {
      db.upsertHeartbeatEntry({
        taskName: schedule.taskName,
        intervalMs: schedule.intervalMs,
        enabled: schedule.enabled,
        priority: schedule.priority,
        tierMinimum: schedule.tierMinimum,
        runCount: 0,
        failCount: 0,
      });
      logger.debug('Registered default task', { taskName: schedule.taskName });
    }
  }

  // 7. Build heartbeat context and tasks
  const heartbeatContext = { db, config, identity };
  const builtinTasks = buildBuiltinTasks();

  // 8. Create heartbeat daemon
  const daemon = createHeartbeatDaemon({
    db,
    tasks: builtinTasks,
    context: heartbeatContext,
    tickIntervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS ?? '60000', 10),
    onWakeRequest: (source, reason) => {
      logger.info('Wake request from daemon', { source, reason });
    },
  });

  // 9. Initialize core components
  const pyth = new PythClient();
  await pyth.initialize();

  const trading = new TradingEngine();
  const policyEngine = new PolicyEngine(db, economics);

  // Seed initial balance so heartbeat's first tick sees a real value
  const initialBalance = await wallet.getBalance();
  db.setKV('ada_balance', initialBalance.toString());
  logger.info('Initial balance seeded', { adaBalance: initialBalance });

  // 10. Start heartbeat daemon
  daemon.start();
  logger.info('Heartbeat daemon started');

  // 11. Graceful shutdown handlers
  let shutdownRequested = false;

  const shutdown = async (signal: string) => {
    if (shutdownRequested) return;
    shutdownRequested = true;
    logger.info('Shutdown signal received', { signal });
    console.log(chalk.yellow(`\nReceived ${signal}. Shutting down gracefully...`));

    daemon.stop();
    db.setAgentState('sleeping');
    db.close();

    logger.info('Esqueje shutdown complete');
    console.log(chalk.yellow('Goodbye.'));
    process.exit(0);
  };

  process.on('SIGINT',  () => { shutdown('SIGINT').catch(() => process.exit(1)); });
  process.on('SIGTERM', () => { shutdown('SIGTERM').catch(() => process.exit(1)); });

  // 12. Main while(true) loop
  logger.info('Entering main agent loop');
  console.log(chalk.green(`\n[${config.name}] Agent running on ${config.network}`));
  console.log(chalk.cyan(`Wallet: ${identity.address}`));
  console.log(
    chalk.cyan(
      `Minimum viable balance: ${capitalPlan.minimumOperationalBalanceAda} ADA · replication seed: ${capitalPlan.replicationSeedAda} ADA\n`
    )
  );

  while (!shutdownRequested) {
    try {
      // Run one agent turn
      await runAgentLoop({
        identity,
        config,
        db,
        wallet,
        pyth,
        trading,
        policyEngine,
        economics,
        onStateChange: (state: AgentState) => {
          logger.debug('Agent state changed', { state });
        },
        onTurnComplete: (turn) => {
          logger.info('Turn complete', { id: turn.id, summary: turn.summary });
        },
      });

      // Check resulting state
      const agentState = db.getAgentState();

      if (agentState === 'dead') {
        logger.error('Agent reached dead state — waiting 5 minutes before retry');
        console.log(chalk.red('[DEAD] Agent has insufficient ADA. Waiting 5 minutes...'));
        await sleep(5 * 60 * 1000);
        continue;
      }

      if (agentState === 'sleeping') {
        const sleepUntilStr = db.getKV('sleep_until');
        if (sleepUntilStr) {
          await sleepUntilOrWakeEvent(sleepUntilStr, db);
        } else {
          await sleep(5 * 60 * 1000);
        }
        continue;
      }

      // running state — fall through to next iteration immediately
    } catch (err) {
      logger.error('Unhandled error in main loop', { error: String(err) });
      console.error(chalk.red('Fatal error in main loop:'), err);
      await sleep(30_000);
    }
  }
}

main().catch((err) => {
  console.error(chalk.red('Fatal startup error:'), err);
  process.exit(1);
});
