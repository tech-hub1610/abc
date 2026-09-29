import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, Ticket, Trophy, Gift, Wallet, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/player', icon: LayoutDashboard, exact: true },
    { label: 'Play', path: '/player/play', icon: PlayCircle },
    { label: 'Tickets', path: '/player/tickets', icon: Ticket },
    { label: 'Results', path: '/player/results', icon: Trophy },
    { label: 'Rewards', path: '/player/rewards', icon: Gift },
    { label: 'Wallet', path: '/player/wallet', icon: Wallet },
    { label: 'Profile', path: '/player/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-semibold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
