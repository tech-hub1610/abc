import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { prizeService } from '../../services/prizeService';
import { drawService } from '../../services/drawService';
import { ticketService } from '../../services/ticketService';
import { WinRecord, Draw, Ticket } from '../../types';
import { formatCoins, formatDateTime, formatDate } from '../../utils';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { Modal } from '../../components/common/Modal';
import { Trophy, Award, Sparkles, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WinsPage: React.FC = () => {
  const { user } = useAuth();
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<{ ticket: Ticket; draw?: Draw; win: WinRecord } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWins = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [userWins, allDraws, userTickets] = await Promise.all([
          prizeService.getWins(user.id),
          drawService.getAll(),
          ticketService.getByUserId(user.id),
        ]);
        setWins(userWins);
        setDraws(allDraws);
        setTickets(userTickets);
      } catch (e) {
        console.error('Error loading wins:', e);
      } finally {
        setLoading(false);
      }
    };
    loadWins();
  }, [user]);

  const totalWinnings = wins.reduce((sum, w) => sum + w.prizeAmount, 0);

  const handleInspect = (win: WinRecord) => {
    const t = tickets.find((item) => item.id === win.ticketId);
    const d = draws.find((item) => item.id === win.drawId);
    if (t) {
      setSelectedTicket({ ticket: t, draw: d, win });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>My Winning Entries & Rewards</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Verified prizes automatically credited to your virtual coin wallet.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300">Lifetime Winnings:</span>
          <span className="font-mono text-sm font-extrabold text-amber-300">
            +{formatCoins(totalWinnings)} 🪙
          </span>
        </div>
      </div>

      {/* Wins list */}
      {wins.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-300">No Winnings Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Enter today's scheduled draws to hit the straight jackpot or matching permutations!
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
          {wins.map((win) => {
            const draw = draws.find((d) => d.id === win.drawId);
            return (
              <div
                key={win.id}
                className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-lg shadow-amber-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Claimed on {formatDateTime(win.claimedAt)}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 mt-0.5">
                        {draw?.name || 'Lottery Draw'}
                      </h4>
                    </div>

                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                      {win.rank} Match
                    </span>
                  </div>

                  {/* Matching Numbers Display */}
                  <div className="my-4 p-3 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">
                        Your Ticket Number
                      </span>
                      <div className="flex gap-1 font-mono font-black text-lg text-amber-300 mt-1">
                        {win.ticketNumber.split('').map((d, i) => (
                          <span
                            key={i}
                            className="w-6 h-7 rounded bg-amber-950 border border-amber-400/50 flex items-center justify-center text-xs shadow-inner"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">
                        Prize Paid
                      </span>
                      <span className="font-mono text-xl font-black text-emerald-400">
                        +{formatCoins(win.prizeAmount)} <span className="text-xs">🪙</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settled & Credited</span>
                  </div>
                  <button
                    onClick={() => handleInspect(win)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Winning Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Winning Ticket Inspection Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Official Winning Ticket Inspection"
          maxWidth="lg"
        >
          <WinningTicketVisual
            ticket={selectedTicket.ticket}
            draw={selectedTicket.draw}
            win={selectedTicket.win}
          />
        </Modal>
      )}
    </div>
  );
};
