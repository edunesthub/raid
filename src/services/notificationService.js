// src/services/notificationService.js
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
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const NOTIFICATION_TYPES = {
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
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked'
};

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
  }) {
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
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  async createBulkNotifications(notifications) {
    try {
      const batch = writeBatch(db);
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
  async getUserNotifications(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
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
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

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
  async deleteNotification(notificationId) {
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
  async deleteAllNotifications(userId) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

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
  async notifyTournamentJoined(userId, tournamentId, tournamentName) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_JOINED,
      title: 'Tournament Joined! 🎮',
      message: `You successfully joined "${tournamentName}". Good luck!`,
      data: { tournamentId, tournamentName },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  async notifyTournamentStarting(userId, tournamentId, tournamentName, startTime) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_STARTING,
      title: 'Tournament Starting Soon! ⏰',
      message: `"${tournamentName}" starts in 1 hour. Get ready!`,
      data: { tournamentId, tournamentName, startTime },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  async notifyTournamentStarted(userId, tournamentId, tournamentName) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_STARTED,
      title: 'Tournament Started! 🔴',
      message: `"${tournamentName}" is now live! Check your match details.`,
      data: { tournamentId, tournamentName },
      link: `/tournament/${tournamentId}`,
      priority: 'urgent'
    });
  }

  async notifyTournamentResult(userId, tournamentId, tournamentName, placement, prize = null) {
    const prizeText = prize ? ` You won ₵${prize}!` : '';
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_RESULT,
      title: 'Tournament Results 🏆',
      message: `You placed ${placement} in "${tournamentName}".${prizeText}`,
      data: { tournamentId, tournamentName, placement, prize },
      link: `/tournament/${tournamentId}`,
      priority: 'high'
    });
  }

  async notifyTournamentCancelled(userId, tournamentId, tournamentName, reason) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.TOURNAMENT_CANCELLED,
      title: 'Tournament Cancelled',
      message: `"${tournamentName}" has been cancelled. ${reason}`,
      data: { tournamentId, tournamentName, reason },
      priority: 'high'
    });
  }

  /**
   * Payment notification
   */
  async notifyPaymentReceived(userId, amount, description) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
      title: 'Payment Received 💰',
      message: `You received ₵${amount}. ${description}`,
      data: { amount, description },
      link: '/wallet',
      priority: 'high'
    });
  }

  /**
   * Clan notifications
   */
  async notifyClanInvite(userId, clanId, clanName, invitedBy) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.CLAN_INVITE,
      title: 'Clan Invitation 👥',
      message: `${invitedBy} invited you to join "${clanName}"`,
      data: { clanId, clanName, invitedBy },
      link: `/clans/${clanId}`,
      priority: 'normal'
    });
  }

  async notifyClanJoined(userId, clanId, clanName) {
    return this.createNotification({
      userId,
      type: NOTIFICATION_TYPES.CLAN_JOINED,
      title: 'Joined Clan! 🎉',
      message: `You are now a member of "${clanName}"`,
      data: { clanId, clanName },
      link: `/clans/${clanId}`,
      priority: 'normal'
    });
  }

  /**
   * System announcement
   */
  async createSystemAnnouncement(title, message, targetUsers = 'all') {
    if (targetUsers === 'all') {
      // TODO: Implement logic to get all user IDs
      console.log('System announcement for all users:', title);
      return null;
    }

    const notifications = targetUsers.map(userId => ({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      title,
      message,
      data: {},
      priority: 'normal'
    }));

    return this.createBulkNotifications(notifications);
  }
}

export const notificationService = new NotificationService();