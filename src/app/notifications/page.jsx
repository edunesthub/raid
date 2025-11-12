'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, NOTIFICATION_TYPES } from '@/services/notificationService';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Trophy, 
  DollarSign, 
  Users, 
  AlertCircle,
  Clock,
  X,
  Loader
} from 'lucide-react';

// Icon mapping for notification types
const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.TOURNAMENT_JOINED:
    case NOTIFICATION_TYPES.TOURNAMENT_STARTING:
    case NOTIFICATION_TYPES.TOURNAMENT_STARTED:
    case NOTIFICATION_TYPES.TOURNAMENT_RESULT:
      return Trophy;
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
      return DollarSign;
    case NOTIFICATION_TYPES.CLAN_INVITE:
    case NOTIFICATION_TYPES.CLAN_JOINED:
      return Users;
    case NOTIFICATION_TYPES.TOURNAMENT_CANCELLED:
      return AlertCircle;
    default:
      return Bell;
  }
};

// Color mapping for notification types
const getNotificationColor = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.TOURNAMENT_JOINED:
    case NOTIFICATION_TYPES.TOURNAMENT_STARTED:
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case NOTIFICATION_TYPES.TOURNAMENT_STARTING:
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case NOTIFICATION_TYPES.TOURNAMENT_RESULT:
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case NOTIFICATION_TYPES.CLAN_INVITE:
    case NOTIFICATION_TYPES.CLAN_JOINED:
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case NOTIFICATION_TYPES.TOURNAMENT_CANCELLED:
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.id) {
      loadNotifications();
    }
  }, [user, isAuthenticated, router]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    if (processingIds.has(id)) return;
    
    try {
      setProcessingIds(prev => new Set([...prev, id]));
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    if (processingIds.has(id)) return;
    
    try {
      setProcessingIds(prev => new Set([...prev, id]));
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-orange-500" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "You'll see notifications here when you have any"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const isProcessing = processingIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`card-raid p-4 transition-all ${
                    !notification.read ? 'border-l-4 border-l-orange-500' : ''
                  } ${notification.link ? 'cursor-pointer hover:border-orange-500/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-semibold">{notification.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">{notification.message}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isProcessing}
                            className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          disabled={isProcessing}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}