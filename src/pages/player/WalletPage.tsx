import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { walletService } from '../../services/walletService';
import { bonusService } from '../../services/bonusService';
import { WalletTransaction, Wallet } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Coins,
  History,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { user, walletBalance, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [refillStatus, setRefillStatus] = useState<any>(null);
  const [refilling, setRefilling] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWalletData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [w, txs, rStatus] = await Promise.all([
        walletService.getWallet(user.id),
        walletService.getTransactions(user.id),
        bonusService.getRefillStatus(user.id),
      ]);
      setWallet(w);
      setTransactions(txs);
      setRefillStatus(rStatus);
    } catch (e) {
      console.error('Error loading wallet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const handleClaimRefill = async () => {
    if (!user) return;
    try {
      setRefilling(true);
      const res = await bonusService.claimRefill(user.id);
      showToast(res.message, 'success');
      await refreshUserData();
      await loadWalletData();
    } catch (e: any) {
      showToast(e.message || 'Refill failed', 'error');
    } finally {
      setRefilling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-amber-400" />
          <span>Virtual Coin Wallet & Ledger</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          100% Free virtual buzz coins economy. No real-money cash or deposits.
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400/90 font-bold">
                Current Available Balance
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Simulated Virtual Coins
              </span>
            </div>
            <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold font-mono text-amber-300 flex items-center gap-2">
              <span>{formatCoins(walletBalance)}</span>
              <span className="text-xl sm:text-2xl">🪙</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Used for participating in all daily draws, bonus streaks, and rewards.
            </p>
          </div>

          {/* Emergency Refill Button */}
          {refillStatus?.eligible ? (
            <button
              onClick={handleClaimRefill}
              disabled={refilling}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95 flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {refilling ? 'Refilling...' : `Claim Pocket Refill (+${refillStatus.refillAmount} 🪙)`}
              </span>
            </button>
          ) : (
            <div className="text-right sm:text-left text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Refill Status</span>
              <span>{refillStatus?.message || 'Refill active when balance is low'}</span>
            </div>
          )}
        </div>

        {/* Mini stats row */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total Won</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              +{formatCoins(wallet?.totalWon || 0)} 🪙
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total Played</span>
            <span className="font-mono font-bold text-slate-300 text-sm">
              {formatCoins(wallet?.totalSpent || 0)} 🪙
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Bonuses Collected</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              +{formatCoins(wallet?.totalClaimedBonuses || 0)} 🪙
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h4 className="font-display text-base font-bold text-slate-100">
              Transaction History
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {transactions.length} record{transactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No wallet transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCredit
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{tx.description}</p>
                      <span className="text-[10px] text-slate-500">
                        {formatDateTime(tx.createdAt)} • Reason: {tx.reason}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-sm font-bold block ${
                        isCredit ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isCredit ? `+${formatCoins(tx.amount)}` : formatCoins(tx.amount)} 🪙
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Bal: {formatCoins(tx.balanceAfter)} 🪙
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
