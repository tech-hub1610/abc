import {
  User,
  Draw,
  Ticket,
  DrawResult,
  WinRecord,
  Wallet,
  WalletTransaction,
  BonusClaim,
  RewardBox,
  RewardBoxConfig,
  InAppNotification,
  AuditLog,
  AppSettings,
  TicketTemplate,
  PrizeConfig,
} from '../../../types';
import {
  IAuthRepository,
  IUserRepository,
  IDrawRepository,
  ITicketRepository,
  IWalletRepository,
  IResultRepository,
  IPrizeRepository,
  IBonusRepository,
  IRewardBoxRepository,
  INotificationRepository,
  IAuditRepository,
  ISettingsRepository,
  ITicketTemplateRepository,
} from '../../contracts/repositories';
import { storageService } from '../../storageService';
import {
  SEED_USERS,
  SEED_DRAWS,
  SEED_TICKETS,
  SEED_RESULTS,
  SEED_WINS,
  SEED_WALLETS,
  SEED_TRANSACTIONS,
  SEED_REWARD_BOXES,
  SEED_REWARD_BOX_CONFIG,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_SETTINGS,
  SEED_TICKET_TEMPLATES,
  SEED_PRIZES,
} from '../../../data/seedData';

// Collection Keys
const USERS_KEY = 'app_users';
const SESSION_KEY = 'app_session_user';
const DRAWS_KEY = 'app_draws';
const TICKETS_KEY = 'app_tickets';
const RESULTS_KEY = 'app_results';
const WINS_KEY = 'app_wins';
const WALLETS_KEY = 'app_wallets';
const TRANSACTIONS_KEY = 'app_wallet_transactions';
const BONUSES_KEY = 'app_bonus_claims';
const REWARD_BOXES_KEY = 'app_reward_boxes';
const REWARD_BOX_CONFIG_KEY = 'app_reward_box_config';
const NOTIFICATIONS_KEY = 'app_notifications';
const AUDIT_LOGS_KEY = 'app_audit_logs';
const SETTINGS_KEY = 'app_settings';
const TEMPLATES_KEY = 'app_ticket_templates';
const PRIZES_KEY = 'app_prizes';

export function initializeLocalStorageDatabase(force: boolean = false): void {
  if (!force && storageService.isInitialized()) {
    return;
  }
  storageService.clearAll();
  storageService.set(USERS_KEY, SEED_USERS);
  storageService.set(DRAWS_KEY, SEED_DRAWS);
  storageService.set(TICKETS_KEY, SEED_TICKETS);
  storageService.set(RESULTS_KEY, SEED_RESULTS);
  storageService.set(WINS_KEY, SEED_WINS);
  storageService.set(WALLETS_KEY, SEED_WALLETS);
  storageService.set(TRANSACTIONS_KEY, SEED_TRANSACTIONS);
  storageService.set(BONUSES_KEY, []);
  storageService.set(REWARD_BOXES_KEY, SEED_REWARD_BOXES);
  storageService.set(REWARD_BOX_CONFIG_KEY, SEED_REWARD_BOX_CONFIG);
  storageService.set(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
  storageService.set(AUDIT_LOGS_KEY, SEED_AUDIT_LOGS);
  storageService.set(SETTINGS_KEY, SEED_SETTINGS);
  storageService.set(TEMPLATES_KEY, SEED_TICKET_TEMPLATES);
  storageService.set(PRIZES_KEY, SEED_PRIZES);
  storageService.set(SESSION_KEY, SEED_USERS[0]); // default active session
  storageService.setVersion(1);
}

export class LocalStorageAuthRepository implements IAuthRepository {
  async getCurrentSessionUser(): Promise<User | null> {
    return storageService.get<User | null>(SESSION_KEY, null);
  }

  async setCurrentSessionUser(user: User | null): Promise<void> {
    if (user) {
      storageService.set(SESSION_KEY, user);
    } else {
      storageService.remove(SESSION_KEY);
    }
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const users = storageService.get<User[]>(USERS_KEY, SEED_USERS);
    const idf = identifier.trim().toLowerCase();
    return (
      users.find(
        (u) =>
          u.email.toLowerCase() === idf ||
          u.username.toLowerCase() === idf
      ) || null
    );
  }
}

export class LocalStorageUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    return storageService.get<User[]>(USERS_KEY, SEED_USERS);
  }

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find((u) => u.id === id) || null;
  }

  async create(user: User): Promise<User> {
    const users = await this.getAll();
    users.unshift(user);
    storageService.set(USERS_KEY, users);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getAll();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User with id ${id} not found`);
    const updated = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    users[index] = updated;
    storageService.set(USERS_KEY, users);

    // If updating current session user
    const current = storageService.get<User | null>(SESSION_KEY, null);
    if (current && current.id === id) {
      storageService.set(SESSION_KEY, updated);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const users = await this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    storageService.set(USERS_KEY, filtered);
  }
}

export class LocalStorageDrawRepository implements IDrawRepository {
  async getAll(): Promise<Draw[]> {
    return storageService.get<Draw[]>(DRAWS_KEY, SEED_DRAWS);
  }

  async getById(id: string): Promise<Draw | null> {
    const draws = await this.getAll();
    return draws.find((d) => d.id === id) || null;
  }

  async create(draw: Draw): Promise<Draw> {
    const draws = await this.getAll();
    draws.unshift(draw);
    storageService.set(DRAWS_KEY, draws);
    return draw;
  }

  async update(id: string, updates: Partial<Draw>): Promise<Draw> {
    const draws = await this.getAll();
    const index = draws.findIndex((d) => d.id === id);
    if (index === -1) throw new Error(`Draw with id ${id} not found`);
    const updated = { ...draws[index], ...updates };
    draws[index] = updated;
    storageService.set(DRAWS_KEY, draws);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const draws = await this.getAll();
    storageService.set(DRAWS_KEY, draws.filter((d) => d.id !== id));
  }
}

export class LocalStorageTicketRepository implements ITicketRepository {
  async getAll(): Promise<Ticket[]> {
    return storageService.get<Ticket[]>(TICKETS_KEY, SEED_TICKETS);
  }

  async getByUserId(userId: string): Promise<Ticket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.userId === userId);
  }

  async getByDrawId(drawId: string): Promise<Ticket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.drawId === drawId);
  }

  async getById(id: string): Promise<Ticket | null> {
    const tickets = await this.getAll();
    return tickets.find((t) => t.id === id) || null;
  }

  async create(ticket: Ticket): Promise<Ticket> {
    const tickets = await this.getAll();
    tickets.unshift(ticket);
    storageService.set(TICKETS_KEY, tickets);
    return ticket;
  }

  async createMany(newTickets: Ticket[]): Promise<Ticket[]> {
    const tickets = await this.getAll();
    const updated = [...newTickets, ...tickets];
    storageService.set(TICKETS_KEY, updated);
    return newTickets;
  }

  async update(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const tickets = await this.getAll();
    const index = tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Ticket with id ${id} not found`);
    const updated = { ...tickets[index], ...updates };
    tickets[index] = updated;
    storageService.set(TICKETS_KEY, tickets);
    return updated;
  }
}

export class LocalStorageWalletRepository implements IWalletRepository {
  async getWallet(userId: string): Promise<Wallet | null> {
    const wallets = storageService.get<Wallet[]>(WALLETS_KEY, SEED_WALLETS);
    const w = wallets.find((item) => item.userId === userId);
    if (w) return w;
    // auto-create initial wallet
    const newWallet: Wallet = {
      userId,
      balance: 1500,
      totalWon: 0,
      totalSpent: 0,
      totalClaimedBonuses: 0,
      updatedAt: new Date().toISOString(),
    };
    wallets.push(newWallet);
    storageService.set(WALLETS_KEY, wallets);
    return newWallet;
  }

  async saveWallet(wallet: Wallet): Promise<Wallet> {
    const wallets = storageService.get<Wallet[]>(WALLETS_KEY, SEED_WALLETS);
    const index = wallets.findIndex((w) => w.userId === wallet.userId);
    if (index >= 0) {
      wallets[index] = wallet;
    } else {
      wallets.push(wallet);
    }
    storageService.set(WALLETS_KEY, wallets);
    return wallet;
  }

  async getTransactions(userId?: string): Promise<WalletTransaction[]> {
    const txs = storageService.get<WalletTransaction[]>(TRANSACTIONS_KEY, SEED_TRANSACTIONS);
    if (userId) {
      return txs.filter((t) => t.userId === userId);
    }
    return txs;
  }

  async addTransaction(tx: WalletTransaction): Promise<WalletTransaction> {
    const txs = storageService.get<WalletTransaction[]>(TRANSACTIONS_KEY, SEED_TRANSACTIONS);
    txs.unshift(tx);
    storageService.set(TRANSACTIONS_KEY, txs);
    return tx;
  }
}

export class LocalStorageResultRepository implements IResultRepository {
  async getAll(): Promise<DrawResult[]> {
    return storageService.get<DrawResult[]>(RESULTS_KEY, SEED_RESULTS);
  }

  async getByDrawId(drawId: string): Promise<DrawResult | null> {
    const results = await this.getAll();
    return results.find((r) => r.drawId === drawId) || null;
  }

  async create(result: DrawResult): Promise<DrawResult> {
    const results = await this.getAll();
    results.unshift(result);
    storageService.set(RESULTS_KEY, results);
    return result;
  }

  async update(id: string, updates: Partial<DrawResult>): Promise<DrawResult> {
    const results = await this.getAll();
    const index = results.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Result with id ${id} not found`);
    const updated = { ...results[index], ...updates };
    results[index] = updated;
    storageService.set(RESULTS_KEY, results);
    return updated;
  }
}

export class LocalStoragePrizeRepository implements IPrizeRepository {
  async getAllConfigs(): Promise<PrizeConfig[]> {
    return storageService.get<PrizeConfig[]>(PRIZES_KEY, SEED_PRIZES);
  }

  async saveConfig(config: PrizeConfig): Promise<PrizeConfig> {
    const configs = await this.getAllConfigs();
    const index = configs.findIndex((c) => c.id === config.id);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    storageService.set(PRIZES_KEY, configs);
    return config;
  }

  async getWins(userId?: string): Promise<WinRecord[]> {
    const wins = storageService.get<WinRecord[]>(WINS_KEY, SEED_WINS);
    if (userId) {
      return wins.filter((w) => w.userId === userId);
    }
    return wins;
  }

  async createWin(win: WinRecord): Promise<WinRecord> {
    const wins = storageService.get<WinRecord[]>(WINS_KEY, SEED_WINS);
    wins.unshift(win);
    storageService.set(WINS_KEY, wins);
    return win;
  }
}

export class LocalStorageBonusRepository implements IBonusRepository {
  async getClaims(userId?: string): Promise<BonusClaim[]> {
    const claims = storageService.get<BonusClaim[]>(BONUSES_KEY, []);
    if (userId) {
      return claims.filter((c) => c.userId === userId);
    }
    return claims;
  }

  async recordClaim(claim: BonusClaim): Promise<BonusClaim> {
    const claims = storageService.get<BonusClaim[]>(BONUSES_KEY, []);
    claims.unshift(claim);
    storageService.set(BONUSES_KEY, claims);
    return claim;
  }
}

export class LocalStorageRewardBoxRepository implements IRewardBoxRepository {
  async getBoxes(userId?: string): Promise<RewardBox[]> {
    const boxes = storageService.get<RewardBox[]>(REWARD_BOXES_KEY, SEED_REWARD_BOXES);
    if (userId) {
      return boxes.filter((b) => b.userId === userId);
    }
    return boxes;
  }

  async getBoxConfigs(): Promise<RewardBoxConfig[]> {
    return storageService.get<RewardBoxConfig[]>(REWARD_BOX_CONFIG_KEY, SEED_REWARD_BOX_CONFIG);
  }

  async createBox(box: RewardBox): Promise<RewardBox> {
    const boxes = storageService.get<RewardBox[]>(REWARD_BOXES_KEY, SEED_REWARD_BOXES);
    boxes.unshift(box);
    storageService.set(REWARD_BOXES_KEY, boxes);
    return box;
  }

  async updateBox(id: string, updates: Partial<RewardBox>): Promise<RewardBox> {
    const boxes = storageService.get<RewardBox[]>(REWARD_BOXES_KEY, SEED_REWARD_BOXES);
    const index = boxes.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Reward box with id ${id} not found`);
    const updated = { ...boxes[index], ...updates };
    boxes[index] = updated;
    storageService.set(REWARD_BOXES_KEY, boxes);
    return updated;
  }
}

export class LocalStorageNotificationRepository implements INotificationRepository {
  async getAll(userId?: string): Promise<InAppNotification[]> {
    const notifs = storageService.get<InAppNotification[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    if (userId) {
      return notifs.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return notifs;
  }

  async create(notification: InAppNotification): Promise<InAppNotification> {
    const notifs = storageService.get<InAppNotification[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    notifs.unshift(notification);
    storageService.set(NOTIFICATIONS_KEY, notifs);
    return notification;
  }

  async markAsRead(id: string): Promise<void> {
    const notifs = storageService.get<InAppNotification[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      storageService.set(NOTIFICATIONS_KEY, notifs);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifs = storageService.get<InAppNotification[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    notifs.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    storageService.set(NOTIFICATIONS_KEY, notifs);
  }
}

export class LocalStorageAuditRepository implements IAuditRepository {
  async getAll(): Promise<AuditLog[]> {
    return storageService.get<AuditLog[]>(AUDIT_LOGS_KEY, SEED_AUDIT_LOGS);
  }

  async create(log: AuditLog): Promise<AuditLog> {
    const logs = storageService.get<AuditLog[]>(AUDIT_LOGS_KEY, SEED_AUDIT_LOGS);
    logs.unshift(log);
    storageService.set(AUDIT_LOGS_KEY, logs);
    return log;
  }
}

export class LocalStorageSettingsRepository implements ISettingsRepository {
  async getSettings(): Promise<AppSettings> {
    return storageService.get<AppSettings>(SETTINGS_KEY, SEED_SETTINGS);
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    storageService.set(SETTINGS_KEY, settings);
    return settings;
  }
}

export class LocalStorageTicketTemplateRepository implements ITicketTemplateRepository {
  async getAll(): Promise<TicketTemplate[]> {
    return storageService.get<TicketTemplate[]>(TEMPLATES_KEY, SEED_TICKET_TEMPLATES);
  }

  async getById(id: string): Promise<TicketTemplate | null> {
    const templates = await this.getAll();
    return templates.find((t) => t.id === id) || null;
  }

  async save(template: TicketTemplate): Promise<TicketTemplate> {
    const templates = await this.getAll();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    storageService.set(TEMPLATES_KEY, templates);
    return template;
  }
}
