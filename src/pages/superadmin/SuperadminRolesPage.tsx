import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const SuperadminRolesPage: React.FC = () => {
  const roles = [
    {
      name: 'SUPERADMIN',
      description: 'Root System Administrator with full unbounded access to all application settings, staff management, draws, prize calculations, economic ledger, and audit traces.',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      access: ['All Management Modules', 'Database Reset & Migrations', 'Audit Logs Inspection', 'Full Staff Permission Assignment'],
    },
    {
      name: 'ADMIN',
      description: 'Operational manager with privileges explicitly granted by Superadmin. Cannot manage other Admins or reset system database.',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      access: ['Draws Scheduling (Permitted)', 'Manual Result Entry & Settlement', 'Player Account Oversight', 'Reports Inspection'],
    },
    {
      name: 'PLAYER',
      description: 'Customer/Gamer role restricted strictly to their own wallet, tickets, winnings, streak bonuses, surprise boxes, and profile.',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      access: ['Ticket Purchasing', 'Quick Pick Generation', 'Bonus Streak Claims', 'Surprise Box Openings', 'Wallet Ledger'],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          <span>Role Hierarchy & Permission Matrix</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Clear separation of Superadmin, Admin, and Player security boundaries prepared for Supabase Row Level Security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between"
          >
            <div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${r.badge}`}>
                {r.name}
              </span>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{r.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Privileges:
              </span>
              {r.access.map((acc, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{acc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
