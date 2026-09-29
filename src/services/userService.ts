import { User, UserRole, Permission } from '../types';
import { LocalStorageUserRepository } from './repositories/localStorage';
import { auditService } from './auditService';
import { generateId } from '../utils';

const userRepo = new LocalStorageUserRepository();

export class UserService {
  async getAll(): Promise<User[]> {
    return userRepo.getAll();
  }

  async getPlayers(): Promise<User[]> {
    const all = await userRepo.getAll();
    return all.filter((u) => u.role === 'PLAYER');
  }

  async getAdmins(): Promise<User[]> {
    const all = await userRepo.getAll();
    return all.filter((u) => u.role === 'ADMIN');
  }

  async getById(id: string): Promise<User | null> {
    return userRepo.getById(id);
  }

  async createAdmin(data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    permissions: Permission[];
  }): Promise<User> {
    const newAdmin: User = {
      id: generateId('usr_adm'),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      fullName: data.fullName.trim(),
      password: data.password,
      role: 'ADMIN',
      status: 'active',
      permissions: data.permissions,
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return userRepo.create(newAdmin);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    return userRepo.update(id, updates);
  }

  async toggleStatus(id: string, currentStatus: 'active' | 'suspended' | 'inactive'): Promise<User> {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = await userRepo.update(id, { status: newStatus });
    await auditService.log({
      actorId: 'system',
      actorName: 'Administrator',
      actorRole: 'SUPERADMIN',
      action: 'USER_STATUS_CHANGE',
      target: id,
      description: `User status changed to ${newStatus}`,
    });
    return updated;
  }

  async updatePermissions(id: string, permissions: Permission[]): Promise<User> {
    const updated = await userRepo.update(id, { permissions });
    await auditService.log({
      actorId: 'system',
      actorName: 'Superadmin',
      actorRole: 'SUPERADMIN',
      action: 'PERMISSIONS_UPDATE',
      target: id,
      description: `Updated permissions for admin ${id}`,
    });
    return updated;
  }

  async delete(id: string): Promise<void> {
    return userRepo.delete(id);
  }
}

export const userService = new UserService();
