import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { SEED_USERS } from '../data/seedData';
import { initializeLocalStorageDatabase } from '../services/repositories/localStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  walletBalance: number;
  login: (identifier: string, pass: string) => Promise<User>;
  register: (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  switchUserRole: (roleUser: User) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  refreshUserData: () => Promise<void>;
  seedUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const balance = await walletService.getBalance(currentUser.id);
        setWalletBalance(balance);
      } else {
        setWalletBalance(0);
      }
    } catch (e) {
      console.error('Failed to refresh user auth state:', e);
    }
  };

  useEffect(() => {
    // Initialize LocalStorage database on first load
    initializeLocalStorageDatabase();
    refreshUserData().finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, pass: string): Promise<User> => {
    const loggedUser = await authService.login(identifier, pass);
    await refreshUserData();
    return loggedUser;
  };

  const register = async (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    phone?: string;
  }): Promise<User> => {
    const newUser = await authService.register(data);
    await refreshUserData();
    return newUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setWalletBalance(0);
  };

  const switchUserRole = async (targetUser: User) => {
    await authService.switchSession(targetUser);
    await refreshUserData();
  };

  const hasPermission = (permission: Permission): boolean => {
    return authService.hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        walletBalance,
        login,
        register,
        logout,
        switchUserRole,
        hasPermission,
        refreshUserData,
        seedUsers: SEED_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
