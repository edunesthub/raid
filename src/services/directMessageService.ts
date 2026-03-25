// src/services/directMessageService.ts
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
  doc,
  setDoc,
  deleteDoc,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class DirectMessageService {
  getConversationId(userId1: string, userId2: string): string {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  async sendDirectMessage(
    senderId: string, 
    senderUsername: string, 
    senderAvatar: string | null, 
    recipientId: string, 
    recipientUsername: string, 
    message: string, 
    tournamentId: string | null = null, 
    leagueId: string | null = null, 
    teamId: string | null = null
  ) {
    try {
      const conversationId = this.getConversationId(senderId, recipientId);

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
        leagueId: leagueId || null,
        teamId: teamId || null,
        updatedAt: serverTimestamp()
      }, { merge: true });

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

  subscribeToDirectMessages(userId1: string, userId2: string, callback: (messages: any[]) => void, limitCount: number = 50) {
    try {
      const conversationId = this.getConversationId(userId1, userId2);
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot: QuerySnapshot) => {
        const messages: any[] = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(messages.reverse());
      }, (error) => {
        console.error('Error subscribing to direct messages:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up direct message subscription:', error);
      return () => { };
    }
  }

  async getUserConversations(userId: string) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      const conversations: any[] = [];
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

  async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      const updatePromises: Promise<void>[] = [];

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

  async getUnreadCount(userId: string) {
    try {
      const messagesRef = collection(db, 'directMessages');
      const q = query(
        messagesRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async deleteDirectMessage(messageId: string) {
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
