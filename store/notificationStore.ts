import { create } from 'zustand';
import { api } from '../lib/api';

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    const response = await api.get('/api/special/notifications');
    if (response.success) {
      set({ 
        notifications: response.data.notifications, 
        unreadCount: response.data.unreadCount,
        loading: false 
      });
    } else {
      set({ loading: false });
    }
  },
  markAsRead: async (id) => {
    const response = await api.post(`/api/special/notifications/read/${id}`, {});
    if (response.success) {
      const { notifications, unreadCount } = get();
      set({
        notifications: notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, unreadCount - 1)
      });
    }
  },
}));
