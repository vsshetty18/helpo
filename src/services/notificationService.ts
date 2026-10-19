import { apiClient } from './apiClient';
import { EmergencyNotification, NotificationChannel } from '../types/notification';

export const notificationService = {
  async getNotifications(): Promise<EmergencyNotification[]> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<EmergencyNotification[]>('/notifications');
    }
    return [];
  },

  async dispatchEmergencyAlert(
    incidentId: string,
    channel: NotificationChannel,
    recipient: string,
    phone: string
  ): Promise<EmergencyNotification> {
    if (!apiClient.isMockMode) {
      return await apiClient.post<EmergencyNotification>('/notifications/dispatch', {
        incidentId,
        channel,
        recipient,
        phone
      });
    }
    throw new Error('In mock mode, use store.sendEmergencyAlert');
  },

  async retryAlert(notificationId: string): Promise<EmergencyNotification> {
    if (!apiClient.isMockMode) {
      return await apiClient.post<EmergencyNotification>(`/notifications/${notificationId}/retry`);
    }
    throw new Error('In mock mode, use store.retryNotification');
  }
};
