export type NotificationEventType =
  | 'inquiry.updated'
  | 'maintenance.updated'
  | 'task.assigned'
  | 'payment.status_updated';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  companyId: string;
  recipientUserId: string;
  actorUserId: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  entityType?: 'inquiry' | 'maintenance' | 'task' | 'payment';
  entityId?: string;
  priority: NotificationPriority;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  recipientUserId: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  entityType?: 'inquiry' | 'maintenance' | 'task' | 'payment';
  entityId?: string;
  priority?: NotificationPriority;
}
