export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'PLAYER';

export type Permission =
  | 'dashboard.view'
  | 'players.view'
  | 'players.create'
  | 'players.edit'
  | 'players.suspend'
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.suspend'
  | 'roles.view'
  | 'roles.manage'
  | 'tickets.view'
  | 'tickets.manage'
  | 'draws.view'
  | 'draws.create'
  | 'draws.edit'
  | 'draws.settle'
  | 'draws.cancel'
  | 'results.view'
  | 'results.create'
  | 'results.edit'
  | 'results.publish'
  | 'prizes.view'
  | 'prizes.manage'
  | 'wallet.view'
  | 'wallet.adjust'
  | 'bonuses.view'
  | 'bonuses.manage'
  | 'rewards.view'
  | 'rewards.manage'
  | 'reports.view'
  | 'reports.export'
  | 'audit.view'
  | 'settings.view'
  | 'settings.manage'
  | 'ticket_templates.view'
  | 'ticket_templates.manage';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string; // In simulated MVP storage
  avatar?: string;
  fullName: string;
  phone?: string;
  status: 'active' | 'suspended' | 'inactive';
  permissions?: Permission[]; // For ADMIN role
  streak: number;
  lastBonusDay?: string; // YYYY-MM-DD
  refillUsedToday?: number;
  lastRefillDay?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type DrawStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'DRAWING' | 'SETTLED' | 'CANCELLED';

export interface Draw {
  id: string;
  name: string; // e.g., "Morning 1:00 PM", "Day 6:00 PM", "Evening 8:00 PM"
  tierKey: 'morning' | 'day' | 'evening' | 'custom';
  drawTime: string; // HH:mm format, e.g. "13:00"
  drawDate: string; // YYYY-MM-DD
  drawAt: string; // Full ISO string
  status: DrawStatus;
  jackpotSeed: number; // Virtual coins pot
  ticketCost: number; // Base cost per single SEM/ticket
  accentColor: string; // 'green' | 'amber' | 'blue' | 'purple'
  nonce: string; // Provably fair hidden nonce
  commitment: string; // SHA-256 hash of nonce|date|tierKey
  resultNumber?: string; // 4 or 5 digit number string, e.g. "48291"
  totalTicketsSold: number;
  totalCoinsCollected: number;
  totalWinnersCount?: number;
  totalPrizesPaid?: number;
  settledAt?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  drawId: string;
  userId: string;
  userName: string;
  number: string; // 4 or 5 digit string, e.g. "48291"
  sem: number; // multiplier count e.g. 5, 10, 15, 20...
  cost: number; // ticketCost * sem
  status: 'active' | 'won' | 'lost' | 'cancelled';
  winningRank?: 'jackpot' | 'box' | 'back3' | 'back2' | 'back1' | 'anydigit';
  prizeAmount?: number; // Total coins won
  settledAt?: string;
  createdAt: string;
}

export interface PrizeConfig {
  id: string;
  name: string;
  rank: 'jackpot' | 'box' | 'back3' | 'back2' | 'back1' | 'anydigit';
  description: string;
  rewardType: 'pot' | 'multiplier' | 'fixed';
  fixedAmount?: number;
  multiplier?: number; // e.g. SEM multiplier
  matchRuleDescription: string;
}

export interface DrawResult {
  id: string;
  drawId: string;
  drawName: string;
  drawDate: string;
  winningNumber: string; // e.g. "48291"
  publishedBy: string; // user id
  publisherName: string;
  publishedAt: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'CANCELLED';
  winnersCount: number;
  totalPrizeDistributed: number;
  nonceRevealed: string;
}

export interface WinRecord {
  id: string;
  ticketId: string;
  drawId: string;
  userId: string;
  winningNumber: string;
  ticketNumber: string;
  rank: 'jackpot' | 'box' | 'back3' | 'back2' | 'back1' | 'anydigit';
  sem: number;
  prizeAmount: number;
  claimed: boolean;
  claimedAt: string;
  createdAt: string;
}

export type WalletTransactionReason =
  | 'starting_balance'
  | 'ticket_purchase'
  | 'ticket_refund'
  | 'prize_payout'
  | 'daily_bonus'
  | 'refill'
  | 'promotional_bonus'
  | 'surprise_box'
  | 'admin_adjustment';

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number; // positive for credit, negative for debit
  type: 'CREDIT' | 'DEBIT';
  balanceAfter: number;
  reason: WalletTransactionReason;
  referenceType?: 'ticket' | 'draw' | 'bonus' | 'reward_box' | 'admin';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  totalWon: number;
  totalSpent: number;
  totalClaimedBonuses: number;
  updatedAt: string;
}

export interface BonusRule {
  id: string;
  name: string;
  type: 'daily' | 'streak' | 'refill' | 'promo';
  baseAmount: number;
  streakIncrement?: number;
  maxStreakBonus?: number;
  refillThreshold?: number;
  refillDailyCap?: number;
  enabled: boolean;
}

export interface BonusClaim {
  id: string;
  userId: string;
  bonusType: 'daily' | 'refill' | 'promo';
  amount: number;
  streakDay?: number;
  claimedAt: string;
  description: string;
}

export interface RewardBoxConfig {
  id: string;
  coins: number;
  weight: number; // Weight out of total for provably fair calculation
  label: string;
  badge?: string;
}

export interface RewardBox {
  id: string;
  userId: string;
  drawId: string;
  drawName: string;
  status: 'AVAILABLE' | 'OPENED' | 'EXPIRED';
  rewardCoins?: number;
  rewardLabel?: string;
  openedAt?: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string; // Target user or 'all' or 'admins'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'win' | 'bonus';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  tagline: string;
  coinName: string;
  coinSymbol: string;
  ticketCost: number;
  defaultStartingBalance: number;
  streakBonus: number;
  streakBonusMax: number;
  dailyBonusBase: number;
  refillFloor: number;
  refillAmount: number;
  refillDailyCap: number;
  activeTicketTemplateId: string;
  maintenanceMode: boolean;
}

export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  theme: 'emerald' | 'gold' | 'royal' | 'obsidian';
  previewColor: string;
  isDefault: boolean;
}
