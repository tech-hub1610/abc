import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { Draw, DrawStatus } from '../../types';
import { formatCoins, formatDateTime, formatTime, formatDate } from '../../utils';
import { Modal } from '../../components/common/Modal';
import { Calendar, Plus, Edit2, Play, Square, XCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SuperadminDrawsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tierKey, setTierKey] = useState<'morning' | 'day' | 'evening' | 'custom'>('morning');
  const [drawTime, setDrawTime] = useState('13:00');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [jackpotSeed, setJackpotSeed] = useState(30000);
  const [ticketCost, setTicketCost] = useState(12);

  const loadDraws = async () => {
    const all = await drawService.getAll();
    setDraws(all);
  };

  useEffect(() => {
    loadDraws();
  }, []);

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !drawTime || !drawDate) return;
    try {
      await drawService.createDraw({
        name,
        tierKey,
        drawTime,
        drawDate,
        jackpotSeed,
        ticketCost,
        actorId: user?.id,
        actorName: user?.fullName,
      });
      showToast('New draw scheduled successfully with provably fair nonce!', 'success');
      setShowCreateModal(false);
      setName('');
      await loadDraws();
    } catch (e: any) {
      showToast(e.message || 'Failed to create draw', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: DrawStatus) => {
    try {
      await drawService.updateStatus(id, status, user?.id, user?.fullName);
      showToast(`Draw status updated to ${status}`, 'info');
      await loadDraws();
    } catch (e: any) {
      showToast(e.message || 'Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span>Lottery Draw Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Schedule new lottery draws, adjust pots, manage sales windows, and view commitment hashes.
          </p>
        </div>

        <button
          onClick={() => {
            setName('Special Festival Jackpot');
            setTierKey('custom');
            setDrawTime('21:00');
            setDrawDate(new Date().toISOString().split('T')[0]);
            setJackpotSeed(50000);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Draw</span>
        </button>
      </div>

      {/* Draws Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Draw Title & Tier</th>
                <th className="px-5 py-3.5">Schedule</th>
                <th className="px-5 py-3.5">Jackpot Pot</th>
                <th className="px-5 py-3.5">Tickets Sold</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Status Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {draws.map((draw) => (
                <tr key={draw.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-200 block">{draw.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Commitment: {draw.commitment.slice(0, 16)}...
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-slate-300 block">{formatDate(draw.drawDate)}</span>
                    <span className="font-mono text-[11px] text-amber-300">{formatTime(draw.drawTime)}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-amber-300">
                    {formatCoins(draw.jackpotSeed)} 🪙
                  </td>
                  <td className="px-5 py-4 text-slate-300 font-mono">
                    {draw.totalTicketsSold} tickets
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      draw.status === 'OPEN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : draw.status === 'SCHEDULED'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : draw.status === 'SETTLED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {draw.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateStatus(draw.id, 'OPEN')}
                          className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
                        >
                          Open Sales
                        </button>
                      )}
                      {draw.status === 'OPEN' && (
                        <button
                          onClick={() => handleUpdateStatus(draw.id, 'CLOSED')}
                          className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[10px] font-semibold"
                        >
                          Close Sales
                        </button>
                      )}
                      {draw.status !== 'SETTLED' && draw.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(draw.id, 'CANCELLED')}
                          className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[10px] font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Draw Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Schedule New Draw"
          maxWidth="md"
        >
          <form onSubmit={handleCreateDraw} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Draw Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Special Royale"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tier Slot
                </label>
                <select
                  value={tierKey}
                  onChange={(e: any) => setTierKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="morning">Morning (1:00 PM)</option>
                  <option value="day">Day (6:00 PM)</option>
                  <option value="evening">Evening (8:00 PM)</option>
                  <option value="custom">Custom Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Draw Time (HH:mm) *
                </label>
                <input
                  type="text"
                  required
                  value={drawTime}
                  onChange={(e) => setDrawTime(e.target.value)}
                  placeholder="20:00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Draw Date (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  required
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Jackpot Pot (Coins)
                </label>
                <input
                  type="number"
                  required
                  value={jackpotSeed}
                  onChange={(e) => setJackpotSeed(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md"
              >
                Schedule Draw
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
