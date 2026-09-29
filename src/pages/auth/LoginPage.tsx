import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchUserRole, seedUsers } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter both username/email and password.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier, password);
      showToast(`Welcome back, ${user.fullName || user.username}!`, 'success');
      if (user.role === 'SUPERADMIN') navigate('/superadmin');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/player');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: any) => {
    await switchUserRole(user);
    showToast(`Logged in as ${user.fullName} (${user.role})`, 'success');
    if (user.role === 'SUPERADMIN') navigate('/superadmin');
    else if (user.role === 'ADMIN') navigate('/admin');
    else navigate('/player');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-950/80 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
          Sign In to Lucky Buzz
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Free numbers lottery & provably fair daily draws (Virtual coins only)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. player@luckybuzz.io"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-sm text-white shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              New player?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2">
                Create free account (+1,500 coins gift)
              </Link>
            </p>
          </div>

          {/* Seed Demo Account Shortcuts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 text-center mb-3">
              One-Tap Demo Credentials (MVP)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {seedUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {u.fullName || u.username}
                      </span>
                      <span className="text-[10px] text-slate-500">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-amber-300">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
