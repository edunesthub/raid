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

// Unified platform accent style for all notification types
const getNotificationStyle = () => ({
  iconBg: 'bg-orange-500/10 border border-orange-500/20',
});

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
    <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-2 md:gap-3">
                  <div className="relative">
                    <Bell className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold border-2 border-gray-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1.5 md:gap-2">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                    {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="flex items-center self-start sm:self-auto gap-2 px-4 py-2.5 md:px-6 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-orange-500 border border-orange-500/20 bg-orange-500/10 rounded-xl hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="relative mt-8 md:mt-10">
            <div className="flex items-center gap-3 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
              {['all', 'unread', 'read'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    filter === f
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
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
          <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto mt-8 md:mt-12">
            <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
              <Bell className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
              {filter === 'unread' ? 'All caught up! 🎉' : 'No notifications yet'}
            </h3>
            <p className="text-gray-400 text-sm md:text-base font-medium mb-8 max-w-sm mx-auto leading-relaxed">
              {filter === 'unread' 
                ? "You've read all your notifications." 
                : "You'll see notifications here when you have any."}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-2xl w-full md:w-auto justify-center"
              >
                <Filter className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-xs">Show all</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const { iconBg } = getNotificationStyle();
              const isProcessing = processingIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.06] hover:border-orange-500/40 ${
                    notification.link ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Unread left-edge accent */}
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 rounded-l-2xl" />
                  )}

                  <div className="relative flex gap-4 p-5">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-all`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-black italic uppercase tracking-tight text-sm leading-tight text-white">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                          <span className="text-gray-600 text-[10px] flex items-center gap-1 font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs leading-relaxed mb-3 font-medium">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isProcessing}
                            className="text-[10px] text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1 font-black uppercase tracking-widest disabled:opacity-50"
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
                          className="text-[10px] text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 font-black uppercase tracking-widest disabled:opacity-50"
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