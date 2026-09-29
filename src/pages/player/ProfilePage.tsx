import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { InAppNotification } from '../../types';
import { formatDateTime, formatDate } from '../../utils';
import { User, Bell, Shield, Save, CheckCircle2, Flame, Coins, Phone, Mail } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, walletBalance, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await notificationService.getForUser(user.id);
    setNotifications(notifs);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      await userService.update(user.id, { fullName, phone });
      await refreshUserData();
      showToast('Profile updated successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    await loadNotifications();
    showToast('All notifications marked as read', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>Player Profile & Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage account information, contact preferences, and view notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.fullName || 'Avatar'}
              className="w-full h-full rounded-[14px] object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">{user?.fullName || user?.username}</h3>
            <p className="text-xs text-slate-400 font-mono">@{user?.username}</p>
          </div>

          <div className="w-full pt-3 border-t border-slate-800 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="font-bold text-emerald-400">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Status:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Streak:</span>
              <span className="font-mono font-bold text-amber-300">Day {user?.streak || 1} 🔥</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h4 className="font-display text-sm font-bold text-slate-200 mb-4">
            Edit Personal Information
          </h4>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Notifications Inbox */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display text-sm font-bold text-slate-200">
              In-App Notifications Inbox
            </h4>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-400 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No notifications in your inbox.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`py-3 flex items-start justify-between gap-3 text-xs ${
                  !notif.read ? 'bg-emerald-950/20 -mx-5 px-5' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
