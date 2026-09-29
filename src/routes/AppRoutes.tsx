import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { PlayerLayout } from '../layouts/PlayerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { SuperadminLayout } from '../layouts/SuperadminLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Player Pages
import { PlayerDashboard } from '../pages/player/PlayerDashboard';
import { PlayPage } from '../pages/player/PlayPage';
import { MyTicketsPage } from '../pages/player/MyTicketsPage';
import { ResultsPage } from '../pages/player/ResultsPage';
import { WinsPage } from '../pages/player/WinsPage';
import { WalletPage } from '../pages/player/WalletPage';
import { BonusesPage } from '../pages/player/BonusesPage';
import { RewardsPage } from '../pages/player/RewardsPage';
import { ProfilePage } from '../pages/player/ProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminPlayersPage } from '../pages/admin/AdminPlayersPage';
import { AdminDrawsPage } from '../pages/admin/AdminDrawsPage';
import { AdminTicketsPage } from '../pages/admin/AdminTicketsPage';
import { AdminResultsPage } from '../pages/admin/AdminResultsPage';
import { AdminBonusesPage } from '../pages/admin/AdminBonusesPage';
import { AdminRewardsPage } from '../pages/admin/AdminRewardsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';

// Superadmin Pages
import { SuperadminDashboard } from '../pages/superadmin/SuperadminDashboard';
import { SuperadminAdminsPage } from '../pages/superadmin/SuperadminAdminsPage';
import { SuperadminPlayersPage } from '../pages/superadmin/SuperadminPlayersPage';
import { SuperadminRolesPage } from '../pages/superadmin/SuperadminRolesPage';
import { SuperadminDrawsPage } from '../pages/superadmin/SuperadminDrawsPage';
import { SuperadminResultsPage } from '../pages/superadmin/SuperadminResultsPage';
import { SuperadminPrizesPage } from '../pages/superadmin/SuperadminPrizesPage';
import { SuperadminWalletPage } from '../pages/superadmin/SuperadminWalletPage';
import { SuperadminTicketTemplatesPage } from '../pages/superadmin/SuperadminTicketTemplatesPage';
import { SuperadminReportsPage } from '../pages/superadmin/SuperadminReportsPage';
import { SuperadminAuditPage } from '../pages/superadmin/SuperadminAuditPage';
import { SuperadminSettingsPage } from '../pages/superadmin/SuperadminSettingsPage';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'SUPERADMIN') return '/superadmin';
    if (user.role === 'ADMIN') return '/admin';
    return '/player';
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Player Route Group */}
      <Route
        path="/player"
        element={
          <ProtectedRoute allowedRoles={['PLAYER', 'ADMIN', 'SUPERADMIN']}>
            <PlayerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlayerDashboard />} />
        <Route path="play" element={<PlayPage />} />
        <Route path="tickets" element={<MyTicketsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="wins" element={<WinsPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="bonuses" element={<BonusesPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Route Group */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route
          path="players"
          element={
            <ProtectedRoute requiredPermission="players.view">
              <AdminPlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="draws"
          element={
            <ProtectedRoute requiredPermission="draws.view">
              <AdminDrawsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tickets"
          element={
            <ProtectedRoute requiredPermission="tickets.view">
              <AdminTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="results"
          element={
            <ProtectedRoute requiredPermission="results.view">
              <AdminResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bonuses"
          element={
            <ProtectedRoute requiredPermission="bonuses.view">
              <AdminBonusesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="rewards"
          element={
            <ProtectedRoute requiredPermission="rewards.view">
              <AdminRewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredPermission="reports.view">
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Superadmin Route Group */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <SuperadminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperadminDashboard />} />
        <Route path="admins" element={<SuperadminAdminsPage />} />
        <Route path="players" element={<SuperadminPlayersPage />} />
        <Route path="roles" element={<SuperadminRolesPage />} />
        <Route path="draws" element={<SuperadminDrawsPage />} />
        <Route path="results" element={<SuperadminResultsPage />} />
        <Route path="prizes" element={<SuperadminPrizesPage />} />
        <Route path="wallet" element={<SuperadminWalletPage />} />
        <Route path="ticket-templates" element={<SuperadminTicketTemplatesPage />} />
        <Route path="reports" element={<SuperadminReportsPage />} />
        <Route path="audit" element={<SuperadminAuditPage />} />
        <Route path="settings" element={<SuperadminSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
