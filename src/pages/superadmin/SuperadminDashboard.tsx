import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reportService, SystemOverviewStats } from '../../services/reportService';
import { auditService } from '../../services/auditService';
import { drawService } from '../../services/drawService';
import { AuditLog, Draw } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { formatCoins, formatDateTime } from '../../utils';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Calendar,
  Ticket,
  Trophy,
  Coins,
  Award,
  FileText,
  Settings,
  PlusCircle,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SuperadminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [openDraws, setOpenDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuperadminData = async () => {
      try {
        setLoading(true);
        const [overview, logs, draws] = await Promise.all([
          reportService.getOverviewStats(),
          auditService.getAll(),
          drawService.getOpenDraws(),
        ]);
        setStats(overview);
        setRecentLogs(logs.slice(0, 6));
        setOpenDraws(draws);
      } catch (e) {
        console.error('Error loading superadmin dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSuperadminData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Superadmin Control Center
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Global System Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Full root authority: user management, roles, economy, settlements, and audit security.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/superadmin/admins"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Manage Admins</span>
          </Link>
          <Link
            to="/superadmin/results"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Publish / Settle</span>
          </Link>
        </div>
      </div>

      {/* Global Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Players"
          value={stats?.totalPlayers || 0}
          subtitle={`${stats?.activePlayers || 0} active in system`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Admin Staff"
          value={stats?.totalAdmins || 0}
          subtitle="Configured staff accounts"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Total Tickets Sold"
          value={stats?.totalTicketsSold || 0}
          subtitle="Cumulative tickets"
          icon={Ticket}
          color="blue"
        />
        <StatCard
          title="Virtual Coins Circulating"
          value={`${formatCoins(stats?.totalVirtualCoinsCirculating || 0)} 🪙`}
          subtitle="Total virtual player economy"
          icon={Coins}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Wins Settled"
          value={stats?.totalWinsCount || 0}
          subtitle="Verified win records"
          icon={Trophy}
          color="purple"
        />
        <StatCard
          title="Total Prizes Distributed"
          value={`${formatCoins(stats?.totalPrizesPaidCoins || 0)} 🪙`}
          subtitle="Virtual coins awarded"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Open Draws"
          value={stats?.openDrawsCount || 0}
          subtitle="Accepting ticket sales"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Pending Results"
          value={stats?.pendingResultsCount || 0}
          subtitle="Draws awaiting settlement"
          icon={Calendar}
          color="rose"
        />
      </div>

      {/* Superadmin Quick Management Shortcuts */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="font-display text-sm font-bold text-slate-200 mb-3">
          Superadmin Quick Management Modules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <Link
            to="/superadmin/admins"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Admins</span>
          </Link>
          <Link
            to="/superadmin/players"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <Users className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Players</span>
          </Link>
          <Link
            to="/superadmin/draws"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <Calendar className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Draws</span>
          </Link>
          <Link
            to="/superadmin/prizes"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <Award className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Prize Config</span>
          </Link>
          <Link
            to="/superadmin/wallet"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-yellow-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <Coins className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Coin Ledger</span>
          </Link>
          <Link
            to="/superadmin/settings"
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition flex flex-col items-center text-center gap-2 group"
          >
            <Settings className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
            <span className="font-semibold text-slate-200">Settings</span>
          </Link>
        </div>
      </div>

      {/* Security Audit Feed */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="font-display text-base font-bold text-slate-100">
              Recent System Security Audit Log
            </h3>
          </div>
          <Link to="/superadmin/audit" className="text-xs text-rose-400 hover:underline">
            Full Audit Log &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    by {log.actorName} ({log.actorRole})
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{log.description}</p>
              </div>

              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
