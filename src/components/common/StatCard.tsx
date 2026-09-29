import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
}) => {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20 text-amber-400',
    blue: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-400',
    rose: 'from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-400',
    purple: 'from-purple-500/10 to-violet-500/5 border-purple-500/20 text-purple-400',
  };

  const iconBgMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-4 sm:p-5 backdrop-blur-sm transition hover:border-slate-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">{title}</p>
          <h4 className="mt-1 text-xl sm:text-2xl font-bold font-mono text-slate-100">{value}</h4>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {trend}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-xl border ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
