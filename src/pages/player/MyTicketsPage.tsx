import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { drawService } from '../../services/drawService';
import { prizeService } from '../../services/prizeService';
import { Ticket, Draw, WinRecord } from '../../types';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { Modal } from '../../components/common/Modal';
import { formatCoins, formatDateTime, formatDate } from '../../utils';
import { Link } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  Eye,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [userTickets, allDraws, userWins] = await Promise.all([
          ticketService.getByUserId(user.id),
          drawService.getAll(),
          prizeService.getWins(user.id),
        ]);
        setTickets(userTickets);
        setDraws(allDraws);
        setWins(userWins);
      } catch (e) {
        console.error('Error loading tickets:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedFilter !== 'all' && ticket.status !== selectedFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const draw = draws.find((d) => d.id === ticket.drawId);
      return (
        ticket.number.includes(term) ||
        ticket.id.toLowerCase().includes(term) ||
        draw?.name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-amber-400" />
            <span>My Digital Tickets</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track all purchased tickets, live draw statuses, and verified prizes.
          </p>
        </div>

        <Link
          to="/player/play"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
        >
          <span>Buy More Tickets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'won', 'lost'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                selectedFilter === tab
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search number or draw..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <TicketIcon className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-300">No Tickets Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No tickets match your search criteria.'
              : 'You have no tickets under this filter. Tap below to choose your lucky numbers!'}
          </p>
          <Link
            to="/player/play"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
          >
            <span>Play Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((ticket) => {
            const draw = draws.find((d) => d.id === ticket.drawId);
            const isWinner = ticket.status === 'won';

            return (
              <div
                key={ticket.id}
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all hover:scale-[1.01] flex flex-col justify-between ${
                  isWinner
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : ticket.status === 'active'
                    ? 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  {/* Top draw info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        #{ticket.id.slice(-8).toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 mt-0.5">
                        {draw?.name || 'Draw Ticket'}
                      </h4>
                    </div>

                    <div className="text-right">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Won +{formatCoins(ticket.prizeAmount || 0)} 🪙</span>
                        </span>
                      ) : ticket.status === 'active' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Active Entry
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Number Display */}
                  <div className="my-4 flex items-center justify-between">
                    <div className="flex gap-1.5 font-mono font-black text-xl text-amber-300">
                      {ticket.number.split('').map((d, i) => (
                        <span
                          key={i}
                          className="w-7 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shadow-inner"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">SEM & Cost</span>
                      <span className="text-xs font-bold text-slate-200">
                        {ticket.sem} SEM • {ticket.cost} 🪙
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer and Inspection button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {ticket.createdAt ? formatDateTime(ticket.createdAt) : ''}
                  </span>
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Ticket Visual</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Visual Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Digital Ticket Inspection"
          maxWidth="lg"
        >
          <WinningTicketVisual
            ticket={selectedTicket}
            draw={draws.find((d) => d.id === selectedTicket.drawId)}
            win={wins.find((w) => w.ticketId === selectedTicket.id)}
          />
        </Modal>
      )}
    </div>
  );
};
