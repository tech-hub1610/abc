import { Ticket } from '../types';
import { LocalStorageTicketRepository } from './repositories/localStorage';
import { drawService } from './drawService';
import { walletService } from './walletService';
import { notificationService } from './notificationService';
import { rewardBoxService } from './rewardBoxService';
import { auditService } from './auditService';
import { generateId, generateRandomNumber } from '../utils';

const ticketRepo = new LocalStorageTicketRepository();

export class TicketService {
  async getAll(): Promise<Ticket[]> {
    return ticketRepo.getAll();
  }

  async getByUserId(userId: string): Promise<Ticket[]> {
    return ticketRepo.getByUserId(userId);
  }

  async getByDrawId(drawId: string): Promise<Ticket[]> {
    return ticketRepo.getByDrawId(drawId);
  }

  async getById(id: string): Promise<Ticket | null> {
    return ticketRepo.getById(id);
  }

  generateQuickPickNumber(digits: number = 5): string {
    return generateRandomNumber(digits);
  }

  validateNumber(num: string): boolean {
    return /^[0-9]{4,5}$/.test(num.trim());
  }

  async purchaseTicket(params: {
    userId: string;
    userName: string;
    drawId: string;
    number: string;
    sem: number;
  }): Promise<Ticket> {
    const { userId, userName, drawId, number, sem } = params;

    if (!this.validateNumber(number)) {
      throw new Error('Please enter a valid 4 or 5 digit lottery number.');
    }

    if (sem < 5 || sem > 100 || sem % 5 !== 0) {
      throw new Error('SEM must be in multiples of 5 (5, 10, 15, 20... up to 100).');
    }

    const draw = await drawService.getById(drawId);
    if (!draw) throw new Error('Selected draw does not exist.');
    if (draw.status !== 'OPEN' && draw.status !== 'SCHEDULED') {
      throw new Error(`This draw is currently ${draw.status}. Ticket sales are closed.`);
    }

    const totalCost = draw.ticketCost * sem;
    const currentBalance = await walletService.getBalance(userId);
    if (currentBalance < totalCost) {
      throw new Error(`Insufficient virtual coin balance. You need ${totalCost} coins but have ${currentBalance}.`);
    }

    const newTicket: Ticket = {
      id: generateId('tkt'),
      drawId,
      userId,
      userName,
      number: number.padStart(5, '0'),
      sem,
      cost: totalCost,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // 1. Debit wallet
    await walletService.debit(
      userId,
      totalCost,
      'ticket_purchase',
      `Purchased ${sem} SEM on ${draw.name} (#${newTicket.number})`,
      'ticket',
      newTicket.id
    );

    // 2. Save ticket
    await ticketRepo.create(newTicket);

    // 3. Update draw statistics
    await drawService.recordSale(drawId, 1, totalCost);

    // 4. Send notification
    await notificationService.send({
      userId,
      title: '🎟️ Ticket Registered',
      message: `Your ticket #${newTicket.number} (${sem} SEM) for ${draw.name} is confirmed. Good luck!`,
      type: 'success',
      actionUrl: '/player/tickets',
    });

    // 5. Ensure surprise box eligibility for entering this draw
    await rewardBoxService.ensureEligibility(userId, drawId, draw.name);

    await auditService.log({
      actorId: userId,
      actorName: userName,
      actorRole: 'PLAYER',
      action: 'TICKET_PURCHASE',
      target: newTicket.id,
      description: `Player ${userName} bought ticket #${newTicket.number} (${sem} SEM, ${totalCost} coins) for ${draw.name}`,
    });

    return newTicket;
  }

  async purchaseBulk(params: {
    userId: string;
    userName: string;
    drawId: string;
    items: { number: string; sem: number }[];
  }): Promise<Ticket[]> {
    const { userId, userName, drawId, items } = params;
    if (!items || items.length === 0) throw new Error('No tickets in cart.');

    const draw = await drawService.getById(drawId);
    if (!draw) throw new Error('Draw not found.');
    if (draw.status !== 'OPEN' && draw.status !== 'SCHEDULED') {
      throw new Error(`This draw is ${draw.status}. Ticket sales are closed.`);
    }

    let totalCost = 0;
    for (const item of items) {
      if (!this.validateNumber(item.number)) {
        throw new Error(`Invalid ticket number: ${item.number}`);
      }
      if (item.sem < 5 || item.sem % 5 !== 0) {
        throw new Error('SEM must be in multiples of 5.');
      }
      totalCost += draw.ticketCost * item.sem;
    }

    const currentBalance = await walletService.getBalance(userId);
    if (currentBalance < totalCost) {
      throw new Error(`Insufficient coins. Total cost is ${totalCost} coins (Balance: ${currentBalance}).`);
    }

    const newTickets: Ticket[] = items.map((item) => ({
      id: generateId('tkt'),
      drawId,
      userId,
      userName,
      number: item.number.padStart(5, '0'),
      sem: item.sem,
      cost: draw.ticketCost * item.sem,
      status: 'active',
      createdAt: new Date().toISOString(),
    }));

    // Debit in single transaction
    await walletService.debit(
      userId,
      totalCost,
      'ticket_purchase',
      `Purchased ${newTickets.length} tickets for ${draw.name}`,
      'draw',
      drawId
    );

    await ticketRepo.createMany(newTickets);
    await drawService.recordSale(drawId, newTickets.length, totalCost);
    await rewardBoxService.ensureEligibility(userId, drawId, draw.name);

    await notificationService.send({
      userId,
      title: '🎟️ Bulk Tickets Confirmed',
      message: `Successfully placed ${newTickets.length} tickets for ${draw.name}. Total: ${totalCost} coins.`,
      type: 'success',
      actionUrl: '/player/tickets',
    });

    return newTickets;
  }
}

export const ticketService = new TicketService();
