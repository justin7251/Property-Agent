'use client';

import { useMemo, useState } from 'react';
import type { AppNotification } from '../types/notification';
import { markAllNotificationsRead, markNotificationRead, subscribeNotifications } from '../services/firebase';
import { useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((rows) => {
      setNotifications(rows);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications]
  );

  async function markRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read.');
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read.');
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markRead,
    markAllRead,
  };
}
