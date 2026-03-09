import TelegramBot from 'node-telegram-bot-api';
import { EsquejeDatabase } from '../state/database.js';
import { WalletManager } from '../wallet.js';
import { EconomicsEngine } from '../economics.js';
import type { EsquejeIdentity, EsquejeConfig } from '../types.js';

export interface TelegramConfig {
  botToken: string;
  allowedChatIds: string[];
}

export class TelegramInterface {
  private bot: TelegramBot;
  private db: EsquejeDatabase;
  private wallet: WalletManager;
  private economics: EconomicsEngine;
  private identity: EsquejeIdentity;
  private config: EsquejeConfig;
  private isRunning: boolean = false;

  constructor(
    config: TelegramConfig,
    db: EsquejeDatabase,
    wallet: WalletManager,
    economics: EconomicsEngine,
    identity: EsquejeIdentity,
    esquejeConfig: EsquejeConfig
  ) {
    this.bot = new TelegramBot(config.botToken, { polling: true });
    this.db = db;
    this.wallet = wallet;
    this.economics = economics;
    this.identity = identity;
    this.config = esquejeConfig;
    
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id.toString();
      
      this.bot.sendMessage(
        msg.chat.id,
        `🌱 *Esqueje Agent*\n\n` +
        `Name: ${this.identity.name}\n` +
        `Address: \`${this.identity.address}\`\n` +
        `Network: ${this.config.network}\n\n` +
        `Available commands:\n` +
        `/status - Check agent status\n` +
        `/balance - Check ADA balance\n` +
        `/trades - View recent trades\n` +
        `/economics - Economic health\n` +
        `/replicate - Attempt replication\n` +
        `/sleep - Put agent to sleep\n` +
        `/wake - Wake agent up\n` +
        `/help - Show all commands`,
        { parse_mode: 'Markdown' }
      );
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const state = this.db.getAgentState();
      const balance = await this.wallet.getBalance();
      const runway = this.economics.calculateRunway(balance);
      
      this.bot.sendMessage(
        msg.chat.id,
        `📊 *Agent Status*\n\n` +
        `State: ${state.toUpperCase()}\n` +
        `Balance: ${balance.toFixed(2)} ADA\n` +
        `Runway: ${runway.days.toFixed(0)} days\n` +
        `Generation: ${this.config.generation}\n` +
        `Version: ${this.config.version}`,
        { parse_mode: 'Markdown' }
      );
    });

    // Balance command
    this.bot.onText(/\/balance/, async (msg) => {
      const balance = await this.wallet.getBalance();
      const plan = this.economics.describeCapitalPlan();
      
      this.bot.sendMessage(
        msg.chat.id,
        `💰 *Balance*\n\n` +
        `Current: ${balance.toFixed(2)} ADA\n` +
        `Minimum viable: ${plan.minimumOperationalBalanceAda} ADA\n` +
        `Replication seed: ${plan.replicationSeedAda} ADA\n` +
        `Status: ${balance >= plan.minimumOperationalBalanceAda ? '✅ Healthy' : '⚠️ Low'}`,
        { parse_mode: 'Markdown' }
      );
    });

    // Trades command
    this.bot.onText(/\/trades/, (msg) => {
      const trades = this.db.getRecentTrades(5);
      
      if (trades.length === 0) {
        this.bot.sendMessage(msg.chat.id, '📈 No trades yet.');
        return;
      }
      
      const tradeList = trades.map((t, i) => 
        `${i + 1}. ${t.action.toUpperCase()} - ${t.profit >= 0 ? '+' : ''}${t.profit.toFixed(4)} ADA`
      ).join('\n');
      
      this.bot.sendMessage(
        msg.chat.id,
        `📈 *Recent Trades*\n\n${tradeList}`,
        { parse_mode: 'Markdown' }
      );
    });

    // Economics command
    this.bot.onText(/\/economics/, (msg) => {
      const plan = this.economics.describeCapitalPlan();
      
      this.bot.sendMessage(
        msg.chat.id,
        `📊 *Economic Health*\n\n` +
        `Monthly hosting: ${plan.monthlyHostingAda} ADA\n` +
        `Monthly operations: ${plan.monthlyOperationsAda} ADA\n` +
        `Target profit: ${plan.targetMonthlyProfitAda} ADA\n` +
        `Runway target: ${plan.runwayDays} days\n\n` +
        `*Thresholds:*\n` +
        `Minimum balance: ${plan.minimumOperationalBalanceAda} ADA\n` +
        `Replication seed: ${plan.replicationSeedAda} ADA`,
        { parse_mode: 'Markdown' }
      );
    });

    // Sleep command
    this.bot.onText(/\/sleep/, (msg) => {
      this.db.setAgentState('sleeping');
      this.db.setKV('sleep_until', new Date(Date.now() + 3600000).toISOString());
      this.bot.sendMessage(msg.chat.id, '💤 Agent put to sleep for 1 hour.');
    });

    // Wake command
    this.bot.onText(/\/wake/, (msg) => {
      this.db.setAgentState('running');
      this.db.deleteKV('sleep_until');
      this.bot.sendMessage(msg.chat.id, '☀️ Agent woken up.');
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      this.bot.sendMessage(
        msg.chat.id,
        `🌱 *Esqueje Commands*\n\n` +
        `*Info:*\n` +
        `/start - Welcome message\n` +
        `/status - Agent status\n` +
        `/balance - ADA balance\n` +
        `/economics - Economic health\n\n` +
        `*Operations:*\n` +
        `/trades - Recent trades\n` +
        `/replicate - Check replication readiness\n\n` +
        `*Control:*\n` +
        `/sleep - Sleep for 1 hour\n` +
        `/wake - Wake up\n` +
        `/help - This message`,
        { parse_mode: 'Markdown' }
      );
    });

    // Handle replication request
    this.bot.onText(/\/replicate/, async (msg) => {
      const balance = await this.wallet.getBalance();
      const plan = this.economics.describeCapitalPlan();
      
      if (balance < plan.minimumOperationalBalanceAda + plan.replicationSeedAda) {
        this.bot.sendMessage(
          msg.chat.id,
          `❌ Cannot replicate.\n\n` +
          `Balance: ${balance.toFixed(2)} ADA\n` +
          `Required: ${plan.minimumOperationalBalanceAda + plan.replicationSeedAda} ADA\n\n` +
          `Need ${(plan.minimumOperationalBalanceAda + plan.replicationSeedAda - balance).toFixed(2)} more ADA.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      this.bot.sendMessage(
        msg.chat.id,
        `✅ Replication possible!\n\n` +
        `Balance: ${balance.toFixed(2)} ADA\n` +
        `Parent keeps: ${plan.minimumOperationalBalanceAda} ADA\n` +
        `Child receives: ${plan.replicationSeedAda} ADA\n\n` +
        `Use /confirmreplicate to proceed (not yet implemented).`,
        { parse_mode: 'Markdown' }
      );
    });

    // Handle text messages
    this.bot.on('message', (msg) => {
      if (msg.text?.startsWith('/')) return; // Ignore commands
      
      this.bot.sendMessage(
        msg.chat.id,
        `🌱 I received: "${msg.text}"\n\n` +
        `I'm an autonomous agent. Use /help to see what I can do.\n\n` +
        `For natural language conversations, I'm still learning!`,
        { parse_mode: 'Markdown' }
      );
    });
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('📱 Telegram interface started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.bot.stopPolling();
    this.isRunning = false;
    console.log('📱 Telegram interface stopped');
  }

  // Send alert to all configured chats
  async sendAlert(message: string): Promise<void> {
    const chatIds = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];
    
    for (const chatId of chatIds) {
      try {
        await this.bot.sendMessage(chatId.trim(), message, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error(`Failed to send alert to ${chatId}:`, err);
      }
    }
  }
}
