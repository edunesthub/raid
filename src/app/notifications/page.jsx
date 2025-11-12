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
  Loader,
  ArrowLeft,
  Sparkles,
  Filter
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

// Color mapping with gradient styles
const getNotificationStyle = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.TOURNAMENT_JOINED:
    case NOTIFICATION_TYPES.TOURNAMENT_STARTED:
      return {
        gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        border: 'border-green-500/30',
        glow: 'shadow-green-500/20'
      };
    case NOTIFICATION_TYPES.TOURNAMENT_STARTING:
      return {
        gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-500/20'
      };
    case NOTIFICATION_TYPES.TOURNAMENT_RESULT:
      return {
        gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20'
      };
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
      return {
        gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        border: 'border-green-500/30',
        glow: 'shadow-green-500/20'
      };
    case NOTIFICATION_TYPES.CLAN_INVITE:
    case NOTIFICATION_TYPES.CLAN_JOINED:
      return {
        gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20'
      };
    case NOTIFICATION_TYPES.TOURNAMENT_CANCELLED:
      return {
        gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
        border: 'border-red-500/30',
        glow: 'shadow-red-500/20'
      };
    default:
      return {
        gradient: 'from-gray-500/20 via-slate-500/10 to-transparent',
        iconBg: 'bg-gradient-to-br from-gray-600 to-slate-700',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/20'
      };
  }
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingIds, setProcessingIds] = useState(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-10 px-4 pb-24">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 transition-all hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-8 h-8 text-orange-500" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gray-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-700/50 shadow-2xl">
              {['all', 'unread', 'read'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filter === f
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {f === 'all' && <Filter className="w-4 h-4" />}
                    {f === 'unread' && unreadCount > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'unread' && unreadCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <Bell className="w-20 h-20 text-gray-700 mx-auto" />
              <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {filter === 'unread' ? 'All caught up! 🎉' : 'No notifications yet'}
            </h3>
            <p className="text-gray-400 mb-8">
              {filter === 'unread' 
                ? "You've read all your notifications" 
                : "You'll see notifications here when you have any"}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="btn-raid inline-flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Show all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const style = getNotificationStyle(notification.type);
              const isProcessing = processingIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`group relative bg-gradient-to-r ${style.gradient} backdrop-blur-sm rounded-2xl overflow-hidden border ${style.border} transition-all duration-300 hover:scale-[1.02] ${
                    !notification.read ? `shadow-xl ${style.glow}` : 'shadow-lg'
                  } ${notification.link ? 'cursor-pointer' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Gradient overlay for unread */}
                  {!notification.read && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                  )}

                  <div className="relative flex gap-4 p-5">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${style.iconBg} shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50" />
                          )}
                          <span className="text-gray-500 text-xs flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isProcessing}
                            className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50 hover:scale-105"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          disabled={isProcessing}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50 hover:scale-105"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}