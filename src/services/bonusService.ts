import { BonusClaim } from '../types';
import {
  LocalStorageBonusRepository,
  LocalStorageUserRepository,
} from './repositories/localStorage';
import { walletService } from './walletService';
import { settingsService } from './settingsService';
import { notificationService } from './notificationService';
import { auditService } from './auditService';
import { generateId } from '../utils';

const bonusRepo = new LocalStorageBonusRepository();
const userRepo = new LocalStorageUserRepository();

export class BonusService {
  async getClaims(userId?: string): Promise<BonusClaim[]> {
    return bonusRepo.getClaims(userId);
  }

  async getDailyBonusStatus(userId: string): Promise<{
    eligible: boolean;
    currentStreak: number;
    nextAmount: number;
    message: string;
    lastClaimDate?: string;
  }> {
    const user = await userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    const settings = await settingsService.getSettings();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const lastClaim = user.lastBonusDay;
    if (lastClaim === today) {
      return {
        eligible: false,
        currentStreak: user.streak || 1,
        nextAmount: Math.min(
          settings.dailyBonusBase + (user.streak || 1) * settings.streakBonus,
          settings.streakBonusMax
        ),
        message: 'Daily bonus already claimed for today. Come back tomorrow to continue your streak!',
        lastClaimDate: lastClaim,
      };
    }

    const calculatedStreak = lastClaim === yesterday ? (user.streak || 0) + 1 : 1;
    const amount = Math.min(
      settings.dailyBonusBase + calculatedStreak * settings.streakBonus,
      settings.streakBonusMax
    );

    return {
      eligible: true,
      currentStreak: calculatedStreak,
      nextAmount: amount,
      message: `Claim Day ${calculatedStreak} Streak Bonus (+${amount} coins)!`,
      lastClaimDate: lastClaim,
    };
  }

  async claimDailyBonus(userId: string): Promise<{ amount: number; streak: number; message: string }> {
    const status = await this.getDailyBonusStatus(userId);
    if (!status.eligible) {
      throw new Error(status.message);
    }

    const user = await userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date().toISOString().split('T')[0];
    const amount = status.nextAmount;
    const newStreak = status.currentStreak;

    // Update user record
    await userRepo.update(userId, {
      streak: newStreak,
      lastBonusDay: today,
    });

    // Credit Wallet
    await walletService.credit(
      userId,
      amount,
      'daily_bonus',
      `Collected Day ${newStreak} Daily Streak Bonus (+${amount} coins)`,
      'bonus'
    );

    // Save claim record
    const claimRecord: BonusClaim = {
      id: generateId('bns'),
      userId,
      bonusType: 'daily',
      amount,
      streakDay: newStreak,
      claimedAt: new Date().toISOString(),
      description: `Day ${newStreak} Streak Bonus`,
    };
    await bonusRepo.recordClaim(claimRecord);

    await notificationService.send({
      userId,
      title: '🔥 Daily Bonus Claimed!',
      message: `You earned ${amount} Buzz Coins! Current streak: ${newStreak} days.`,
      type: 'bonus',
      actionUrl: '/player/wallet',
    });

    await auditService.log({
      actorId: userId,
      actorName: user.fullName || user.username,
      actorRole: 'PLAYER',
      action: 'DAILY_BONUS_CLAIM',
      target: userId,
      description: `Claimed daily bonus of ${amount} coins for Day ${newStreak} streak.`,
    });

    return {
      amount,
      streak: newStreak,
      message: `Awesome! You received ${amount} Buzz Coins. Current streak: ${newStreak} days.`,
    };
  }

  async getRefillStatus(userId: string): Promise<{
    eligible: boolean;
    currentBalance: number;
    refillFloor: number;
    refillAmount: number;
    usedToday: number;
    dailyCap: number;
    message: string;
  }> {
    const user = await userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    const settings = await settingsService.getSettings();
    const balance = await walletService.getBalance(userId);
    const today = new Date().toISOString().split('T')[0];

    const usedToday = user.lastRefillDay === today ? (user.refillUsedToday || 0) : 0;

    if (usedToday >= settings.refillDailyCap) {
      return {
        eligible: false,
        currentBalance: balance,
        refillFloor: settings.refillFloor,
        refillAmount: settings.refillAmount,
        usedToday,
        dailyCap: settings.refillDailyCap,
        message: `You have reached your daily pocket money refill limit (${settings.refillDailyCap}/${settings.refillDailyCap} used today).`,
      };
    }

    if (balance >= settings.refillFloor) {
      return {
        eligible: false,
        currentBalance: balance,
        refillFloor: settings.refillFloor,
        refillAmount: settings.refillAmount,
        usedToday,
        dailyCap: settings.refillDailyCap,
        message: `Pocket refill is only available when your balance falls below ${settings.refillFloor} coins.`,
      };
    }

    return {
      eligible: true,
      currentBalance: balance,
      refillFloor: settings.refillFloor,
      refillAmount: settings.refillAmount,
      usedToday,
      dailyCap: settings.refillDailyCap,
      message: `Emergency refill available: Claim +${settings.refillAmount} coins! (${settings.refillDailyCap - usedToday} left today)`,
    };
  }

  async claimRefill(userId: string): Promise<{ amount: number; message: string }> {
    const status = await this.getRefillStatus(userId);
    if (!status.eligible) {
      throw new Error(status.message);
    }

    const user = await userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    const settings = await settingsService.getSettings();
    const today = new Date().toISOString().split('T')[0];
    const newCount = status.usedToday + 1;

    await userRepo.update(userId, {
      refillUsedToday: newCount,
      lastRefillDay: today,
    });

    await walletService.credit(
      userId,
      settings.refillAmount,
      'refill',
      `Pocket money refill (+${settings.refillAmount} coins)`,
      'bonus'
    );

    const claimRecord: BonusClaim = {
      id: generateId('bns_ref'),
      userId,
      bonusType: 'refill',
      amount: settings.refillAmount,
      claimedAt: new Date().toISOString(),
      description: `Pocket money emergency refill (${newCount}/${settings.refillDailyCap})`,
    };
    await bonusRepo.recordClaim(claimRecord);

    await notificationService.send({
      userId,
      title: '🪙 Pocket Money Refilled',
      message: `You received +${settings.refillAmount} coins to keep playing! (${newCount}/${settings.refillDailyCap} used today)`,
      type: 'bonus',
      actionUrl: '/player/wallet',
    });

    return {
      amount: settings.refillAmount,
      message: `Successfully refilled +${settings.refillAmount} coins!`,
    };
  }
}

export const bonusService = new BonusService();
