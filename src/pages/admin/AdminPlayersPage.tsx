import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { walletService } from '../../services/walletService';
import { User, Wallet } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Modal } from '../../components/common/Modal';
import { Users, Search, Coins, UserX, UserCheck } from 'lucide-react';

export const AdminPlayersPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();

  const [players, setPlayers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerForAdjust, setSelectedPlayerForAdjust] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>('Promotional adjustment');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const all = await userService.getPlayers();
      setPlayers(all);

      const walletMap: Record<string, Wallet> = {};
      await Promise.all(
        all.map(async (p) => {
          const w = await walletService.getWallet(p.id);
          walletMap[p.id] = w;
        })
      );
      setWallets(walletMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerForAdjust || !user) return;
    try {
      await walletService.adjust(
        user.id,
        user.fullName || user.username,
        selectedPlayerForAdjust.id,
        adjustAmount,
        adjustReason
      );
      showToast('Coins adjusted successfully', 'success');
      setSelectedPlayerForAdjust(null);
      await load();
    } catch (e: any) {
      showToast(e.message || 'Failed to adjust coins', 'error');
    }
  };

  const filtered = players.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.username.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      (p.fullName && p.fullName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Players Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational player records and virtual balance management.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Player Details</th>
                <th className="px-5 py-3.5">Coin Balance</th>
                <th className="px-5 py-3.5">Streak</th>
                <th className="px-5 py-3.5">Status</th>
                {hasPermission('wallet.adjust') && <th className="px-5 py-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((player) => (
                <tr key={player.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={player.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-200 block">{player.fullName || player.username}</span>
                        <span className="text-[11px] text-slate-400">@{player.username} • {player.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-300">
                    {formatCoins(wallets[player.id]?.balance || 0)} 🪙
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-400">
                    Day {player.streak || 1} 🔥
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      player.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {player.status.toUpperCase()}
                    </span>
                  </td>
                  {hasPermission('wallet.adjust') && (
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedPlayerForAdjust(player)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold"
                      >
                        Adjust Coins
                      </button>
                    </td>
                  )}
                </tr>
              ))}
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
                Amount (Positive or Negative)
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlayerForAdjust(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
