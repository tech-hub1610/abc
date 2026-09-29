import { User, UserRole, Permission } from '../types';
import {
  LocalStorageAuthRepository,
  LocalStorageUserRepository,
} from './repositories/localStorage';
import { auditService } from './auditService';
import { walletService } from './walletService';
import { generateId } from '../utils';

const authRepo = new LocalStorageAuthRepository();
const userRepo = new LocalStorageUserRepository();

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    return authRepo.getCurrentSessionUser();
  }

  async login(identifier: string, pass: string): Promise<User> {
    const user = await authRepo.findByEmailOrUsername(identifier);
    if (!user) {
      throw new Error('User not found with provided username or email.');
    }
    if (user.password && user.password !== pass) {
      throw new Error('Invalid credentials.');
    }
    if (user.status === 'suspended') {
      throw new Error('This account has been suspended. Please contact administration.');
    }

    await authRepo.setCurrentSessionUser(user);
    await auditService.log({
      actorId: user.id,
      actorName: user.fullName || user.username,
      actorRole: user.role,
      action: 'USER_LOGIN',
      target: user.id,
      description: `User ${user.username} logged in successfully.`,
    });

    return user;
  }

  async register(data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    const existing = await authRepo.findByEmailOrUsername(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const existingUser = await authRepo.findByEmailOrUsername(data.username);
    if (existingUser) {
      throw new Error('This username is already taken. Please choose another.');
    }

    const newUser: User = {
      id: generateId('usr'),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      fullName: data.fullName.trim(),
      password: data.password,
      phone: data.phone?.trim() || '',
      role: 'PLAYER',
      status: 'active',
      streak: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRepo.create(newUser);
    // Initialize starting virtual coins
    await walletService.credit(
      newUser.id,
      1500,
      'starting_balance',
      'Welcome gift — starting virtual coins'
    );

    await authRepo.setCurrentSessionUser(newUser);

    await auditService.log({
      actorId: newUser.id,
      actorName: newUser.fullName,
      actorRole: newUser.role,
      action: 'USER_REGISTER',
      target: newUser.id,
      description: `New player ${newUser.username} registered with starting balance of 1500 coins.`,
    });

    return newUser;
  }

  async logout(): Promise<void> {
    const current = await this.getCurrentUser();
    if (current) {
      await auditService.log({
        actorId: current.id,
        actorName: current.fullName || current.username,
        actorRole: current.role,
        action: 'USER_LOGOUT',
        target: current.id,
        description: `User ${current.username} logged out.`,
      });
    }
    await authRepo.setCurrentSessionUser(null);
  }

  async switchSession(user: User): Promise<void> {
    await authRepo.setCurrentSessionUser(user);
  }

  hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    if (user.role === 'ADMIN') {
      return !!user.permissions?.includes(permission);
    }
    return false;
  }
}

export const authService = new AuthService();
