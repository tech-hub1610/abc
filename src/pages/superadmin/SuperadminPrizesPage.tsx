import React, { useState, useEffect } from 'react';
import { prizeService } from '../../services/prizeService';
import { PrizeConfig } from '../../types';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const SuperadminPrizesPage: React.FC = () => {
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        setLoading(true);
        const all = await prizeService.getConfigs();
        setPrizes(all);
      } finally {
        setLoading(false);
      }
    };
    loadPrizes();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <span>Prize Engine Rules & Configuration</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure game economics, permutation ranks (Straight, Box, Back3, Back2, Back1, AnyDigit), and multipliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prizes.map((prize) => (
          <div
            key={prize.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-400">
                  {prize.rank}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {prize.rewardType.toUpperCase()}
                </span>
              </div>
              <h4 className="font-display text-base font-bold text-slate-100">{prize.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{prize.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Calculation Rule</span>
              <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                {prize.matchRuleDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
