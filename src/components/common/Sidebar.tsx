import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Calendar,
  Trophy,
  Ticket,
  Award,
  Wallet,
  Gift,
  Flame,
  FileBarChart2,
  FileText,
  Settings,
  Palette,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'SUPERADMIN' | 'ADMIN';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, role }) => {
  const { hasPermission } = useAuth();

  const superadminNav = [
    { label: 'Overview', path: '/superadmin', icon: LayoutDashboard, exact: true },
    { label: 'Admin Management', path: '/superadmin/admins', icon: ShieldAlert },
    { label: 'Player Management', path: '/superadmin/players', icon: Users },
    { label: 'Roles & Permissions', path: '/superadmin/roles', icon: ShieldAlert },
    { label: 'Draw Management', path: '/superadmin/draws', icon: Calendar },
    { label: 'Results & Settlement', path: '/superadmin/results', icon: Trophy },
    { label: 'Prize Engine Config', path: '/superadmin/prizes', icon: Award },
    { label: 'Virtual Coin Ledger', path: '/superadmin/wallet', icon: Wallet },
    { label: 'Ticket Templates', path: '/superadmin/ticket-templates', icon: Palette },
    { label: 'Analytics & Reports', path: '/superadmin/reports', icon: FileBarChart2 },
    { label: 'Audit Security Log', path: '/superadmin/audit', icon: FileText },
    { label: 'System Settings', path: '/superadmin/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, exact: true, permission: 'dashboard.view' as Permission },
    { label: 'Players', path: '/admin/players', icon: Users, permission: 'players.view' as Permission },
    { label: 'Draws', path: '/admin/draws', icon: Calendar, permission: 'draws.view' as Permission },
    { label: 'Tickets', path: '/admin/tickets', icon: Ticket, permission: 'tickets.view' as Permission },
    { label: 'Results & Winner Settlement', path: '/admin/results', icon: Trophy, permission: 'results.view' as Permission },
    { label: 'Bonuses & Streaks', path: '/admin/bonuses', icon: Flame, permission: 'bonuses.view' as Permission },
    { label: 'Surprise Boxes', path: '/admin/rewards', icon: Gift, permission: 'rewards.view' as Permission },
    { label: 'Reports', path: '/admin/reports', icon: FileBarChart2, permission: 'reports.view' as Permission },
  ];

  const navItems = role === 'SUPERADMIN'
    ? superadminNav
    : adminNav.filter((item) => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-0`}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-300">
              {role === 'SUPERADMIN' ? 'Superadmin Portal' : 'Admin Control Panel'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? role === 'SUPERADMIN'
                        ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-gradient-to-r from-amber-500/20 to-emerald-500/10 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500">
          <p className="font-mono">LuckyBuzz v1.0.0 (Vite MVP)</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Supabase Backend Ready</p>
        </div>
      </aside>
    </>
  );
};
