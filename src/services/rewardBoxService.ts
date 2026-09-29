import { RewardBox, RewardBoxConfig } from '../types';
import { LocalStorageRewardBoxRepository } from './repositories/localStorage';
import { walletService } from './walletService';
import { notificationService } from './notificationService';
import { auditService } from './auditService';
import { generateId } from '../utils';

const boxRepo = new LocalStorageRewardBoxRepository();

export class RewardBoxService {
  async getBoxes(userId?: string): Promise<RewardBox[]> {
    return boxRepo.getBoxes(userId);
  }

  async getConfigs(): Promise<RewardBoxConfig[]> {
    return boxRepo.getBoxConfigs();
  }

  async getOdds(): Promise<{ coins: number; weight: number; label: string; chance: string; badge?: string }[]> {
    const configs = await this.getConfigs();
    const totalWeight = configs.reduce((sum, c) => sum + c.weight, 0);
    return configs.map((c) => ({
      coins: c.coins,
      weight: c.weight,
      label: c.label,
      badge: c.badge,
      chance: `${((c.weight / totalWeight) * 100).toFixed(1)}%`,
    }));
  }

  async ensureEligibility(userId: string, drawId: string, drawName: string): Promise<RewardBox> {
    const boxes = await boxRepo.getBoxes(userId);
    const existing = boxes.find((b) => b.drawId === drawId);
    if (existing) return existing;

    const newBox: RewardBox = {
      id: generateId('box'),
      userId,
      drawId,
      drawName,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };

    return boxRepo.createBox(newBox);
  }

  async openBox(boxId: string, userId: string): Promise<{ box: RewardBox; rewardCoins: number; label: string }> {
    const boxes = await boxRepo.getBoxes(userId);
    const box = boxes.find((b) => b.id === boxId);
    if (!box) throw new Error('Surprise box not found.');
    if (box.status !== 'AVAILABLE') {
      throw new Error(`This box has already been ${box.status.toLowerCase()}.`);
    }

    const configs = await this.getConfigs();
    const totalWeight = configs.reduce((sum, c) => sum + c.weight, 0);
    const randomVal = Math.floor(Math.random() * totalWeight);

    let cumulative = 0;
    let selectedReward = configs[configs.length - 1];

    for (const reward of configs) {
      cumulative += reward.weight;
      if (randomVal < cumulative) {
        selectedReward = reward;
        break;
      }
    }

    const rewardCoins = selectedReward.coins;
    const label = selectedReward.label;

    // Update box
    const updated = await boxRepo.updateBox(boxId, {
      status: 'OPENED',
      rewardCoins,
      rewardLabel: label,
      openedAt: new Date().toISOString(),
    });

    // Credit Wallet
    await walletService.credit(
      userId,
      rewardCoins,
      'surprise_box',
      `Opened surprise box for ${box.drawName}: ${label} (+${rewardCoins} coins)`,
      'reward_box',
      box.id
    );

    await notificationService.send({
      userId,
      title: '🎁 Surprise Box Opened!',
      message: `You revealed ${label} and won +${rewardCoins} Buzz Coins!`,
      type: 'bonus',
      actionUrl: '/player/wallet',
    });

    await auditService.log({
      actorId: userId,
      actorName: 'Player',
      actorRole: 'PLAYER',
      action: 'REWARD_BOX_OPEN',
      target: boxId,
      description: `Opened surprise box and received ${label} with ${rewardCoins} coins.`,
    });

    return { box: updated, rewardCoins, label };
  }
}

export const rewardBoxService = new RewardBoxService();
