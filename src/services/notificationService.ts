import { InAppNotification } from '../types';
import { LocalStorageNotificationRepository } from './repositories/localStorage';
import { generateId } from '../utils';

const notifRepo = new LocalStorageNotificationRepository();

export class NotificationService {
  async getForUser(userId: string): Promise<InAppNotification[]> {
    return notifRepo.getAll(userId);
  }

  async send(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'win' | 'bonus';
    actionUrl?: string;
  }): Promise<InAppNotification> {
    const notif: InAppNotification = {
      id: generateId('notif'),
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      read: false,
      actionUrl: params.actionUrl,
      createdAt: new Date().toISOString(),
    };
    return notifRepo.create(notif);
  }

  async markAsRead(id: string): Promise<void> {
    return notifRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return notifRepo.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
