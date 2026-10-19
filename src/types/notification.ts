export type NotificationStatus = 'Pending' | 'Queued' | 'Sent' | 'Delivered' | 'Failed' | 'Acknowledged';
export type NotificationChannel = 'SMS' | 'Automated Voice Call' | 'Emergency Services CAD' | 'Hospital Direct Alert';

export interface EmergencyNotification {
  id: string;
  incidentId: string;
  vehicleRegistration: string;
  timestamp: string;
  recipient: string;
  recipientRole: string; // e.g. "Primary Kin", "Bangalore City Police (112)", "Apollo Emergency Ward"
  phone: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  messagePreview: string;
  locationLink: string;
  sentAt?: string;
  acknowledgedAt?: string;
  retryCount: number;
}
