import {
  LocalStorageUserRepository,
  LocalStorageDrawRepository,
  LocalStorageTicketRepository,
  LocalStorageWalletRepository,
  LocalStoragePrizeRepository,
  LocalStorageResultRepository,
} from './repositories/localStorage';

const userRepo = new LocalStorageUserRepository();
const drawRepo = new LocalStorageDrawRepository();
const ticketRepo = new LocalStorageTicketRepository();
const walletRepo = new LocalStorageWalletRepository();
const prizeRepo = new LocalStoragePrizeRepository();
const resultRepo = new LocalStorageResultRepository();

export interface SystemOverviewStats {
  totalPlayers: number;
  activePlayers: number;
  totalAdmins: number;
  openDrawsCount: number;
  totalTicketsSold: number;
  totalVirtualCoinsCirculating: number;
  totalWinsCount: number;
  totalPrizesPaidCoins: number;
  pendingResultsCount: number;
}

export class ReportService {
  async getOverviewStats(): Promise<SystemOverviewStats> {
    const users = await userRepo.getAll();
    const draws = await drawRepo.getAll();
    const tickets = await ticketRepo.getAll();
    const wins = await prizeRepo.getWins();
    const results = await resultRepo.getAll();

    const players = users.filter((u) => u.role === 'PLAYER');
    const activePlayers = players.filter((p) => p.status === 'active');
    const admins = users.filter((u) => u.role === 'ADMIN');
    const openDraws = draws.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED');
    const closedWithoutResult = draws.filter((d) => (d.status === 'CLOSED' || d.status === 'DRAWING') && !d.resultNumber);

    const transactions = await walletRepo.getTransactions();
    const totalCirculating = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalPrizesPaid = wins.reduce((acc, w) => acc + w.prizeAmount, 0);

    return {
      totalPlayers: players.length,
      activePlayers: activePlayers.length,
      totalAdmins: admins.length,
      openDrawsCount: openDraws.length,
      totalTicketsSold: tickets.length,
      totalVirtualCoinsCirculating: Math.max(0, totalCirculating),
      totalWinsCount: wins.length,
      totalPrizesPaidCoins: totalPrizesPaid,
      pendingResultsCount: closedWithoutResult.length,
    };
  }

  exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reportService = new ReportService();
