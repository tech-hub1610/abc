import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils';
import { FileText, Search, Shield, Filter } from 'lucide-react';

export const SuperadminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const all = await auditService.getAll();
        setLogs(all);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      log.target.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-400" />
            <span>Security Audit & Operation Log</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable operation trace: admin actions, logins, settlements, coin adjustments, and permission changes.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action or actor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-rose-300">
                    {log.action}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-200 block">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({log.actorRole})</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {log.target}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {log.description}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
