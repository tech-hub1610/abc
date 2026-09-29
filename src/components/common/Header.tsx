import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCoins } from '../../utils';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coins,
  Bell,
  LogOut,
  UserCheck,
  Menu,
  Sparkles,
  ChevronDown,
  Shield,
  User as UserIcon,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, walletBalance, logout, switchUserRole, seedUsers } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors = {
    SUPERADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    ADMIN: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    PLAYER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Branding & Menu button */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:scale-95 transition">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <span className="font-display text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                {settings.appName}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 tracking-wider uppercase font-medium">
                Numbers & Draws MVP
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Balance, Role Switcher Demo, Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && user.role === 'PLAYER' && (
            <Link
              to="/player/wallet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border border-amber-400/30 hover:border-amber-400/60 transition group"
            >
              <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition" />
              <span className="font-mono text-xs sm:text-sm font-bold text-amber-300">
                {formatCoins(walletBalance)}
              </span>
              <span className="text-[10px] text-amber-400/70 hidden xs:inline">🪙</span>
            </Link>
          )}

          {/* Simulated Demo Role Quick-Switcher Dropdown for MVP */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              title="Switch demo account for quick testing"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Demo Switch:</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  user ? roleColors[user.role] : 'bg-slate-800 text-slate-400'
                }`}
              >
                {user ? user.role : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Instant Demo Switcher (MVP)
                  </p>
                </div>
                {seedUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={async () => {
                      await switchUserRole(u);
                      setShowRoleSwitcher(false);
                      if (u.role === 'SUPERADMIN') navigate('/superadmin');
                      else if (u.role === 'ADMIN') navigate('/admin');
                      else navigate('/player');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition ${
                      user?.id === u.id
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{u.fullName || u.username}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleColors[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          {user && (
            <Link
              to={user.role === 'PLAYER' ? '/player/profile' : '#'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          )}

          {/* Logout button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
