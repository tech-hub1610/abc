import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { WinningTicketVisual } from '../../components/ticket/WinningTicketVisual';
import { Palette, CheckCircle2 } from 'lucide-react';

export const SuperadminTicketTemplatesPage: React.FC = () => {
  const { templates, activeTemplate, setActiveTemplate } = useSettings();
  const { showToast } = useToast();

  const [selectedThemeForPreview, setSelectedThemeForPreview] = useState<'emerald' | 'royal' | 'obsidian'>('emerald');

  const dummyTicket = {
    id: 'tkt_demo_sample_999',
    drawId: 'drw_sample',
    userId: 'usr_sample',
    userName: 'Vikram Sharma',
    number: '48291',
    sem: 5,
    cost: 60,
    status: 'won' as const,
    winningRank: 'jackpot' as const,
    prizeAmount: 30000,
    settledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const dummyDraw = {
    id: 'drw_sample',
    name: 'Evening 8:00 PM Jackpot Royale',
    tierKey: 'evening' as const,
    drawTime: '20:00',
    drawDate: new Date().toISOString().split('T')[0],
    drawAt: new Date().toISOString(),
    status: 'SETTLED' as const,
    jackpotSeed: 50000,
    ticketCost: 12,
    accentColor: 'blue',
    nonce: 'demo_nonce_123',
    commitment: 'demo_commitment_hash',
    totalTicketsSold: 120,
    totalCoinsCollected: 7200,
    createdAt: new Date().toISOString(),
  };

  const handleSelectTemplate = async (templateId: string, theme: string) => {
    try {
      await setActiveTemplate(templateId);
      const validTheme: 'emerald' | 'royal' | 'obsidian' =
        theme === 'royal' ? 'royal' : theme === 'obsidian' ? 'obsidian' : 'emerald';
      setSelectedThemeForPreview(validTheme);
      showToast('Active ticket visual template updated!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to set template', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Palette className="w-6 h-6 text-emerald-400" />
          <span>Ticket Visual Design & Template Management</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Modern vector ticket themes with SVG guilloche patterns, gold filigree, barcode stamping, and custom styles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Selection List */}
        <div className="space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-200">Available Ticket Styles</h3>
          {templates.map((tmpl) => {
            const isActive = activeTemplate?.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id, tmpl.theme)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: tmpl.previewColor }}
                    />
                    <h4 className="font-bold text-sm text-slate-100">{tmpl.name}</h4>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">{tmpl.description}</p>
              </div>
            );
          })}
        </div>

        {/* Live Vector Ticket Preview */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col items-center justify-center">
          <span className="text-xs uppercase font-semibold text-slate-400 mb-4 tracking-wider">
            Live Vector Ticket Output Preview
          </span>
          <WinningTicketVisual
            ticket={dummyTicket}
            draw={dummyDraw}
            theme={selectedThemeForPreview}
          />
        </div>
      </div>
    </div>
  );
};
