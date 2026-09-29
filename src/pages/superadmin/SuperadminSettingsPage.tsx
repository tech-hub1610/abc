import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { Settings, Save, RotateCcw, Download, Upload, ShieldAlert, Sparkles, Database } from 'lucide-react';

export const SuperadminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDatabase, reloadSettings } = useSettings();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    appName: settings.appName,
    tagline: settings.tagline,
    coinName: settings.coinName,
    coinSymbol: settings.coinSymbol,
    ticketCost: settings.ticketCost,
    defaultStartingBalance: settings.defaultStartingBalance,
    dailyBonusBase: settings.dailyBonusBase,
    streakBonus: settings.streakBonus,
    streakBonusMax: settings.streakBonusMax,
    refillFloor: settings.refillFloor,
    refillAmount: settings.refillAmount,
    refillDailyCap: settings.refillDailyCap,
  });

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(form);
      showToast('Application settings saved successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset all Local Storage tables to initial seed demo data?')) {
      return;
    }
    try {
      setResetting(true);
      await resetDatabase();
      showToast('Database reset to fresh demo seed data!', 'success');
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      showToast(e.message || 'Reset failed', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleExportJson = () => {
    const json = storageService.exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luckybuzz_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Database backup JSON exported', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = storageService.importDatabase(content);
      if (success) {
        showToast('Database imported successfully! Reloading...', 'success');
        await reloadSettings();
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast('Failed to parse database backup JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          <span>System Settings & Data Management</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure app branding, virtual coin economics, starting bonuses, and seed data controls.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding & General */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-200">
            Branding & Display
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Application Name
              </label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Virtual Coin Name
              </label>
              <input
                type="text"
                value={form.coinName}
                onChange={(e) => setForm({ ...form, coinName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Coin Emoji Symbol
              </label>
              <input
                type="text"
                value={form.coinSymbol}
                onChange={(e) => setForm({ ...form, coinSymbol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Game Economics & Bonuses */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h3 className="font-display text-sm font-bold text-slate-200">
            Game Economics & Virtual Coin Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Base Ticket Cost / SEM (Coins)
              </label>
              <input
                type="number"
                value={form.ticketCost}
                onChange={(e) => setForm({ ...form, ticketCost: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Welcome Starting Balance (Coins)
              </label>
              <input
                type="number"
                value={form.defaultStartingBalance}
                onChange={(e) => setForm({ ...form, defaultStartingBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Daily Bonus Base (Coins)
              </label>
              <input
                type="number"
                value={form.dailyBonusBase}
                onChange={(e) => setForm({ ...form, dailyBonusBase: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Streak Step Increment (Coins)
              </label>
              <input
                type="number"
                value={form.streakBonus}
                onChange={(e) => setForm({ ...form, streakBonus: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Refill Floor Threshold
              </label>
              <input
                type="number"
                value={form.refillFloor}
                onChange={(e) => setForm({ ...form, refillFloor: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Pocket Refill Amount
              </label>
              <input
                type="number"
                value={form.refillAmount}
                onChange={(e) => setForm({ ...form, refillAmount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration Changes'}</span>
        </button>
      </form>

      {/* Database Backup, Import & Seed Reset Tool */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-400" />
          <h3 className="font-display text-sm font-bold text-slate-200">
            Local Storage Database Controls (MVP Testing Tools)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Tools for backing up local collections or resetting back to pristine seed data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Database JSON</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Import Database JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset All to Seed Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
