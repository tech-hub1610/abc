import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import { WalletTransaction } from '../../types';
import { formatCoins, formatDateTime } from '../../utils';
import { Coins, ArrowDownLeft, ArrowUpRight, Search, History } from 'lucide-react';

export const SuperadminWalletPage: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTx = async () => {
      try {
        setLoading(true);
        const all = await walletService.getTransactions();
        setTransactions(all);
      } finally {
        setLoading(false);
      }
    };
    loadTx();
  }, []);

  const filteredTx = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.description.toLowerCase().includes(term) ||
      t.reason.toLowerCase().includes(term) ||
      t.userId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <span>Global Virtual Coin Ledger & Movement</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full transparent audit history of all coin debits, prize credits, and system adjustments.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter transactions..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Global Transaction Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Transaction Type</th>
                <th className="px-5 py-3.5">User ID</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Balance After</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTx.map((tx) => {
                const isCredit = tx.type === 'CREDIT';
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        isCredit
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{tx.reason.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      {tx.userId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-200">
                      {tx.description}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold">
                      <span className={isCredit ? 'text-emerald-400' : 'text-slate-300'}>
                        {isCredit ? `+${formatCoins(tx.amount)}` : formatCoins(tx.amount)} 🪙
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {formatCoins(tx.balanceAfter)} 🪙
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 font-mono text-[10px]">
                      {formatDateTime(tx.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
