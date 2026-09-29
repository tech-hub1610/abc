import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { drawService } from '../../services/drawService';
import { Ticket, Draw } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { Modal } from '../../components/common/Modal';
import { Ticket as TicketIcon, Search, Eye } from 'lucide-react';

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [t, d] = await Promise.all([ticketService.getAll(), drawService.getAll()]);
        setTickets(t);
        setDraws(d);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.number.includes(term) ||
      t.userName.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TicketIcon className="w-6 h-6 text-amber-400" />
            <span>Tickets Ledger</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit and inspect individual tickets across all system players and draws.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search number, player, ticket ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Ticket ID & Number</th>
                <th className="px-5 py-3.5">Player</th>
                <th className="px-5 py-3.5">Draw</th>
                <th className="px-5 py-3.5">SEM & Cost</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((t) => {
                const draw = draws.find((d) => d.id === t.drawId);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-amber-300 text-sm block">#{t.number}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {t.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-200 font-semibold">{t.userName}</td>
                    <td className="px-5 py-3.5 text-slate-300">{draw?.name || 'Lottery Draw'}</td>
                    <td className="px-5 py-3.5 font-mono">{t.sem} SEM ({t.cost} 🪙)</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'won' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="View Visual Ticket"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Ticket Digital Visual"
          maxWidth="lg"
        >
          <WinningTicketVisual
            ticket={selectedTicket}
            draw={draws.find((d) => d.id === selectedTicket.drawId)}
          />
        </Modal>
      )}
    </div>
  );
};
