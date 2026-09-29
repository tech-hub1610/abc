import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { walletService } from '../../services/walletService';
import { ticketService } from '../../services/ticketService';
import { User, Wallet, Ticket } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Modal } from '../../components/common/Modal';
import { Users, Search, Coins, UserX, UserCheck, Ticket as TicketIcon, Edit } from 'lucide-react';

export const SuperadminPlayersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [players, setPlayers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerForAdjust, setSelectedPlayerForAdjust] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState<string>('Promotional bonus grant');
  const [selectedPlayerTickets, setSelectedPlayerTickets] = useState<{ player: User; tickets: Ticket[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const allPlayers = await userService.getPlayers();
      setPlayers(allPlayers);

      const walletMap: Record<string, Wallet> = {};
      await Promise.all(
        allPlayers.map(async (p) => {
          const w = await walletService.getWallet(p.id);
          walletMap[p.id] = w;
        })
      );
      setWallets(walletMap);
    } catch (e) {
      console.error('Failed to load players:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleToggleStatus = async (player: User) => {
    try {
      await userService.toggleStatus(player.id, player.status);
      showToast(`Player ${player.username} status updated`, 'info');
      await loadPlayers();
    } catch (e: any) {
      showToast(e.message || 'Status toggle failed', 'error');
    }
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerForAdjust || !currentUser) return;
    try {
      await walletService.adjust(
        currentUser.id,
        currentUser.fullName || currentUser.username,
        selectedPlayerForAdjust.id,
        adjustAmount,
        adjustReason
      );
      showToast(`Adjusted ${adjustAmount > 0 ? '+' : ''}${adjustAmount} coins for ${selectedPlayerForAdjust.username}`, 'success');
      setSelectedPlayerForAdjust(null);
      await loadPlayers();
    } catch (e: any) {
      showToast(e.message || 'Adjustment failed', 'error');
    }
  };

  const handleViewTickets = async (player: User) => {
    const t = await ticketService.getByUserId(player.id);
    setSelectedPlayerTickets({ player, tickets: t });
  };

  const filteredPlayers = players.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.username.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      (p.fullName && p.fullName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Player Accounts & Virtual Wallets</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View registered players, adjust virtual balances, inspect tickets, and manage account status.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, email, name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Players Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Player Details</th>
                <th className="px-5 py-3.5">Coin Balance</th>
                <th className="px-5 py-3.5">Streak</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPlayers.map((player) => {
                const w = wallets[player.id];
                return (
                  <tr key={player.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={player.username}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-slate-200 block">{player.fullName || player.username}</span>
                          <span className="text-[11px] text-slate-400">@{player.username} • {player.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-amber-300">
                      {formatCoins(w?.balance || 0)} 🪙
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-amber-400">Day {player.streak || 1} 🔥</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {formatDateTime(player.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          player.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {player.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPlayerForAdjust(player)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition flex items-center gap-1"
                          title="Adjust Coin Balance"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Coins</span>
                        </button>
                        <button
                          onClick={() => handleViewTickets(player)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Tickets"
                        >
                          <TicketIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(player)}
                          className={`p-1.5 rounded-lg transition ${
                            player.status === 'active'
                              ? 'bg-slate-800 text-slate-400 hover:text-rose-400'
                              : 'bg-emerald-950/40 text-emerald-400'
                          }`}
                          title={player.status === 'active' ? 'Suspend Player' : 'Activate Player'}
                        >
                          {player.status === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Coins Modal */}
      {selectedPlayerForAdjust && (
        <Modal
          isOpen={!!selectedPlayerForAdjust}
          onClose={() => setSelectedPlayerForAdjust(null)}
          title={`Adjust Coins: ${selectedPlayerForAdjust.username}`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustCoins} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Amount to Adjust (Positive to add, Negative to deduct)
              </label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. VIP test coin allocation"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlayerForAdjust(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 shadow-md"
              >
                Apply Coin Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Player Tickets Modal */}
      {selectedPlayerTickets && (
        <Modal
          isOpen={!!selectedPlayerTickets}
          onClose={() => setSelectedPlayerTickets(null)}
          title={`Tickets for @${selectedPlayerTickets.player.username}`}
          maxWidth="lg"
        >
          <div className="space-y-3">
            {selectedPlayerTickets.tickets.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs">No tickets bought by this player yet.</p>
            ) : (
              selectedPlayerTickets.tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                    <span>#{t.number}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({t.sem} SEM)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === 'won' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
