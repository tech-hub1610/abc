import React, { useState, useEffect } from 'react';
import { resultService } from '../../services/resultService';
import { prizeService } from '../../services/prizeService';
import { DrawResult, PrizeConfig } from '../../types';
import { formatCoins, formatDate } from '../../utils';
import { Trophy, Search, Sparkles, CheckCircle2, Award, Calendar } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<DrawResult[]>([]);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [checkNumber, setCheckNumber] = useState('');
  const [selectedResult, setSelectedResult] = useState<DrawResult | null>(null);
  const [checkEvaluation, setCheckEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const [allResults, allPrizes] = await Promise.all([
          resultService.getAll(),
          prizeService.getConfigs(),
        ]);
        setResults(allResults);
        setPrizes(allPrizes);
        if (allResults.length > 0) {
          setSelectedResult(allResults[0]);
        }
      } catch (e) {
        console.error('Error loading results:', e);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkNumber || !selectedResult) return;
    const res = prizeService.evaluateNumber(checkNumber, selectedResult.winningNumber);
    setCheckEvaluation(res);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Official Draw Results Archive</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Verify winning numbers published daily with provably fair commitment nonces.
        </p>
      </div>

      {/* Interactive Winning Number Checker Widget */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5">
        <div className="max-w-xl">
          <h3 className="font-display text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Instant Prize Match Checker</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter your 4 or 5 digit lottery number to check if it matches a draw outcome.
          </p>

          <form onSubmit={handleEvaluate} className="mt-4 flex flex-col sm:flex-row gap-2">
            <select
              value={selectedResult?.id || ''}
              onChange={(e) => {
                const r = results.find((item) => item.id === e.target.value);
                setSelectedResult(r || null);
                setCheckEvaluation(null);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {results.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.drawName} ({formatDate(r.drawDate)})
                </option>
              ))}
            </select>

            <div className="flex gap-2 flex-1">
              <input
                type="text"
                maxLength={5}
                value={checkNumber}
                onChange={(e) => {
                  setCheckNumber(e.target.value.replace(/\D/g, ''));
                  setCheckEvaluation(null);
                }}
                placeholder="Enter 5 digits"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={checkNumber.length < 4}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                Check
              </button>
            </div>
          </form>

          {/* Checker Result Feedback */}
          {checkEvaluation && (
            <div
              className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
                checkEvaluation.rank
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {checkEvaluation.rank ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Award className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <div>
                  <p className="font-bold">
                    {checkEvaluation.rank
                      ? `MATCH DETECTED: ${checkEvaluation.rank.toUpperCase()}`
                      : 'No Prize Match'}
                  </p>
                  <p className="text-[11px] opacity-80">{checkEvaluation.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Results Cards List */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-bold text-slate-100">Published Results</h3>

        {results.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-500 text-xs">
            No draw results recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res) => (
              <div
                key={res.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      ID: #{res.id.slice(-8).toUpperCase()}
                    </span>
                    <h4 className="font-bold text-base text-slate-100 mt-0.5">{res.drawName}</h4>
                    <span className="text-xs text-slate-400">{formatDate(res.drawDate)}</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PUBLISHED
                  </span>
                </div>

                {/* Winning Digits Banner */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-2">
                    Winning Number
                  </span>
                  <div className="flex justify-center items-center gap-2">
                    {res.winningNumber.split('').map((d, i) => (
                      <div
                        key={i}
                        className="w-10 h-12 rounded-xl bg-emerald-950 border border-amber-400/60 flex items-center justify-center font-mono text-2xl font-black text-amber-300 shadow-inner"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winner & Prize Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded-lg bg-black/30 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block uppercase">Winning Tickets</span>
                    <span className="font-bold text-slate-200">{res.winnersCount} tickets</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Paid</span>
                    <span className="font-bold text-amber-400">
                      {formatCoins(res.totalPrizeDistributed)} 🪙
                    </span>
                  </div>
                </div>

                {/* Provably Fair Nonce */}
                {res.nonceRevealed && (
                  <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Provably Fair Nonce:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[180px]">
                      {res.nonceRevealed}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prize Table Reference */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="font-display text-sm font-bold text-slate-200 mb-3">
          Prize Distribution Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {prizes.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{p.name}</span>
                <span className="font-mono text-amber-400 font-bold">
                  {p.rewardType === 'pot' ? 'Jackpot Pot' : `${p.fixedAmount} 🪙 / SEM`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{p.matchRuleDescription}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
