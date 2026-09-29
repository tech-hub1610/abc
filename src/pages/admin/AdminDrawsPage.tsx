import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services/drawService';
import { Draw, DrawStatus } from '../../types';
import { formatCoins, formatTime, formatDate } from '../../utils';
import { Modal } from '../../components/common/Modal';
import { Calendar, Plus } from 'lucide-react';

export const AdminDrawsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [tierKey, setTierKey] = useState<'morning' | 'day' | 'evening' | 'custom'>('morning');
  const [drawTime, setDrawTime] = useState('18:00');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);

  const load = async () => {
    const all = await drawService.getAll();
    setDraws(all);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await drawService.createDraw({
        name,
        tierKey,
        drawTime,
        drawDate,
        actorId: user?.id,
        actorName: user?.fullName,
      });
      showToast('Draw created successfully', 'success');
      setShowCreate(false);
      setName('');
      await load();
    } catch (e: any) {
      showToast(e.message || 'Failed to create draw', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: DrawStatus) => {
    try {
      await drawService.updateStatus(id, status, user?.id, user?.fullName);
      showToast(`Status updated to ${status}`, 'info');
      await load();
    } catch (e: any) {
      showToast(e.message || 'Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Draws Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational control of draw status windows and schedules.
          </p>
        </div>

        {hasPermission('draws.create') && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Draw</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Draw Title</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Pot</th>
                <th className="px-5 py-3.5">Tickets Sold</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {draws.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-200">{d.name}</td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {formatDate(d.drawDate)} • {formatTime(d.drawTime)}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-300">
                    {formatCoins(d.jackpotSeed)} 🪙
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{d.totalTicketsSold}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {hasPermission('draws.edit') && (
                      <div className="flex items-center justify-end gap-1">
                        {d.status === 'OPEN' && (
                          <button
                            onClick={() => handleStatusChange(d.id, 'CLOSED')}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px]"
                          >
                            Close Sales
                          </button>
                        )}
                        {d.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStatusChange(d.id, 'OPEN')}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px]"
                          >
                            Open Sales
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule New Draw">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Draw Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Afternoon Premier"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Time (HH:mm)</label>
                <input
                  type="text"
                  required
                  value={drawTime}
                  onChange={(e) => setDrawTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950">
                Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
