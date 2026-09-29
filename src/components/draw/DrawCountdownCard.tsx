import React, { useState, useEffect } from 'react';
import { Draw } from '../../types';
import { formatCoins, formatTime, formatDate } from '../../utils';
import { Sparkles, Clock, Ticket, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DrawCountdownCardProps {
  draw: Draw;
  onQuickPlay?: (draw: Draw) => void;
}

export const DrawCountdownCard: React.FC<DrawCountdownCardProps> = ({ draw, onQuickPlay }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      // Calculate remaining time until drawTime today
      const now = new Date();
      const [h, m] = draw.drawTime.split(':').map((n) => parseInt(n, 10));
      const target = new Date(draw.drawDate);
      target.setHours(h, m, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [draw]);

  const tierGradients = {
    morning: 'from-emerald-950/80 via-slate-900 to-teal-950/40 border-emerald-500/30',
    day: 'from-amber-950/80 via-slate-900 to-yellow-950/40 border-amber-500/30',
    evening: 'from-blue-950/80 via-slate-900 to-indigo-950/40 border-blue-500/30',
    custom: 'from-purple-950/80 via-slate-900 to-pink-950/40 border-purple-500/30',
  }[draw.tierKey || 'custom'];

  const statusBadge = {
    OPEN: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    SCHEDULED: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    CLOSED: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    DRAWING: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
    SETTLED: 'bg-slate-800 text-slate-300 border-slate-700',
    CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[draw.status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tierGradients} p-5 backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                {draw.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {formatDate(draw.drawDate)}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-base sm:text-lg font-bold text-slate-100">
              {draw.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Draw Time</span>
            <span className="text-sm font-bold font-mono text-amber-300 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(draw.drawTime)}
            </span>
          </div>
        </div>

        {/* Jackpot / Seed Highlights */}
        <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80 block font-semibold">
              Straight Jackpot Pot
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-amber-300">
              {formatCoins(draw.jackpotSeed)} <span className="text-xs text-amber-400 font-normal">🪙</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Entry / SEM</span>
            <span className="text-xs font-semibold text-slate-300">
              {draw.ticketCost} coins / SEM
            </span>
          </div>
        </div>

        {/* Settled Result Display or Countdown */}
        {draw.status === 'SETTLED' && draw.resultNumber ? (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center">
            <span className="text-[10px] uppercase tracking-widest text-emerald-300 block font-semibold">
              Official Winning Number
            </span>
            <div className="flex justify-center gap-1.5 my-1.5 font-mono text-xl font-black text-amber-300">
              {draw.resultNumber.split('').map((d, i) => (
                <span
                  key={i}
                  className="w-8 h-9 rounded bg-emerald-900 border border-amber-400/60 flex items-center justify-center shadow-inner"
                >
                  {d}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-slate-300">
              {draw.totalWinnersCount || 0} winning tickets settled
            </span>
          </div>
        ) : timeLeft ? (
          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <span className="text-[11px] text-slate-400 font-sans">Closes in:</span>
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <span className="px-1.5 py-0.5 rounded bg-slate-900">{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span className="px-1.5 py-0.5 rounded bg-slate-900">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Ticket className="w-3.5 h-3.5" />
          <span>{draw.totalTicketsSold} entered</span>
        </div>

        {draw.status === 'OPEN' || draw.status === 'SCHEDULED' ? (
          <Link
            to={`/player/play?drawId=${draw.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 transition group"
          >
            <span>Play Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        ) : (
          <Link
            to="/player/results"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <span>View Result</span>
          </Link>
        )}
      </div>
    </div>
  );
};
