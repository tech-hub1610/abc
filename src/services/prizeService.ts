import { PrizeConfig, WinRecord } from '../types';
import { LocalStoragePrizeRepository } from './repositories/localStorage';

const prizeRepo = new LocalStoragePrizeRepository();

export class PrizeService {
  async getConfigs(): Promise<PrizeConfig[]> {
    return prizeRepo.getAllConfigs();
  }

  async getWins(userId?: string): Promise<WinRecord[]> {
    return prizeRepo.getWins(userId);
  }

  /**
   * Evaluate a ticket number against a 5-digit winning number.
   * Returns matching rank or null if no prize.
   */
  evaluateNumber(
    ticketNum: string,
    winningNum: string
  ): {
    rank: 'jackpot' | 'box' | 'back3' | 'back2' | 'back1' | 'anydigit' | null;
    description: string;
  } {
    const t = ticketNum.padStart(5, '0');
    const w = winningNum.padStart(5, '0');

    // 1. Exact straight jackpot
    if (t === w) {
      return { rank: 'jackpot', description: 'Exact 5-digit Match (Jackpot Straight)' };
    }

    // 2. Box match (permutation of digits)
    const tSorted = t.split('').sort().join('');
    const wSorted = w.split('').sort().join('');
    if (tSorted === wSorted) {
      return { rank: 'box', description: 'All 5 digits match in any order (Box)' };
    }

    // 3. Last 3 digits straight
    if (t.slice(2) === w.slice(2)) {
      return { rank: 'back3', description: 'Last 3 digits exact match' };
    }

    // 4. Last 2 digits straight
    if (t.slice(3) === w.slice(3)) {
      return { rank: 'back2', description: 'Last 2 digits exact match' };
    }

    // 5. Last 1 digit straight
    if (t.slice(4) === w.slice(4)) {
      return { rank: 'back1', description: 'Last digit match' };
    }

    // 6. Any digit in same position
    let matchCount = 0;
    for (let i = 0; i < 5; i++) {
      if (t[i] === w[i]) matchCount++;
    }
    if (matchCount >= 1) {
      return { rank: 'anydigit', description: `${matchCount} positional digit match (Consolation)` };
    }

    return { rank: null, description: 'No match' };
  }

  calculatePrizeAmount(
    rank: 'jackpot' | 'box' | 'back3' | 'back2' | 'back1' | 'anydigit',
    sem: number,
    jackpotSeed: number = 30000
  ): number {
    const semMultiplier = sem / 5; // e.g. 5 SEM = 1x base, 10 SEM = 2x base, 20 SEM = 4x base
    switch (rank) {
      case 'jackpot':
        return jackpotSeed * semMultiplier;
      case 'back3':
        return 600 * semMultiplier;
      case 'box':
        return 300 * semMultiplier;
      case 'back2':
        return 100 * semMultiplier;
      case 'back1':
        return 12 * semMultiplier;
      case 'anydigit':
        return 2 * semMultiplier;
      default:
        return 0;
    }
  }
}

export const prizeService = new PrizeService();
