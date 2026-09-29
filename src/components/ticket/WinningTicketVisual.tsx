import React from 'react';
import { Ticket, Draw, WinRecord } from '../../types';
import { formatDateTime, formatDate, formatCoins } from '../../utils';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Printer } from 'lucide-react';

interface WinningTicketVisualProps {
  ticket: Ticket;
  draw?: Draw;
  win?: WinRecord;
  theme?: 'emerald' | 'royal' | 'obsidian';
  onPrint?: () => void;
}

export const WinningTicketVisual: React.FC<WinningTicketVisualProps> = ({
  ticket,
  draw,
  win,
  theme = 'emerald',
  onPrint,
}) => {
  const digits = (ticket.number || '00000').padStart(5, '0').split('');
  const isWinner = ticket.status === 'won' || !!win;

  const themeStyles = {
    emerald: {
      bg: 'from-emerald-950 via-teal-950 to-slate-950',
      border: 'border-amber-400/40',
      accent: 'text-amber-300',
      boxBg: 'bg-emerald-900/60 border-amber-400/50 text-amber-200',
      headerBg: 'bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    },
    royal: {
      bg: 'from-blue-950 via-indigo-950 to-slate-950',
      border: 'border-cyan-400/40',
      accent: 'text-cyan-300',
      boxBg: 'bg-blue-900/60 border-cyan-400/50 text-cyan-200',
      headerBg: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.2)]',
    },
    obsidian: {
      bg: 'from-slate-950 via-zinc-900 to-black',
      border: 'border-yellow-500/40',
      accent: 'text-yellow-400',
      boxBg: 'bg-zinc-800/80 border-yellow-500/60 text-yellow-300',
      headerBg: 'bg-gradient-to-r from-yellow-500/20 via-zinc-800/40 to-yellow-500/20',
      glow: 'shadow-[0_0_25px_rgba(234,179,8,0.2)]',
    },
  }[theme];

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Action bar */}
      <div className="w-full flex justify-end mb-2 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save Ticket
        </button>
      </div>

      {/* Main Vector-Themed Ticket Card */}
      <div
        className={`w-full relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${themeStyles.bg} ${themeStyles.border} ${themeStyles.glow} p-5 text-white transition-all`}
      >
        {/* Decorative Guilloche SVG background lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0 20 Q 10 40, 20 20 T 40 20" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>

        {/* Top Branding Banner */}
        <div className={`relative flex items-center justify-between pb-3 border-b border-white/10 ${themeStyles.headerBg} -mx-5 -mt-5 px-5 pt-4`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wider text-amber-200">
                LUCKY BUZZ OFFICIAL TICKET
              </h3>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">
                Provably Fair Digital Entry
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-slate-300">
              #{ticket.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Draw Details */}
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Draw Name</span>
            <span className="font-semibold text-slate-100 text-sm">
              {draw?.name || 'Daily Express Draw'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Draw Date & Time</span>
            <span className="font-medium text-slate-200">
              {draw ? `${formatDate(draw.drawDate)} • ${draw.drawTime}` : 'Scheduled'}
            </span>
          </div>
        </div>

        {/* 5-Digit Boxes Display */}
        <div className="relative my-6">
          <p className="text-center text-[11px] uppercase tracking-widest text-amber-300/80 mb-2 font-medium">
            Registered Lucky Number
          </p>
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {digits.map((d, index) => (
              <div
                key={index}
                className={`w-11 h-14 sm:w-14 sm:h-18 rounded-xl border-2 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold shadow-inner ${themeStyles.boxBg}`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Multiplier / SEM and Cost */}
        <div className="relative grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-black/30 border border-white/5 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">SEM Multiplier</span>
            <span className="font-bold text-amber-400 text-sm">{ticket.sem} SEM</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Total Cost</span>
            <span className="font-bold text-slate-200 text-sm">{ticket.cost} 🪙</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Player</span>
            <span className="font-bold text-slate-200 text-sm truncate block">{ticket.userName}</span>
          </div>
        </div>

        {/* Winner Highlight Banner if won */}
        {isWinner && (
          <div className="relative mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 flex items-center justify-between animate-pulse-slow">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-300" />
              <div>
                <p className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                  WINNING TICKET — {ticket.winningRank?.toUpperCase() || win?.rank?.toUpperCase() || 'PRIZE WIN'}
                </p>
                <p className="text-[11px] text-amber-300/90">
                  Prize Credited: +{formatCoins(ticket.prizeAmount || win?.prizeAmount || 0)} Buzz Coins
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
          </div>
        )}

        {/* Perforated Divider */}
        <div className="relative my-4 border-b-2 border-dashed border-white/20 flex items-center justify-between">
          <div className="absolute -left-7 w-4 h-4 bg-slate-950 rounded-full" />
          <div className="absolute -right-7 w-4 h-4 bg-slate-950 rounded-full" />
        </div>

        {/* Bottom Security Stub with simulated Barcode & QR code */}
        <div className="relative flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="text-[10px] text-slate-400">
              <span>Security Stamp Verified</span>
              <span className="block font-mono text-slate-500">
                {ticket.createdAt ? formatDateTime(ticket.createdAt) : ''}
              </span>
            </div>
          </div>

          {/* Barcode visual lines */}
          <div className="flex items-center gap-0.5 h-8 px-2 bg-white/5 rounded">
            {[4, 2, 6, 3, 5, 2, 7, 4, 3, 6, 2, 5, 4, 2, 6, 3, 5].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-slate-300"
                style={{ height: `${h * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
