import type { EsquejeDatabase } from '../state/database.js';
import type { WalletManager } from '../wallet.js';
import type { EconomicsEngine } from '../economics.js';
import type { TelegramInterface } from '../telegram/interface.js';
import type { EsquejeIdentity, EsquejeConfig } from '../types.js';

export interface ReplicationConfig {
  enabled: boolean;
  minParentBalanceAda: number;
  childSeedAda: number;
  requireHumanApproval: boolean;
  maxGenerations: number;
  cooldownHours: number;
}

export class ReplicationEngine {
  private db: EsquejeDatabase;
  private wallet: WalletManager;
  private economics: EconomicsEngine;
  private telegram?: TelegramInterface;
  private identity: EsquejeIdentity;
  private config: EsquejeConfig;
  private replicationConfig: ReplicationConfig;

  constructor(
    db: EsquejeDatabase,
    wallet: WalletManager,
    economics: EconomicsEngine,
    identity: EsquejeIdentity,
    config: EsquejeConfig,
    replicationConfig: ReplicationConfig,
    telegram?: TelegramInterface
  ) {
    this.db = db;
    this.wallet = wallet;
    this.economics = economics;
    this.identity = identity;
    this.config = config;
    this.replicationConfig = replicationConfig;
    this.telegram = telegram;
  }

  async shouldReplicate(): Promise<{ should: boolean; reason: string }> {
    if (!this.replicationConfig.enabled) {
      return { should: false, reason: 'Replication disabled' };
    }

    if (this.config.generation >= this.replicationConfig.maxGenerations) {
      return { should: false, reason: `Max generations reached` };
    }

    const lastReplication = this.db.getKV('last_replication_time');
    if (lastReplication) {
      const hoursSince = (Date.now() - new Date(lastReplication).getTime()) / (1000 * 60 * 60);
      if (hoursSince < this.replicationConfig.cooldownHours) {
        return { should: false, reason: `Cooldown: ${Math.floor(this.replicationConfig.cooldownHours - hoursSince)}h left` };
      }
    }

    const balance = await this.wallet.getBalance();
    const minRequired = this.replicationConfig.minParentBalanceAda + this.replicationConfig.childSeedAda;

    if (balance < minRequired) {
      return { should: false, reason: `Need ${minRequired} ADA, have ${balance.toFixed(2)}` };
    }

    return { should: true, reason: 'Ready to replicate' };
  }

  async replicate(): Promise<{ success: boolean; childAddress?: string; error?: string }> {
    const check = await this.shouldReplicate();
    if (!check.should) {
      return { success: false, error: check.reason };
    }

    await this.notify('🌱 *Starting Replication*');

    try {
      // Generate child wallet
      const childAddress = await this.wallet.deriveChildAddress(this.getChildCount() + 1);
      
      // Transfer funds
      const txHash = await this.wallet.sendAda(childAddress, this.replicationConfig.childSeedAda);
      
      // Record
      this.db.setKV('last_replication_time', new Date().toISOString());
      this.db.setKV(`child_${this.getChildCount() + 1}_address`, childAddress);
      
      await this.notify(`✅ *Replication Complete*\n\nChild: \`${childAddress}\`\nTx: \`${txHash}\``);
      
      return { success: true, childAddress };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.notify(`❌ *Replication Failed*\n\n${msg}`);
      return { success: false, error: msg };
    }
  }

  private getChildCount(): number {
    let count = 0;
    while (this.db.getKV(`child_${count + 1}_address`)) count++;
    return count;
  }

  private async notify(msg: string): Promise<void> {
    if (this.telegram) await this.telegram.sendAlert(msg);
  }
}
