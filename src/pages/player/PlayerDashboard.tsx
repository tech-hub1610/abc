import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { ticketService } from '../../services/ticketService';
import { bonusService } from '../../services/bonusService';
import { rewardBoxService } from '../../services/rewardBoxService';
import { prizeService } from '../../services/prizeService';
import { resultService } from '../../services/resultService';
import { Draw, Ticket, RewardBox, WinRecord, DrawResult } from '../../types';
import { formatCoins, formatDate, formatTime } from '../../utils';
import { DrawCountdownCard } from '../../components/draw/DrawCountdownCard';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { SurpriseBoxModal } from '../../components/rewards/SurpriseBoxModal';
import { Modal } from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Gift,
  Coins,
  Ticket as TicketIcon,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const PlayerDashboard: React.FC = () => {
  const { user, walletBalance, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [recentWins, setRecentWins] = useState<WinRecord[]>([]);
  const [latestResults, setLatestResults] = useState<DrawResult[]>([]);
  const [dailyBonusStatus, setDailyBonusStatus] = useState<any>(null);
  const [rewardBoxes, setRewardBoxes] = useState<RewardBox[]>([]);
  const [selectedTicketForView, setSelectedTicketForView] = useState<Ticket | null>(null);
  const [selectedBoxToOpen, setSelectedBoxToOpen] = useState<RewardBox | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allDraws, userTickets, userWins, results, bonusStatus, boxes] = await Promise.all([
        drawService.getAll(),
        ticketService.getByUserId(user.id),
        prizeService.getWins(user.id),
        resultService.getAll(),
        bonusService.getDailyBonusStatus(user.id),
        rewardBoxService.getBoxes(user.id),
      ]);

      setDraws(allDraws);
      setRecentTickets(userTickets.slice(0, 5));
      setRecentWins(userWins.slice(0, 3));
      setLatestResults(results.slice(0, 3));
      setDailyBonusStatus(bonusStatus);
      setRewardBoxes(boxes);
    } catch (e) {
      console.error('Error loading player dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleClaimDaily = async () => {
    if (!user) return;
    try {
      setClaimingDaily(true);
      const res = await bonusService.claimDailyBonus(user.id);
      showToast(res.message, 'success');
      await refreshUserData();
      await loadDashboardData();
    } catch (e: any) {
      showToast(e.message || 'Failed to claim bonus', 'error');
    } finally {
      setClaimingDaily(false);
    }
  };

  const openDraws = draws.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED');
  const availableBoxes = rewardBoxes.filter((b) => b.status === 'AVAILABLE');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero / Greeting Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/60 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 sm:p-6 backdrop-blur-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.fullName || 'Player'}
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                  Welcome, {user?.fullName?.split(' ')[0] || user?.username}!
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Player
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready for today's draws? Choose your numbers or tap Quick Pick!
              </p>
            </div>
          </div>

          {/* Quick Balance + Play button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="px-4 py-2 rounded-2xl bg-black/40 border border-amber-400/30">
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80 block font-semibold">
                Coin Balance
              </span>
              <span className="font-mono text-lg font-black text-amber-300">
                {formatCoins(walletBalance)} <span className="text-xs">🪙</span>
              </span>
            </div>
            <Link
              to="/player/play"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-sm text-white shadow-lg shadow-emerald-950/60 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <span>Play Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Bonus & Surprise Boxes Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Bonus Streak Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-100">Daily Streak Bonus</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  🔥 Day {dailyBonusStatus?.currentStreak || user?.streak || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {dailyBonusStatus?.eligible
                  ? `Claim +${dailyBonusStatus.nextAmount} coins today!`
                  : 'Bonus collected today. Streak preserved!'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClaimDaily}
            disabled={!dailyBonusStatus?.eligible || claimingDaily}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md shrink-0 ${
              dailyBonusStatus?.eligible
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {claimingDaily ? 'Claiming...' : dailyBonusStatus?.eligible ? 'Claim Bonus' : 'Claimed'}
          </button>
        </div>

        {/* Surprise Box Widget */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-indigo-400 animate-bounce-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-100">Surprise Boxes</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                  {availableBoxes.length} Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {availableBoxes.length > 0
                  ? 'You have unopened boxes waiting!'
                  : 'Enter any draw to unlock more surprise boxes.'}
              </p>
            </div>
          </div>
          {availableBoxes.length > 0 ? (
            <button
              onClick={() => setSelectedBoxToOpen(availableBoxes[0])}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-950/50 transition shrink-0"
            >
              Open 🎁
            </button>
          ) : (
            <Link
              to="/player/rewards"
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition shrink-0"
            >
              View Odds
            </Link>
          )}
        </div>
      </div>

      {/* Live / Upcoming Draws Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display text-base font-bold text-slate-100">
              Today's Live Draws
            </h3>
          </div>
          <Link
            to="/player/play"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draws.slice(0, 3).map((draw) => (
            <DrawCountdownCard key={draw.id} draw={draw} />
          ))}
        </div>
      </div>

      {/* Split Section: Recent Tickets & Latest Published Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-amber-400" />
              <h4 className="font-display text-sm font-bold text-slate-100">My Recent Tickets</h4>
            </div>
            <Link to="/player/tickets" className="text-xs text-amber-400 hover:underline">
              All Tickets ({recentTickets.length})
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <TicketIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No tickets purchased yet.</p>
              <Link to="/player/play" className="text-emerald-400 font-semibold mt-1 inline-block">
                Pick your first numbers &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTickets.map((ticket) => {
                const draw = draws.find((d) => d.id === ticket.drawId);
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 font-mono font-bold text-sm text-slate-200">
                        {ticket.number.split('').map((d, i) => (
                          <span
                            key={i}
                            className="w-5 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-300 truncate max-w-[120px] sm:max-w-[160px]">
                          {draw?.name || 'Draw Ticket'}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {ticket.sem} SEM • {ticket.cost} coins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status === 'won' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Won +{formatCoins(ticket.prizeAmount || 0)} 🪙
                        </span>
                      ) : ticket.status === 'lost' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Settled
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Active
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedTicketForView(ticket)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        title="View Ticket Visual"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Latest Results & Recent Wins */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h4 className="font-display text-sm font-bold text-slate-100">Latest Winning Results</h4>
            </div>
            <Link to="/player/results" className="text-xs text-emerald-400 hover:underline">
              Results Archive
            </Link>
          </div>

          {latestResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No results published yet today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">
                        {result.drawName}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(result.drawDate)}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5 block">
                      {result.winnersCount} winning tickets • {formatCoins(result.totalPrizeDistributed)} coins paid
                    </span>
                  </div>

                  <div className="flex gap-1 font-mono font-bold text-base text-amber-300">
                    {result.winningNumber.split('').map((d, i) => (
                      <span
                        key={i}
                        className="w-6 h-7 rounded bg-emerald-950 border border-amber-400/50 flex items-center justify-center text-xs shadow-inner"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Visual Modal */}
      {selectedTicketForView && (
        <Modal
          isOpen={!!selectedTicketForView}
          onClose={() => setSelectedTicketForView(null)}
          title="Digital Ticket Inspection"
          maxWidth="lg"
        >
          <WinningTicketVisual
            ticket={selectedTicketForView}
            draw={draws.find((d) => d.id === selectedTicketForView.drawId)}
          />
        </Modal>
      )}

      {/* Surprise Box Modal */}
      <SurpriseBoxModal
        box={selectedBoxToOpen}
        isOpen={!!selectedBoxToOpen}
        onClose={() => setSelectedBoxToOpen(null)}
        onBoxOpened={async () => {
          await refreshUserData();
          await loadDashboardData();
        }}
      />
    </div>
  );
};
