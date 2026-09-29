import { AuditLog, UserRole } from '../types';
import { LocalStorageAuditRepository } from './repositories/localStorage';
import { generateId } from '../utils';

const auditRepo = new LocalStorageAuditRepository();

export class AuditService {
  async getAll(): Promise<AuditLog[]> {
    return auditRepo.getAll();
  }

  async log(params: {
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    action: string;
    target: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const entry: AuditLog = {
      id: generateId('aud'),
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      target: params.target,
      description: params.description,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
    };
    return auditRepo.create(entry);
  }
}

export const auditService = new AuditService();
