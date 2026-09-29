import React, { useState, useEffect } from 'react';
import { rewardBoxService } from '../../services/rewardBoxService';
import { RewardBox } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Gift, ShieldCheck } from 'lucide-react';

export const AdminRewardsPage: React.FC = () => {
  const [boxes, setBoxes] = useState<RewardBox[]>([]);
  const [odds, setOdds] = useState<{ coins: number; weight: number; label: string; chance: string; badge?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [b, o] = await Promise.all([rewardBoxService.getBoxes(), rewardBoxService.getOdds()]);
        setBoxes(b);
        setOdds(o);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Gift className="w-6 h-6 text-indigo-400" />
          <span>Surprise Mystery Boxes Oversight</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          View reward distribution and check provably fair box table odds.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="font-display text-sm font-bold text-slate-200 mb-3">Published Table Odds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {odds.map((o, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-amber-400 block">{o.badge}</span>
              <span className="font-semibold text-slate-200 block mt-0.5">{o.label}</span>
              <span className="font-mono text-emerald-400 font-bold block mt-1">{o.chance}</span>
              <span className="font-mono text-slate-400 text-[11px]">+{formatCoins(o.coins)} 🪙</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="font-display text-sm font-bold text-slate-200 mb-3">Box Openings Log</h3>
        <div className="divide-y divide-slate-800 text-xs">
          {boxes.map((b) => (
            <div key={b.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">{b.drawName} Box</span>
                <span className="text-[10px] text-slate-500 block">User: {b.userId}</span>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'OPENED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {b.status} {b.rewardCoins ? `(+${formatCoins(b.rewardCoins)} 🪙)` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
