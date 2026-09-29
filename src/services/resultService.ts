import { DrawResult, WinRecord } from '../types';
import {
  LocalStorageResultRepository,
  LocalStorageTicketRepository,
  LocalStoragePrizeRepository,
} from './repositories/localStorage';
import { drawService } from './drawService';
import { prizeService } from './prizeService';
import { walletService } from './walletService';
import { notificationService } from './notificationService';
import { auditService } from './auditService';
import { generateId } from '../utils';

const resultRepo = new LocalStorageResultRepository();
const ticketRepo = new LocalStorageTicketRepository();
const prizeRepo = new LocalStoragePrizeRepository();

export class ResultService {
  async getAll(): Promise<DrawResult[]> {
    return resultRepo.getAll();
  }

  async getByDrawId(drawId: string): Promise<DrawResult | null> {
    return resultRepo.getByDrawId(drawId);
  }

  async publishResult(params: {
    drawId: string;
    winningNumber: string; // 4 or 5 digits
    actorId: string;
    actorName: string;
    actorRole: 'SUPERADMIN' | 'ADMIN';
  }): Promise<{ result: DrawResult; winners: WinRecord[]; totalPrize: number }> {
    const { drawId, winningNumber, actorId, actorName, actorRole } = params;

    const formattedWinningNumber = winningNumber.padStart(5, '0');
    const draw = await drawService.getById(drawId);
    if (!draw) throw new Error('Draw does not exist.');

    // Idempotency check: if already settled, check if result already exists
    const existingResult = await resultRepo.getByDrawId(drawId);
    if (existingResult && existingResult.status === 'PUBLISHED') {
      throw new Error('This draw already has a published result and has been settled.');
    }

    // 1. Fetch all tickets for this draw
    const drawTickets = await ticketRepo.getByDrawId(drawId);

    const winners: WinRecord[] = [];
    let totalPrize = 0;

    // 2. Evaluate each ticket
    for (const ticket of drawTickets) {
      if (ticket.status === 'won' || ticket.status === 'lost') {
        // Skip already evaluated tickets
        continue;
      }

      const evalResult = prizeService.evaluateNumber(ticket.number, formattedWinningNumber);
      if (evalResult.rank) {
        const prizeAmount = prizeService.calculatePrizeAmount(
          evalResult.rank,
          ticket.sem,
          draw.jackpotSeed
        );

        ticket.status = 'won';
        ticket.winningRank = evalResult.rank;
        ticket.prizeAmount = prizeAmount;
        ticket.settledAt = new Date().toISOString();

        await ticketRepo.update(ticket.id, ticket);

        // Create Win Record
        const winRecord: WinRecord = {
          id: generateId('win'),
          ticketId: ticket.id,
          drawId,
          userId: ticket.userId,
          winningNumber: formattedWinningNumber,
          ticketNumber: ticket.number,
          rank: evalResult.rank,
          sem: ticket.sem,
          prizeAmount,
          claimed: true,
          claimedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        await prizeRepo.createWin(winRecord);
        winners.push(winRecord);
        totalPrize += prizeAmount;

        // Credit Player Wallet
        await walletService.credit(
          ticket.userId,
          prizeAmount,
          'prize_payout',
          `Prize payout for ${evalResult.description} on ${draw.name} (Ticket #${ticket.number})`,
          'ticket',
          ticket.id
        );

        // Notify Player
        await notificationService.send({
          userId: ticket.userId,
          title: `🏆 ${evalResult.rank === 'jackpot' ? 'JACKPOT WINNER!' : 'You Won a Prize!'}`,
          message: `Ticket #${ticket.number} matched in ${draw.name}! You scored ${prizeAmount} Buzz Coins.`,
          type: 'win',
          actionUrl: '/player/wins',
        });
      } else {
        ticket.status = 'lost';
        ticket.settledAt = new Date().toISOString();
        await ticketRepo.update(ticket.id, ticket);
      }
    }

    // 3. Create or update result record
    const resultRecord: DrawResult = {
      id: existingResult?.id || generateId('res'),
      drawId,
      drawName: draw.name,
      drawDate: draw.drawDate,
      winningNumber: formattedWinningNumber,
      publishedBy: actorId,
      publisherName: actorName,
      publishedAt: new Date().toISOString(),
      status: 'PUBLISHED',
      winnersCount: winners.length,
      totalPrizeDistributed: totalPrize,
      nonceRevealed: draw.nonce,
    };

    if (existingResult) {
      await resultRepo.update(existingResult.id, resultRecord);
    } else {
      await resultRepo.create(resultRecord);
    }

    // 4. Update Draw Status to SETTLED
    await drawService.update(drawId, {
      status: 'SETTLED',
      resultNumber: formattedWinningNumber,
      totalWinnersCount: winners.length,
      totalPrizesPaid: totalPrize,
      settledAt: new Date().toISOString(),
    });

    // 5. Audit Log
    await auditService.log({
      actorId,
      actorName,
      actorRole,
      action: 'RESULT_PUBLISH_AND_SETTLE',
      target: drawId,
      description: `Published winning number #${formattedWinningNumber} for ${draw.name}. Paid ${totalPrize} coins to ${winners.length} winning tickets.`,
    });

    return { result: resultRecord, winners, totalPrize };
  }
}

export const resultService = new ResultService();
