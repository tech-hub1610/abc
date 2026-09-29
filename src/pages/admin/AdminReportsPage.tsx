import React, { useState, useEffect } from 'react';
import { reportService, SystemOverviewStats } from '../../services/reportService';
import { ticketService } from '../../services/ticketService';
import { drawService } from '../../services/drawService';
import { formatCoins } from '../../utils';
import { StatCard } from '../../components/common/StatCard';
import { FileBarChart2, Download, Users, Calendar, Ticket, Trophy } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const s = await reportService.getOverviewStats();
        setStats(s);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportTickets = async () => {
    const tickets = await ticketService.getAll();
    reportService.exportToCsv('admin_tickets_export', tickets as any);
  };

  const handleExportDraws = async () => {
    const draws = await drawService.getAll();
    reportService.exportToCsv('admin_draws_export', draws as any);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-purple-400" />
            <span>Operational Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational summaries and CSV dataset exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTickets}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Tickets CSV</span>
          </button>
          <button
            onClick={handleExportDraws}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Draws CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Players"
          value={stats?.totalPlayers || 0}
          subtitle={`${stats?.activePlayers || 0} active`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Open Draws"
          value={stats?.openDrawsCount || 0}
          subtitle="Accepting entries"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Tickets Sold"
          value={stats?.totalTicketsSold || 0}
          subtitle="All games"
          icon={Ticket}
          color="blue"
        />
        <StatCard
          title="Total Prizes"
          value={`${formatCoins(stats?.totalPrizesPaidCoins || 0)} 🪙`}
          subtitle={`${stats?.totalWinsCount || 0} winners`}
          icon={Trophy}
          color="purple"
        />
      </div>
    </div>
  );
};
