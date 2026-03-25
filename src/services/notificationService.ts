// src/services/notificationService.ts
import { 
  collection, 
  addDoc, 
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

export type NotificationType = 
  | 'tournament_joined'
  | 'tournament_starting'
  | 'tournament_started'
  | 'tournament_result'
  | 'tournament_cancelled'
  | 'payment_received'
  | 'clan_invite'
  | 'clan_joined'
  | 'system_announcement'
  | 'match_ready'
  | 'achievement_unlocked'
  | 'friend_request'
  | 'challenge_invite';

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  TOURNAMENT_JOINED: 'tournament_joined',
  TOURNAMENT_STARTING: 'tournament_starting',
  TOURNAMENT_STARTED: 'tournament_started',
  TOURNAMENT_RESULT: 'tournament_result',
  TOURNAMENT_CANCELLED: 'tournament_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  CLAN_INVITE: 'clan_invite',
  CLAN_JOINED: 'clan_joined',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  MATCH_READY: 'match_ready',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  FRIEND_REQUEST: 'friend_request',
  CHALLENGE_INVITE: 'challenge_invite'
};

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  link: string | null;
  priority: 'normal' | 'high' | 'urgent';
  read: boolean;
  timestamp: any;
  createdAt: string;
}

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    data = {},
    link = null,
    priority = 'normal'
  }: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    link?: string | null;
    priority?: 'normal' | 'high' | 'urgent';
  }): Promise<Notification> {
    try {
      const notificationData = {
        userId,
        type,
        title,
        message,
        data,
        link,
        priority,
        read: false,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(
        collection(db, NOTIFICATIONS_COLLECTION),
        notificationData
      );

      console.log('Notification created:', docRef.id);
      return { id: docRef.id, ...notificationData } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  async createBulkNotifications(notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    link?: string | null;
    priority?: 'normal' | 'high' | 'urgent';
  }>): Promise<boolean> {
    try {
      const batch: WriteBatch = writeBatch(db);
      const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);

      notifications.forEach(notification => {
        const docRef = doc(notificationsRef);
        batch.set(docRef, {
          ...notification,
          read: false,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();
      console.log(`${notifications.length} notifications created`);
      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw new Error('Failed to create bulk notifications');
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      const batch: WriteBatch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`Marked ${snapshot.size} notifications as read`);
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      const batch: WriteBatch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${snapshot.size} notifications`);
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw new Error('Failed to delete all notifications');
    }
  }

  /**
   * Tournament-specific notification helpers
   */
  async notifyTournamentJoined(userId: string, tournamentId: string, tournamentName: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_JOINED as NotificationType,
      title: 'Tournament Joined! 🎮',
      message: `You successfully joined "${tournamentName}". Good luck!`,
      data: { tournamentId, tournamentName },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  async notifyTournamentStarting(userId: string, tournamentId: string, tournamentName: string, startTime: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_STARTING as NotificationType,
      title: 'Tournament Starting Soon! ⏰',
      message: `"${tournamentName}" starts in 1 hour. Get ready!`,
      data: { tournamentId, tournamentName, startTime },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  async notifyTournamentStarted(userId: string, tournamentId: string, tournamentName: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_STARTED as NotificationType,
      title: 'Tournament Started! 🔴',
      message: `"${tournamentName}" is now live! Check your match details.`,
      data: { tournamentId, tournamentName },
      link: `/tournament/${tournamentId}`,
      priority: 'urgent'
    });
  }

  async notifyTournamentResult(userId: string, tournamentId: string, tournamentName: string, placement: number | string, prize: number | string | null = null, currency = 'GHS'): Promise<Notification> {
    const symbol = currency === 'NGN' ? '₦' : '₵';
    const prizeText = prize ? ` You won ${symbol}${prize}!` : '';
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_RESULT as NotificationType,
      title: 'Tournament Results 🏆',
      message: `You placed ${placement} in "${tournamentName}".${prizeText}`,
      data: { tournamentId, tournamentName, placement, prize, currency },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  /**
   * Friend Request notification
   */
  async notifyFriendRequest(userId: string, fromUserId: string, fromUsername: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.FRIEND_REQUEST as NotificationType,
      title: 'New Friend Request! 👥',
      message: `${fromUsername} sent you a friend request.`,
      data: { fromUserId, fromUsername },
      link: '/friends',
      priority: 'normal'
    });
  }

  /**
   * Open Challenge notification
   */
  async notifyChallengeInvite(userId: string, challengeId: string, challengeName: string, fromUsername: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.CHALLENGE_INVITE as NotificationType,
      title: 'Challenge Invite! ⚔️',
      message: `${fromUsername} invited you to the challenge "${challengeName}".`,
      data: { challengeId, challengeName, fromUsername },
      link: `/challenge/${challengeId}`,
      priority: 'high'
    });
  }
}

export const notificationService = new NotificationService();