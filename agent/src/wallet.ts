// Wallet manager for Esqueje Agent
// Loads mnemonic from ESQUEJE_MNEMONIC env, uses Blockfrost if BLOCKFROST_KEY is set

import axios from 'axios';
import { createLogger } from './observability/logger.js';

const logger = createLogger('wallet');

export type OnAddressStored = (address: string) => void;

export class WalletManager {
  private address: string = '';
  private mnemonic: string | null = null;
  private onAddressStored?: OnAddressStored;
  private mockBalanceAda = 100;
  private lastHostingPaidAt: Date | null = null;

  constructor(onAddressStored?: OnAddressStored) {
    this.onAddressStored = onAddressStored;
  }

  async initialize(): Promise<void> {
    // Load mnemonic from env
    const envMnemonic = process.env.ESQUEJE_MNEMONIC;

    if (envMnemonic && envMnemonic.trim().length > 0) {
      this.mnemonic = envMnemonic.trim();
      logger.info('Mnemonic loaded from ESQUEJE_MNEMONIC env var');

      // Derive address from mnemonic using MeshSDK if available
      try {
        const { AppWallet } = await import('@meshsdk/core');
        const wallet = new AppWallet({
          networkId: this.resolveNetworkId(),
          fetcher: undefined as never,
          submitter: undefined as never,
          key: {
            type: 'mnemonic',
            words: this.mnemonic.split(' '),
          },
        });
        this.address = wallet.getPaymentAddress();
        logger.info('Address derived from mnemonic', { address: this.address });
      } catch (err) {
        logger.warn('Could not derive address via MeshSDK, using deterministic mock', {
          error: String(err),
        });
        this.address = this.deterministicAddress(this.mnemonic);
      }
    } else {
      logger.warn('No ESQUEJE_MNEMONIC found — generating ephemeral mock wallet');
      this.mnemonic = null;
      this.address = `addr_test1q${this.randomHex(50)}`;
    }

    // Notify caller so they can persist address in DB
    if (this.onAddressStored) {
      this.onAddressStored(this.address);
    }

    logger.info('Wallet initialized', { address: this.address });
  }

  getAddress(): string {
    return this.address;
  }

  getMnemonic(): string | null {
    return this.mnemonic;
  }

  async getBalance(): Promise<number> {
    const blockfrostKey = process.env.BLOCKFROST_KEY ?? process.env.BLOCKFROST_API_KEY;

    if (blockfrostKey && this.address) {
      try {
        return await this.fetchBalanceFromBlockfrost(this.address, blockfrostKey);
      } catch (err) {
        logger.warn('Blockfrost balance fetch failed, using mock', { error: String(err) });
      }
    }

    return this.mockBalanceAda;
  }

  async applyProfitLoss(deltaAda: number): Promise<number> {
    this.mockBalanceAda = Math.max(0, this.mockBalanceAda + deltaAda);
    return this.mockBalanceAda;
  }

  async payExpense(amountAda: number, reason: string): Promise<boolean> {
    if (amountAda <= 0 || this.mockBalanceAda < amountAda) {
      return false;
    }

    this.mockBalanceAda -= amountAda;
    if (reason.includes('hosting')) {
      this.lastHostingPaidAt = new Date();
    }

    logger.info('Expense paid', { amountAda, reason, balanceAda: this.mockBalanceAda });
    return true;
  }

  getLastHostingPaidAt(): Date | null {
    return this.lastHostingPaidAt;
  }

  private async fetchBalanceFromBlockfrost(
    address: string,
    apiKey: string,
  ): Promise<number> {
    const network = process.env.CARDANO_NETWORK ?? 'preprod';
    const baseUrl =
      network === 'mainnet'
        ? 'https://cardano-mainnet.blockfrost.io/api/v0'
        : network === 'preview'
        ? 'https://cardano-preview.blockfrost.io/api/v0'
        : 'https://cardano-preprod.blockfrost.io/api/v0';

    const response = await axios.get<{
      amount: Array<{ unit: string; quantity: string }>;
    }>(`${baseUrl}/addresses/${address}`, {
      headers: { project_id: apiKey },
      timeout: 10_000,
    });

    const lovelaceEntry = response.data.amount.find((a) => a.unit === 'lovelace');
    if (!lovelaceEntry) return 0;

    return parseInt(lovelaceEntry.quantity, 10) / 1_000_000;
  }

  private deterministicAddress(mnemonic: string): string {
    // Simple deterministic address for when MeshSDK is unavailable
    let hash = 0;
    for (let i = 0; i < mnemonic.length; i++) {
      hash = ((hash << 5) - hash + mnemonic.charCodeAt(i)) | 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `addr_test1q${hex}${'0'.repeat(50 - hex.length)}`;
  }

  private resolveNetworkId(): number {
    const network = process.env.CARDANO_NETWORK ?? 'preprod';
    return network === 'mainnet' ? 1 : 0;
  }

  private randomHex(len: number): string {
    return Array.from({ length: len }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  }
}
