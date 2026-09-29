import { Draw, DrawStatus } from '../types';
import { LocalStorageDrawRepository } from './repositories/localStorage';
import { generateId, simpleHash } from '../utils';
import { auditService } from './auditService';

const drawRepo = new LocalStorageDrawRepository();

export class DrawService {
  async getAll(): Promise<Draw[]> {
    return drawRepo.getAll();
  }

  async getById(id: string): Promise<Draw | null> {
    return drawRepo.getById(id);
  }

  async getOpenDraws(): Promise<Draw[]> {
    const all = await drawRepo.getAll();
    return all.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED');
  }

  async getSettledDraws(): Promise<Draw[]> {
    const all = await drawRepo.getAll();
    return all.filter((d) => d.status === 'SETTLED');
  }

  async createDraw(params: {
    name: string;
    tierKey: 'morning' | 'day' | 'evening' | 'custom';
    drawTime: string; // HH:mm
    drawDate: string; // YYYY-MM-DD
    jackpotSeed?: number;
    ticketCost?: number;
    accentColor?: string;
    actorId?: string;
    actorName?: string;
  }): Promise<Draw> {
    const nonce = generateId('nonce') + Math.random().toString(36).substring(2);
    const commitment = simpleHash(`${nonce}|${params.drawDate}|${params.tierKey}`);

    const newDraw: Draw = {
      id: generateId('drw'),
      name: params.name,
      tierKey: params.tierKey,
      drawTime: params.drawTime,
      drawDate: params.drawDate,
      drawAt: `${params.drawDate}T${params.drawTime}:00.000Z`,
      status: 'OPEN',
      jackpotSeed: params.jackpotSeed || 30000,
      ticketCost: params.ticketCost || 12,
      accentColor: params.accentColor || (params.tierKey === 'morning' ? 'green' : params.tierKey === 'day' ? 'amber' : 'blue'),
      nonce,
      commitment,
      totalTicketsSold: 0,
      totalCoinsCollected: 0,
      createdAt: new Date().toISOString(),
    };

    await drawRepo.create(newDraw);

    if (params.actorId) {
      await auditService.log({
        actorId: params.actorId,
        actorName: params.actorName || 'Admin',
        actorRole: 'ADMIN',
        action: 'DRAW_CREATE',
        target: newDraw.id,
        description: `Created draw "${newDraw.name}" for ${newDraw.drawDate} at ${newDraw.drawTime}`,
      });
    }

    return newDraw;
  }

  async updateStatus(id: string, status: DrawStatus, actorId?: string, actorName?: string): Promise<Draw> {
    const draw = await drawRepo.getById(id);
    if (!draw) throw new Error('Draw not found');
    const updated = await drawRepo.update(id, { status });

    if (actorId) {
      await auditService.log({
        actorId,
        actorName: actorName || 'Admin',
        actorRole: 'ADMIN',
        action: 'DRAW_STATUS_UPDATE',
        target: id,
        description: `Updated status of draw "${draw.name}" to ${status}`,
      });
    }

    return updated;
  }

  async recordSale(id: string, ticketCount: number, coins: number): Promise<Draw> {
    const draw = await drawRepo.getById(id);
    if (!draw) throw new Error('Draw not found');
    return drawRepo.update(id, {
      totalTicketsSold: draw.totalTicketsSold + ticketCount,
      totalCoinsCollected: draw.totalCoinsCollected + coins,
    });
  }

  async update(id: string, updates: Partial<Draw>): Promise<Draw> {
    return drawRepo.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    return drawRepo.delete(id);
  }
}

export const drawService = new DrawService();
