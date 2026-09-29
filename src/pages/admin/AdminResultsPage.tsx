import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { resultService } from '../../services/resultService';
import { Draw, DrawResult } from '../../types';
import { formatCoins, formatDate, generateRandomNumber } from '../../utils';
import { Trophy, Dices, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminResultsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [winningNumber, setWinningNumber] = useState<string>('');
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    const [allDraws, allResults] = await Promise.all([
      drawService.getAll(),
      resultService.getAll(),
    ]);
    setDraws(allDraws);
    setResults(allResults);

    const unsettled = allDraws.filter((d) => d.status !== 'SETTLED' && d.status !== 'CANCELLED');
    if (unsettled.length > 0 && !selectedDrawId) {
      setSelectedDrawId(unsettled[0].id);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrawId || !winningNumber || !user) return;

    try {
      setPublishing(true);
      const res = await resultService.publishResult({
        drawId: selectedDrawId,
        winningNumber,
        actorId: user.id,
        actorName: user.fullName || user.username,
        actorRole: 'ADMIN',
      });
      showToast(`Settled ${res.winners.length} winning tickets (+${formatCoins(res.totalPrize)} coins)!`, 'success');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      setWinningNumber('');
      await load();
    } catch (e: any) {
      showToast(e.message || 'Publication failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const eligibleDraws = draws.filter((d) => d.status !== 'SETTLED' && d.status !== 'CANCELLED');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>Results & Prize Settlement</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Enter verified winning numbers to trigger automated prize settlement and player payouts.
        </p>
      </div>

      {hasPermission('results.publish') && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="font-display text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Publish Results</span>
          </h3>

          {eligibleDraws.length === 0 ? (
            <p className="text-xs text-slate-500">No open draws currently waiting for settlement.</p>
          ) : (
            <form onSubmit={handlePublish} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Draw</label>
                  <select
                    value={selectedDrawId}
                    onChange={(e) => setSelectedDrawId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {eligibleDraws.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.totalTicketsSold} tickets)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">5-Digit Winning #</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      required
                      value={winningNumber}
                      onChange={(e) => setWinningNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 48291"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setWinningNumber(generateRandomNumber(5))}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs text-amber-400 flex items-center gap-1"
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={publishing || winningNumber.length < 4}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {publishing ? 'Settling Winners...' : 'Publish Winning Result'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="font-display text-sm font-bold text-slate-200 mb-3">Published Results Archive</h3>
        <div className="divide-y divide-slate-800">
          {results.map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-200 block">{r.drawName}</span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(r.drawDate)} • {r.winnersCount} winners • Paid {formatCoins(r.totalPrizeDistributed)} 🪙
                </span>
              </div>
              <div className="flex gap-1 font-mono font-bold text-amber-300 text-sm">
                {r.winningNumber.split('').map((d, i) => (
                  <span key={i} className="w-5 h-6 rounded bg-emerald-950 border border-amber-400/50 flex items-center justify-center text-xs">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
