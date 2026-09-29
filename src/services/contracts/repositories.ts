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
} from '../../types';

export interface IAuthRepository {
  getCurrentSessionUser(): Promise<User | null>;
  setCurrentSessionUser(user: User | null): Promise<void>;
  findByEmailOrUsername(identifier: string): Promise<User | null>;
}

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IDrawRepository {
  getAll(): Promise<Draw[]>;
  getById(id: string): Promise<Draw | null>;
  create(draw: Draw): Promise<Draw>;
  update(id: string, updates: Partial<Draw>): Promise<Draw>;
  delete(id: string): Promise<void>;
}

export interface ITicketRepository {
  getAll(): Promise<Ticket[]>;
  getByUserId(userId: string): Promise<Ticket[]>;
  getByDrawId(drawId: string): Promise<Ticket[]>;
  getById(id: string): Promise<Ticket | null>;
  create(ticket: Ticket): Promise<Ticket>;
  createMany(tickets: Ticket[]): Promise<Ticket[]>;
  update(id: string, updates: Partial<Ticket>): Promise<Ticket>;
}

export interface IWalletRepository {
  getWallet(userId: string): Promise<Wallet | null>;
  saveWallet(wallet: Wallet): Promise<Wallet>;
  getTransactions(userId?: string): Promise<WalletTransaction[]>;
  addTransaction(tx: WalletTransaction): Promise<WalletTransaction>;
}

export interface IResultRepository {
  getAll(): Promise<DrawResult[]>;
  getByDrawId(drawId: string): Promise<DrawResult | null>;
  create(result: DrawResult): Promise<DrawResult>;
  update(id: string, updates: Partial<DrawResult>): Promise<DrawResult>;
}

export interface IPrizeRepository {
  getAllConfigs(): Promise<PrizeConfig[]>;
  saveConfig(config: PrizeConfig): Promise<PrizeConfig>;
  getWins(userId?: string): Promise<WinRecord[]>;
  createWin(win: WinRecord): Promise<WinRecord>;
}

export interface IBonusRepository {
  getClaims(userId?: string): Promise<BonusClaim[]>;
  recordClaim(claim: BonusClaim): Promise<BonusClaim>;
}

export interface IRewardBoxRepository {
  getBoxes(userId?: string): Promise<RewardBox[]>;
  getBoxConfigs(): Promise<RewardBoxConfig[]>;
  createBox(box: RewardBox): Promise<RewardBox>;
  updateBox(id: string, updates: Partial<RewardBox>): Promise<RewardBox>;
}

export interface INotificationRepository {
  getAll(userId?: string): Promise<InAppNotification[]>;
  create(notification: InAppNotification): Promise<InAppNotification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IAuditRepository {
  getAll(): Promise<AuditLog[]>;
  create(log: AuditLog): Promise<AuditLog>;
}

export interface ISettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
}

export interface ITicketTemplateRepository {
  getAll(): Promise<TicketTemplate[]>;
  getById(id: string): Promise<TicketTemplate | null>;
  save(template: TicketTemplate): Promise<TicketTemplate>;
}
