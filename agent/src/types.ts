// Shared types for Esqueje Agent

export type SurvivalTier = 'healthy' | 'low_compute' | 'critical' | 'dead';
export type AgentState = 'running' | 'sleeping' | 'dead';

export interface FinancialState {
  adaBalance: number;
  lovelaceBalance: bigint;
  dailyBurnRate: number; // ADA per day estimated
  daysRemaining: number;
  lastChecked: string; // ISO
}

export interface EsquejeConfig {
  name: string;
  walletAddress: string;
  creatorAddress?: string;
  genesisPrompt: string;
  network: 'mainnet' | 'preprod' | 'preview';
  dbPath: string;
  thresholds: {
    healthy: number;    // ADA
    lowCompute: number; // ADA
    critical: number;   // ADA
  };
  generation: number;
  version: string;
}

export interface EsquejeIdentity {
  name: string;
  address: string;
  creatorAddress: string;
  mnemonic?: string; // encrypted or in-memory only
  createdAt: string;
}

export interface SoulModel {
  format: 'soul/v1';
  version: number;
  updatedAt: string;
  name: string;
  address: string;
  creator: string;
  bornAt: string;
  constitutionHash: string;
  genesisAlignment: number;
  lastReflected: string;
  corePurpose: string;
  values: string[];
  behavioralGuidelines: string[];
  personality: string;
  strategy: string;
  financialCharacter: string;
  generation: number;
  rawContent: string;
  contentHash: string;
}

export interface HeartbeatEntry {
  taskName: string;
  cronExpression?: string;
  intervalMs?: number;
  enabled: boolean;
  priority: number;
  tierMinimum: SurvivalTier;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount: number;
  failCount: number;
}

export interface WakeEvent {
  id: number;
  source: string;
  reason: string;
  createdAt: string;
}

export interface FundingAttempt {
  strategy: string;
  timestamp: string;
  success: boolean;
  details: string;
}

export interface PolicyRule {
  name: string;
  check: (context: PolicyContext) => PolicyResult;
}

export interface PolicyContext {
  action: string;
  amount?: number;
  adaBalance?: number;
  tier?: SurvivalTier;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

export interface TradeSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  expectedEdgePct?: number;
  suggestedCapitalAda?: number;
}

export interface TradeResult {
  success: boolean;
  profit: number;
  txHash?: string;
}
