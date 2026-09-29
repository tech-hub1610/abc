import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rewardBoxService } from '../../services/rewardBoxService';
import { RewardBox } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { SurpriseBoxModal } from '../../components/rewards/SurpriseBoxModal';
import { Gift, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Dices } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RewardsPage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [boxes, setBoxes] = useState<RewardBox[]>([]);
  const [odds, setOdds] = useState<{ coins: number; weight: number; label: string; chance: string; badge?: string }[]>([]);
  const [selectedBoxToOpen, setSelectedBoxToOpen] = useState<RewardBox | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [userBoxes, boxOdds] = await Promise.all([
        rewardBoxService.getBoxes(user.id),
        rewardBoxService.getOdds(),
      ]);
      setBoxes(userBoxes);
      setOdds(boxOdds);
    } catch (e) {
      console.error('Error loading reward boxes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const availableBoxes = boxes.filter((b) => b.status === 'AVAILABLE');
  const openedBoxes = boxes.filter((b) => b.status === 'OPENED');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>Surprise Mystery Boxes</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          One free box granted for every draw you enter. Provably fair prize chances with published odds.
        </p>
      </div>

      {/* Unopened Boxes Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Gift className="w-7 h-7 text-indigo-400 animate-bounce-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-100">
                  Unopened Surprise Boxes
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {availableBoxes.length} Available
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {availableBoxes.length > 0
                  ? 'Tap below to crack open your surprise boxes!'
                  : 'Buy a ticket in any active draw to receive a surprise box.'}
              </p>
            </div>
          </div>

          {availableBoxes.length > 0 ? (
            <button
              onClick={() => setSelectedBoxToOpen(availableBoxes[0])}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 hover:from-indigo-500 hover:to-purple-400 font-extrabold text-xs sm:text-sm text-white shadow-xl shadow-indigo-950/60 transition transform active:scale-95 flex items-center gap-2 shrink-0"
            >
              <span>Open Next Box 🎁</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/player/play"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition shrink-0"
            >
              Enter a Draw
            </Link>
          )}
        </div>

        {/* Available Boxes Carousel/List */}
        {availableBoxes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
            {availableBoxes.map((box) => (
              <div
                key={box.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{box.drawName}</span>
                  <span className="text-[10px] text-indigo-300/80">Unopened Reward</span>
                </div>
                <button
                  onClick={() => setSelectedBoxToOpen(box)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white shadow transition"
                >
                  Open 🎁
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transparent Provably-Fair Odds Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display text-sm font-bold text-slate-100">
              Published Provably Fair Reward Odds
            </h4>
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">
            100% Guaranteed Weights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {odds.map((odd, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {odd.badge || 'TIER'}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-400">
                    {odd.chance}
                  </span>
                </div>
                <h5 className="font-semibold text-slate-200 text-xs mt-1">{odd.label}</h5>
              </div>
              <span className="font-mono font-black text-amber-300 text-sm mt-2 block">
                +{formatCoins(odd.coins)} 🪙
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Opened Boxes Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h4 className="font-display text-sm font-bold text-slate-200 mb-3">
          Recently Opened Boxes
        </h4>
        {openedBoxes.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No boxes opened yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {openedBoxes.map((box) => (
              <div key={box.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-300 block">
                    {box.rewardLabel || 'Surprise Reward'} — {box.drawName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {box.openedAt ? formatDateTime(box.openedAt) : ''}
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  +{formatCoins(box.rewardCoins || 0)} 🪙
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <SurpriseBoxModal
        box={selectedBoxToOpen}
        isOpen={!!selectedBoxToOpen}
        onClose={() => setSelectedBoxToOpen(null)}
        onBoxOpened={async () => {
          await refreshUserData();
          await loadData();
        }}
      />
    </div>
  );
};
