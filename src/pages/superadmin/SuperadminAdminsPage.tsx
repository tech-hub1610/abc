import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { User, Permission } from '../../types';
import { formatDateTime } from '../../utils';
import { Modal } from '../../components/common/Modal';
import { ShieldAlert, Plus, Edit2, Shield, UserX, UserCheck, Key, CheckCircle2 } from 'lucide-react';

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'dashboard.view', label: 'View Dashboard', group: 'Dashboard' },
  { key: 'players.view', label: 'View Players', group: 'Players' },
  { key: 'players.create', label: 'Create Players', group: 'Players' },
  { key: 'players.edit', label: 'Edit Players', group: 'Players' },
  { key: 'players.suspend', label: 'Suspend Players', group: 'Players' },
  { key: 'draws.view', label: 'View Draws', group: 'Draws' },
  { key: 'draws.create', label: 'Create Draws', group: 'Draws' },
  { key: 'draws.edit', label: 'Edit Draws', group: 'Draws' },
  { key: 'draws.settle', label: 'Settle Draws', group: 'Draws' },
  { key: 'draws.cancel', label: 'Cancel Draws', group: 'Draws' },
  { key: 'tickets.view', label: 'View Tickets', group: 'Tickets' },
  { key: 'tickets.manage', label: 'Manage Tickets', group: 'Tickets' },
  { key: 'results.view', label: 'View Results', group: 'Results' },
  { key: 'results.create', label: 'Create Results', group: 'Results' },
  { key: 'results.edit', label: 'Edit Results', group: 'Results' },
  { key: 'results.publish', label: 'Publish Results & Settle', group: 'Results' },
  { key: 'prizes.view', label: 'View Prize Configs', group: 'Prizes' },
  { key: 'wallet.view', label: 'View Wallet Transactions', group: 'Wallet' },
  { key: 'wallet.adjust', label: 'Adjust Player Coins', group: 'Wallet' },
  { key: 'bonuses.view', label: 'View Bonuses', group: 'Bonuses' },
  { key: 'bonuses.manage', label: 'Manage Bonuses', group: 'Bonuses' },
  { key: 'rewards.view', label: 'View Reward Boxes', group: 'Rewards' },
  { key: 'rewards.manage', label: 'Manage Reward Boxes', group: 'Rewards' },
  { key: 'reports.view', label: 'View Analytics Reports', group: 'Reports' },
  { key: 'reports.export', label: 'Export Data CSV', group: 'Reports' },
];

export const SuperadminAdminsPage: React.FC = () => {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('password123');
  const [permissions, setPermissions] = useState<Permission[]>([
    'dashboard.view',
    'players.view',
    'draws.view',
    'tickets.view',
    'results.view',
    'results.publish',
  ]);
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const allAdmins = await userService.getAdmins();
      setAdmins(allAdmins);
    } catch (e) {
      console.error('Failed to load admins:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleTogglePermission = (perm: Permission) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !fullName) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    try {
      await userService.createAdmin({
        username,
        email,
        fullName,
        password,
        permissions,
      });
      showToast(`Admin account for ${fullName} created successfully!`, 'success');
      setShowCreateModal(false);
      setUsername('');
      setEmail('');
      setFullName('');
      await loadAdmins();
    } catch (e: any) {
      showToast(e.message || 'Failed to create admin', 'error');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedAdminForEdit) return;
    try {
      await userService.updatePermissions(selectedAdminForEdit.id, permissions);
      showToast('Admin permissions updated successfully!', 'success');
      setSelectedAdminForEdit(null);
      await loadAdmins();
    } catch (e: any) {
      showToast(e.message || 'Failed to update permissions', 'error');
    }
  };

  const handleToggleStatus = async (admin: User) => {
    try {
      await userService.toggleStatus(admin.id, admin.status);
      showToast(`Admin ${admin.fullName} status updated`, 'info');
      await loadAdmins();
    } catch (e: any) {
      showToast(e.message || 'Status toggle failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Operational Admin Staff Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure delegated administration accounts and assign granular feature permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setUsername('');
            setEmail('');
            setFullName('');
            setPermissions([
              'dashboard.view',
              'players.view',
              'draws.view',
              'tickets.view',
              'results.view',
              'results.publish',
            ]);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-slate-100 font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Admin</span>
        </button>
      </div>

      {/* Admins Table / Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Admin Profile</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Assigned Permissions</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                        {admin.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{admin.fullName}</span>
                        <span className="text-[11px] text-slate-400">
                          @{admin.username} • {admin.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-300">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-300 font-mono">
                      {admin.permissions?.length || 0} permissions assigned
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        admin.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {admin.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAdminForEdit(admin);
                          setPermissions(admin.permissions || []);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1"
                        title="Edit Permissions"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Permissions</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`p-1.5 rounded-lg transition ${
                          admin.status === 'active'
                            ? 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                            : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
                        }`}
                        title={admin.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
                      >
                        {admin.status === 'active' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Operational Admin"
          maxWidth="xl"
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Draw Manager"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. manager1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@luckybuzz.io"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Permissions Selection Checklist */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Assign Operational Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                {ALL_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.key)}
                      onChange={() => handleTogglePermission(perm.key)}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-900"
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 font-bold text-xs text-white shadow-md transition"
              >
                Create Admin
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Permissions Modal */}
      {selectedAdminForEdit && (
        <Modal
          isOpen={!!selectedAdminForEdit}
          onClose={() => setSelectedAdminForEdit(null)}
          title={`Edit Permissions: ${selectedAdminForEdit.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Select or deselect capabilities for <strong>{selectedAdminForEdit.fullName}</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.key)}
                    onChange={() => handleTogglePermission(perm.key)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-900"
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAdminForEdit(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-md transition"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
