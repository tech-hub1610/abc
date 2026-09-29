import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { resultService } from '../../services/resultService';
import { prizeService } from '../../services/prizeService';
import { Draw, DrawResult, WinRecord } from '../../types';
import { formatCoins, formatDateTime, formatDate, generateRandomNumber } from '../../utils';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';
import { Trophy, Dices, Award, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const SuperadminResultsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [winningNumber, setWinningNumber] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [settlementReport, setSettlementReport] = useState<{ result: DrawResult; winners: WinRecord[]; totalPrize: number } | null>(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleGenerateTestNumber = () => {
    setWinningNumber(generateRandomNumber(5));
  };

  const handlePublishAndSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrawId || !winningNumber || !user) {
      showToast('Please select a draw and enter the 5-digit winning number.', 'warning');
      return;
    }

    try {
      setPublishing(true);
      const res = await resultService.publishResult({
        drawId: selectedDrawId,
        winningNumber,
        actorId: user.id,
        actorName: user.fullName || user.username,
        actorRole: user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN',
      });

      setSettlementReport(res);
      showToast(`Settlement completed! Distributed ${formatCoins(res.totalPrize)} coins to ${res.winners.length} winners.`, 'success');

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setWinningNumber('');
      await loadData();
    } catch (e: any) {
      showToast(e.message || 'Settlement failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const eligibleDrawsForSettlement = draws.filter((d) => d.status !== 'SETTLED' && d.status !== 'CANCELLED');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>Results Publication & Winner Settlement Engine</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Enter official winning numbers. The engine calculates winners across all tiers, settles prizes into wallets, and logs immutable audits.
        </p>
      </div>

      {/* Settlement Action Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5 sm:p-6 shadow-xl">
        <h3 className="font-display text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Publish New Draw Result & Run Idempotent Settlement</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          No AI required. Pure provably-fair deterministic evaluation engine.
        </p>

        {eligibleDrawsForSettlement.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
            All active draws have already been settled or no draws are currently open. Schedule a new draw to publish results.
          </div>
        ) : (
          <form onSubmit={handlePublishAndSettle} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Select Draw to Settle *
                </label>
                <select
                  value={selectedDrawId}
                  onChange={(e) => setSelectedDrawId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {eligibleDrawsForSettlement.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({formatDate(d.drawDate)} - {d.totalTicketsSold} tickets)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  5-Digit Winning Number *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={winningNumber}
                    onChange={(e) => setWinningNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 48291"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTestNumber}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition flex items-center gap-1"
                    title="Generate Random Number"
                  >
                    <Dices className="w-4 h-4 text-amber-400" />
                    <span>Random</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={publishing || winningNumber.length < 4}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition disabled:opacity-40"
            >
              {publishing ? 'Processing Settlement...' : 'Publish Winning Result & Credit All Winners 🏆'}
            </button>
          </form>
        )}
      </div>

      {/* Published Results Archive */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="font-display text-base font-bold text-slate-100 mb-4">
          Settled Draw Archive
        </h3>

        <div className="divide-y divide-slate-800">
          {results.map((r) => (
            <div key={r.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">{r.drawName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({formatDate(r.drawDate)})</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Published by {r.publisherName} • {r.winnersCount} winning tickets • Paid {formatCoins(r.totalPrizeDistributed)} coins
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-base">
                {r.winningNumber.split('').map((d, i) => (
                  <span
                    key={i}
                    className="w-6 h-7 rounded bg-emerald-950 border border-amber-400/50 flex items-center justify-center text-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlement Result Report Modal */}
      {settlementReport && (
        <Modal
          isOpen={!!settlementReport}
          onClose={() => setSettlementReport(null)}
          title="Settlement Execution Report"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center">
              <span className="text-xs uppercase text-emerald-400 font-bold block">
                Settlement Completed Successfully
              </span>
              <h4 className="font-mono text-2xl font-black text-amber-300 mt-1">
                Winning Number #{settlementReport.result.winningNumber}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Total Winners: <strong>{settlementReport.winners.length}</strong> • Total Coins Paid: <strong>{formatCoins(settlementReport.totalPrize)} 🪙</strong>
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              <h5 className="text-xs font-bold text-slate-300">Winning Ticket Payouts:</h5>
              {settlementReport.winners.length === 0 ? (
                <p className="text-xs text-slate-500">No tickets matched this winning number.</p>
              ) : (
                settlementReport.winners.map((w) => (
                  <div key={w.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200">Ticket #{w.ticketNumber} ({w.rank.toUpperCase()})</span>
                    <span className="font-mono font-bold text-emerald-400">+{formatCoins(w.prizeAmount)} 🪙</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSettlementReport(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Close Report
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
