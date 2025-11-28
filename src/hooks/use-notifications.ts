import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

export interface Notification {
  id: string;
  type: 'connection_request' | 'message' | 'event' | 'job' | 'announcement' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface UseNotificationsOptions {
  enabled?: boolean;
  autoConnect?: boolean;
  showToasts?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  refetch: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { enabled = true, autoConnect = true, showToasts = true } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();
  
  const getToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);
  
  const getUserId = useCallback(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return null;
      }
    }
    return null;
  }, []);
  
  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    const token = getToken();
    const userId = getUserId();
    
    if (!token || !userId || socketRef.current?.connected) {
      return;
    }
    
    const socket = io(`${API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      
      // Subscribe to user notifications
      socket.emit('subscribe', { userId });
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });
    
    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      if (showToasts) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'system' ? 'default' : undefined,
        });
      }
    });
    
    // Listen for notification updates
    socket.on('notification:read', (notificationId: string) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    });
    
    socket.on('notifications:all-read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    });
    
    socketRef.current = socket;
  }, [getToken, getUserId, showToasts, toast]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [getToken]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [getToken]);
  
  // Clear a notification locally
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);
  
  // Clear all notifications locally
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Auto-connect on mount
  useEffect(() => {
    if (enabled && autoConnect) {
      fetchNotifications();
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, autoConnect, fetchNotifications, connect, disconnect]);
  
  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refetch: fetchNotifications,
    connect,
    disconnect,
  };
}
