import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bonusService } from '../../services/bonusService';
import { useSettings } from '../../context/SettingsContext';
import { BonusClaim } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Flame, Gift, Coins, CheckCircle2, Clock, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BonusesPage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [dailyStatus, setDailyStatus] = useState<any>(null);
  const [refillStatus, setRefillStatus] = useState<any>(null);
  const [claims, setClaims] = useState<BonusClaim[]>([]);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingRefill, setClaimingRefill] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBonusData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [dStatus, rStatus, userClaims] = await Promise.all([
        bonusService.getDailyBonusStatus(user.id),
        bonusService.getRefillStatus(user.id),
        bonusService.getClaims(user.id),
      ]);
      setDailyStatus(dStatus);
      setRefillStatus(rStatus);
      setClaims(userClaims);
    } catch (e) {
      console.error('Error loading bonus data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBonusData();
  }, [user]);

  const handleClaimDaily = async () => {
    if (!user) return;
    try {
      setClaimingDaily(true);
      const res = await bonusService.claimDailyBonus(user.id);
      showToast(res.message, 'success');
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {}
      await refreshUserData();
      await loadBonusData();
    } catch (e: any) {
      showToast(e.message || 'Failed to claim daily bonus', 'error');
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleClaimRefill = async () => {
    if (!user) return;
    try {
      setClaimingRefill(true);
      const res = await bonusService.claimRefill(user.id);
      showToast(res.message, 'success');
      await refreshUserData();
      await loadBonusData();
    } catch (e: any) {
      showToast(e.message || 'Failed to claim refill', 'error');
    } finally {
      setClaimingRefill(false);
    }
  };

  const streakDays = [1, 2, 3, 4, 5, 6, 7];
  const currentStreak = dailyStatus?.currentStreak || user?.streak || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Daily Bonuses & Free Pocket Refills</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Collect free coins every 24 hours to build your streak and stay in the game.
        </p>
      </div>

      {/* 7-Day Streak Calendar */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Daily Streak Progression
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                Day {currentStreak} Streak 🔥
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
              {dailyStatus?.eligible
                ? `Today's Reward: +${dailyStatus.nextAmount} Coins`
                : 'Today\'s Reward Claimed! Next Reward Tomorrow.'}
            </h3>
          </div>

          <button
            onClick={handleClaimDaily}
            disabled={!dailyStatus?.eligible || claimingDaily}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xl transition transform active:scale-95 flex items-center gap-2 shrink-0 ${
              dailyStatus?.eligible
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{claimingDaily ? 'Claiming...' : dailyStatus?.eligible ? 'Claim Today\'s Bonus' : 'Collected Today'}</span>
          </button>
        </div>

        {/* 7 Days Streak Visual Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-5">
          {streakDays.map((day) => {
            const isCompleted = day < currentStreak || (!dailyStatus?.eligible && day === currentStreak);
            const isCurrent = day === currentStreak && dailyStatus?.eligible;
            const rewardCoins = Math.min(
              settings.dailyBonusBase + day * settings.streakBonus,
              settings.streakBonusMax
            );

            return (
              <div
                key={day}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block">
                    Day {day}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-100 block mt-1">
                    +{rewardCoins} 🪙
                  </span>
                </div>

                <div className="mt-2 flex justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pocket Refill Option */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <h4 className="font-display text-base font-bold text-slate-100">
              Emergency Pocket Refill
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Running low on coins? Claim +{settings.refillAmount} free coins when your balance is under {settings.refillFloor} coins.
            (Up to {settings.refillDailyCap} times daily).
          </p>
        </div>

        <button
          onClick={handleClaimRefill}
          disabled={!refillStatus?.eligible || claimingRefill}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            refillStatus?.eligible
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${claimingRefill ? 'animate-spin' : ''}`} />
          <span>{claimingRefill ? 'Refilling...' : 'Refill Pocket Coins'}</span>
        </button>
      </div>

      {/* Bonus Claims History */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h4 className="font-display text-sm font-bold text-slate-200 mb-3">
          Bonus Claims History
        </h4>
        {claims.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No bonus claims recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {claims.map((claim) => (
              <div key={claim.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-300 block">{claim.description}</span>
                  <span className="text-[10px] text-slate-500">{formatDateTime(claim.claimedAt)}</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  +{formatCoins(claim.amount)} 🪙
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
