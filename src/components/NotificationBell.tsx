import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const getTypeIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], string> = {
      connection_request: '👥',
      message: '💬',
      event: '📅',
      job: '💼',
      announcement: '📢',
      system: '⚙️',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors: Record<Notification['type'], string> = {
      connection_request: 'bg-blue-100 text-blue-800',
      message: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      job: 'bg-yellow-100 text-yellow-800',
      announcement: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group',
        notification.isRead 
          ? 'bg-transparent hover:bg-muted/50' 
          : 'bg-primary/5 hover:bg-primary/10'
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <span className="text-xl flex-shrink-0">{getTypeIcon(notification.type)}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', getTypeColor(notification.type))}>
            {notification.type.replace('_', ' ')}
          </span>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
        
        <p className="font-medium text-sm line-clamp-1">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onClear(notification.id);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAllNotifications}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClear={clearNotification}
                  />
                  {index < notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {!isConnected && (
          <div className="p-2 bg-yellow-50 border-t text-center">
            <p className="text-xs text-yellow-700">
              Real-time updates unavailable
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
