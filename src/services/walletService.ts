import {
  Wallet,
  WalletTransaction,
  WalletTransactionReason,
} from '../types';
import { LocalStorageWalletRepository } from './repositories/localStorage';
import { generateId } from '../utils';
import { auditService } from './auditService';

const walletRepo = new LocalStorageWalletRepository();

export class WalletService {
  async getWallet(userId: string): Promise<Wallet> {
    const w = await walletRepo.getWallet(userId);
    if (!w) {
      const newWallet: Wallet = {
        userId,
        balance: 1500,
        totalWon: 0,
        totalSpent: 0,
        totalClaimedBonuses: 0,
        updatedAt: new Date().toISOString(),
      };
      return walletRepo.saveWallet(newWallet);
    }
    return w;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }

  async getTransactions(userId?: string): Promise<WalletTransaction[]> {
    return walletRepo.getTransactions(userId);
  }

  async credit(
    userId: string,
    amount: number,
    reason: WalletTransactionReason,
    description: string,
    referenceType?: 'ticket' | 'draw' | 'bonus' | 'reward_box' | 'admin',
    referenceId?: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) throw new Error('Credit amount must be greater than zero.');
    const wallet = await this.getWallet(userId);
    wallet.balance += amount;
    if (reason === 'prize_payout') {
      wallet.totalWon += amount;
    } else if (reason === 'daily_bonus' || reason === 'refill' || reason === 'promotional_bonus' || reason === 'surprise_box') {
      wallet.totalClaimedBonuses += amount;
    }
    wallet.updatedAt = new Date().toISOString();

    const tx: WalletTransaction = {
      id: generateId('tx'),
      userId,
      amount,
      type: 'CREDIT',
      balanceAfter: wallet.balance,
      reason,
      referenceType,
      referenceId,
      description,
      createdAt: new Date().toISOString(),
    };

    await walletRepo.saveWallet(wallet);
    await walletRepo.addTransaction(tx);

    return { wallet, transaction: tx };
  }

  async debit(
    userId: string,
    amount: number,
    reason: WalletTransactionReason,
    description: string,
    referenceType?: 'ticket' | 'draw' | 'bonus' | 'reward_box' | 'admin',
    referenceId?: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) throw new Error('Debit amount must be greater than zero.');
    const wallet = await this.getWallet(userId);
    if (wallet.balance < amount) {
      throw new Error(`Insufficient virtual coin balance (Current: ${wallet.balance}, Required: ${amount})`);
    }

    wallet.balance -= amount;
    if (reason === 'ticket_purchase') {
      wallet.totalSpent += amount;
    }
    wallet.updatedAt = new Date().toISOString();

    const tx: WalletTransaction = {
      id: generateId('tx'),
      userId,
      amount: -amount,
      type: 'DEBIT',
      balanceAfter: wallet.balance,
      reason,
      referenceType,
      referenceId,
      description,
      createdAt: new Date().toISOString(),
    };

    await walletRepo.saveWallet(wallet);
    await walletRepo.addTransaction(tx);

    return { wallet, transaction: tx };
  }

  async adjust(
    adminUserId: string,
    adminName: string,
    targetUserId: string,
    amount: number,
    description: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    const wallet = await this.getWallet(targetUserId);
    const newBalance = wallet.balance + amount;
    if (newBalance < 0) {
      throw new Error('Adjustment cannot result in negative coin balance.');
    }

    wallet.balance = newBalance;
    wallet.updatedAt = new Date().toISOString();

    const tx: WalletTransaction = {
      id: generateId('tx_adj'),
      userId: targetUserId,
      amount,
      type: amount >= 0 ? 'CREDIT' : 'DEBIT',
      balanceAfter: wallet.balance,
      reason: 'admin_adjustment',
      referenceType: 'admin',
      referenceId: adminUserId,
      description: `Admin adjustment by ${adminName}: ${description}`,
      createdAt: new Date().toISOString(),
    };

    await walletRepo.saveWallet(wallet);
    await walletRepo.addTransaction(tx);

    await auditService.log({
      actorId: adminUserId,
      actorName: adminName,
      actorRole: 'SUPERADMIN',
      action: 'WALLET_ADJUST',
      target: targetUserId,
      description: `Adjusted user wallet by ${amount > 0 ? '+' : ''}${amount} coins. Reason: ${description}`,
    });

    return { wallet, transaction: tx };
  }
}

export const walletService = new WalletService();
