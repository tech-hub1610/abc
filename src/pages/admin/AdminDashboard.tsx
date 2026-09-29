import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportService, SystemOverviewStats } from '../../services/reportService';
import { drawService } from '../../services/drawService';
import { resultService } from '../../services/resultService';
import { Draw, DrawResult } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCoins, formatDate, formatTime } from '../../utils';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Ticket,
  Trophy,
  Coins,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [activeDraws, setActiveDraws] = useState<Draw[]>([]);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [overview, allDraws, allResults] = await Promise.all([
          reportService.getOverviewStats(),
          drawService.getOpenDraws(),
          resultService.getAll(),
        ]);
        setStats(overview);
        setActiveDraws(allDraws);
        setResults(allResults.slice(0, 5));
      } catch (e) {
        console.error('Error loading admin dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Operational Admin Dashboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage daily scheduled draws, player accounts, ticket batches, and results settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/results"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Publish Draw Result</span>
          </Link>
        </div>
      </div>

      {/* Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {hasPermission('players.view') && (
          <StatCard
            title="Total Players"
            value={stats?.totalPlayers || 0}
            subtitle={`${stats?.activePlayers || 0} active players`}
            icon={Users}
            color="emerald"
          />
        )}
        {hasPermission('draws.view') && (
          <StatCard
            title="Open Draws"
            value={stats?.openDrawsCount || 0}
            subtitle="Accepting tickets"
            icon={Calendar}
            color="amber"
          />
        )}
        {hasPermission('tickets.view') && (
          <StatCard
            title="Tickets Sold"
            value={stats?.totalTicketsSold || 0}
            subtitle="All draws"
            icon={Ticket}
            color="blue"
          />
        )}
        {hasPermission('results.view') && (
          <StatCard
            title="Prizes Distributed"
            value={`${formatCoins(stats?.totalPrizesPaidCoins || 0)} 🪙`}
            subtitle={`${stats?.totalWinsCount || 0} winning tickets`}
            icon={Trophy}
            color="purple"
          />
        )}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Open Draws */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Current Open Draws</span>
            </h3>
            <Link to="/admin/draws" className="text-xs text-amber-400 hover:underline">
              Manage All
            </Link>
          </div>

          {activeDraws.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No open draws currently accepting entries.
            </div>
          ) : (
            <div className="space-y-3">
              {activeDraws.map((draw) => (
                <div
                  key={draw.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{draw.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        {draw.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Time: {formatTime(draw.drawTime)} • Date: {formatDate(draw.drawDate)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-300 text-sm block">
                      {formatCoins(draw.jackpotSeed)} 🪙
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {draw.totalTicketsSold} tickets entered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results & Settlement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Recent Settled Results</span>
            </h3>
            <Link to="/admin/results" className="text-xs text-emerald-400 hover:underline">
              Results & Settlement
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No results recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{res.drawName}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(res.drawDate)} • Settled by {res.publisherName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5 font-mono font-bold text-amber-300 text-sm">
                      {res.winningNumber.split('').map((d, i) => (
                        <span
                          key={i}
                          className="w-5 h-6 rounded bg-emerald-950 border border-amber-400/50 flex items-center justify-center text-xs"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {res.winnersCount} wins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
