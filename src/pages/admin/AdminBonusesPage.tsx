import React, { useState, useEffect } from 'react';
import { bonusService } from '../../services/bonusService';
import { BonusClaim } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Flame } from 'lucide-react';

export const AdminBonusesPage: React.FC = () => {
  const [claims, setClaims] = useState<BonusClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const all = await bonusService.getClaims();
        setClaims(all);
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
          <Flame className="w-6 h-6 text-amber-400" />
          <span>Bonuses & Streaks Monitor</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          View daily player streak claims, emergency refills, and promotional bonuses.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Bonus Type</th>
                <th className="px-5 py-3.5">User ID</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Coins Granted</th>
                <th className="px-5 py-3.5 text-right">Claimed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                    No bonus claims recorded yet.
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-bold font-mono text-amber-400 uppercase">{c.bonusType}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{c.userId}</td>
                    <td className="px-5 py-3.5 text-slate-200">{c.description}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">+{formatCoins(c.amount)} 🪙</td>
                    <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-500">
                      {formatDateTime(c.claimedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
