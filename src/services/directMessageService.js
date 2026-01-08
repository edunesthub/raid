// src/services/directMessageService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  limit,
  or,
  and,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class DirectMessageService {
  /**
   * Get or create a conversation ID between two users
   */
  getConversationId(userId1, userId2) {
    // Sort user IDs to ensure consistent conversation ID
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  /**
   * Send a direct message
   */
  async sendDirectMessage(senderId, senderUsername, senderAvatar, recipientId, recipientUsername, message, tournamentId = null) {
    try {
      const conversationId = this.getConversationId(senderId, recipientId);
      
      // Create or update conversation metadata
      const conversationRef = doc(db, 'conversations', conversationId);
      await setDoc(conversationRef, {
        participants: [senderId, recipientId],
        participantNames: {
          [senderId]: senderUsername,
          [recipientId]: recipientUsername
        },
        lastMessage: message.substring(0, 100),
        lastMessageTime: serverTimestamp(),
        tournamentId: tournamentId || null,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Add the message
      const messagesRef = collection(db, 'directMessages');
      await addDoc(messagesRef, {
        conversationId,
        senderId,
        senderUsername,
        senderAvatar: senderAvatar || null,
        recipientId,
        recipientUsername,
        message: message.trim(),
        timestamp: serverTimestamp(),
        createdAt: new Date(),
        read: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Subscribe to direct messages between two users
   */
  subscribeToDirectMessages(userId1, userId2, callback, limitCount = 50) {
    try {
      const conversationId = this.getConversationId(userId1, userId2);
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Reverse to show oldest first
        callback(messages.reverse());
      }, (error) => {
        console.error('Error subscribing to direct messages:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up direct message subscription:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId, userId) {
    try {
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = [];
      
      snapshot.forEach((docSnapshot) => {
        updatePromises.push(
          setDoc(doc(db, 'directMessages', docSnapshot.id), { read: true }, { merge: true })
        );
      });

      await Promise.all(updatePromises);
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false };
    }
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId) {
    try {
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('recipientId', '==', userId),
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
   * Delete a direct message
   */
  async deleteDirectMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'directMessages', messageId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting direct message:', error);
      throw new Error('Failed to delete message');
    }
  }
}

export const directMessageService = new DirectMessageService();
