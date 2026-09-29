import { AppSettings, TicketTemplate } from '../types';
import {
  LocalStorageSettingsRepository,
  LocalStorageTicketTemplateRepository,
  initializeLocalStorageDatabase,
} from './repositories/localStorage';
import { auditService } from './auditService';

const settingsRepo = new LocalStorageSettingsRepository();
const templateRepo = new LocalStorageTicketTemplateRepository();

export class SettingsService {
  async getSettings(): Promise<AppSettings> {
    return settingsRepo.getSettings();
  }

  async updateSettings(updates: Partial<AppSettings>, actorId?: string, actorName?: string): Promise<AppSettings> {
    const current = await settingsRepo.getSettings();
    const updated = await settingsRepo.saveSettings({ ...current, ...updates });

    if (actorId) {
      await auditService.log({
        actorId,
        actorName: actorName || 'Superadmin',
        actorRole: 'SUPERADMIN',
        action: 'SETTINGS_UPDATE',
        target: 'System Settings',
        description: 'Updated application settings configuration',
        metadata: updates,
      });
    }

    return updated;
  }

  async getTicketTemplates(): Promise<TicketTemplate[]> {
    return templateRepo.getAll();
  }

  async setActiveTemplate(templateId: string): Promise<AppSettings> {
    return this.updateSettings({ activeTicketTemplateId: templateId });
  }

  async resetDatabase(actorId?: string, actorName?: string): Promise<void> {
    initializeLocalStorageDatabase(true);
    if (actorId) {
      await auditService.log({
        actorId,
        actorName: actorName || 'Superadmin',
        actorRole: 'SUPERADMIN',
        action: 'DATABASE_RESET',
        target: 'LocalStorage',
        description: 'Reset local storage database to initial seed dataset.',
      });
    }
  }
}

export const settingsService = new SettingsService();
