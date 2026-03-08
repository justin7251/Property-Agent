import type { CreateNotificationInput, NotificationEventType } from '../../types/notification';

type InquiryUpdatedEvent = {
  type: 'inquiry.updated';
  inquiryId: string;
  status: string;
  actorName?: string;
  recipientUserId: string;
};

type MaintenanceUpdatedEvent = {
  type: 'maintenance.updated';
  requestId: string;
  status: string;
  propertyTitle: string;
  recipientUserId: string;
};

type TaskAssignedEvent = {
  type: 'task.assigned';
  taskId: string;
  taskTitle: string;
  recipientUserId: string;
};

type PaymentStatusUpdatedEvent = {
  type: 'payment.status_updated';
  paymentId: string;
  status: string;
  recipientUserId: string;
};

export type NotificationEvent =
  | InquiryUpdatedEvent
  | MaintenanceUpdatedEvent
  | TaskAssignedEvent
  | PaymentStatusUpdatedEvent;

function eventPriority(type: NotificationEventType): 'low' | 'medium' | 'high' {
  if (type === 'payment.status_updated') return 'high';
  if (type === 'maintenance.updated') return 'high';
  return 'medium';
}

export function toNotificationInput(event: NotificationEvent): CreateNotificationInput {
  if (event.type === 'inquiry.updated') {
    return {
      recipientUserId: event.recipientUserId,
      eventType: event.type,
      title: 'Inquiry Updated',
      message: `${event.actorName || 'A teammate'} changed inquiry to ${event.status}.`,
      entityType: 'inquiry',
      entityId: event.inquiryId,
      priority: eventPriority(event.type),
    };
  }
  if (event.type === 'maintenance.updated') {
    return {
      recipientUserId: event.recipientUserId,
      eventType: event.type,
      title: 'Maintenance Update',
      message: `${event.propertyTitle} request is now ${event.status}.`,
      entityType: 'maintenance',
      entityId: event.requestId,
      priority: eventPriority(event.type),
    };
  }
  if (event.type === 'task.assigned') {
    return {
      recipientUserId: event.recipientUserId,
      eventType: event.type,
      title: 'Task Assigned',
      message: `New task assigned: ${event.taskTitle}.`,
      entityType: 'task',
      entityId: event.taskId,
      priority: eventPriority(event.type),
    };
  }
  return {
    recipientUserId: event.recipientUserId,
    eventType: event.type,
    title: 'Payment Status Updated',
    message: `Payment is now ${event.status}.`,
    entityType: 'payment',
    entityId: event.paymentId,
    priority: eventPriority(event.type),
  };
}
