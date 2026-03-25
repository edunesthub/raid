// src/services/chatService.ts
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
  startAfter,
  deleteDoc,
  doc,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  message: string;
  createdAt: any;
  tournamentId?: string;
  teamId?: string;
  leagueId?: string;
  challengeId?: string;
}

class ChatService {
  /**
   * Send a message to a tournament chat
   */
  async sendMessage(tournamentId: string, messageData: Partial<ChatMessage>): Promise<{ success: boolean }> {
    try {
      const chatRef = collection(db, 'tournament_chats');
      await addDoc(chatRef, {
        tournamentId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message?.trim(),
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Send a message to a team chat
   */
  async sendTeamMessage(teamId: string, messageData: Partial<ChatMessage>): Promise<{ success: boolean }> {
    try {
      const chatRef = collection(db, 'team_chats');
      await addDoc(chatRef, {
        teamId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message?.trim(),
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending team message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Send a message to a challenge chat
   */
  async sendChallengeMessage(challengeId: string, messageData: Partial<ChatMessage>): Promise<{ success: boolean }> {
    try {
      const chatRef = collection(db, 'challenge_chats');
      await addDoc(chatRef, {
        challengeId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message?.trim(),
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending challenge message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Universal subscription helper
   */
  private subscribeToCollection(
    collectionName: string,
    filterField: string,
    filterValue: string,
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): Unsubscribe {
    try {
      const chatRef = collection(db, collectionName);
      const q = query(
        chatRef,
        where(filterField, '==', filterValue),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot: QuerySnapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];

        callback(messages.reverse());
      }, (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        callback([]);
      });
    } catch (error) {
      console.error(`Error setting up ${collectionName} subscription:`, error);
      return () => { };
    }
  }

  subscribeToChat(tournamentId: string, callback: (msgs: ChatMessage[]) => void, limitCount: number = 50): Unsubscribe {
    return this.subscribeToCollection('tournament_chats', 'tournamentId', tournamentId, callback, limitCount);
  }

  subscribeToTeamChat(teamId: string, callback: (msgs: ChatMessage[]) => void, limitCount: number = 50): Unsubscribe {
    return this.subscribeToCollection('team_chats', 'teamId', teamId, callback, limitCount);
  }

  subscribeToChallengeChat(challengeId: string, callback: (msgs: ChatMessage[]) => void, limitCount: number = 50): Unsubscribe {
    return this.subscribeToCollection('challenge_chats', 'challengeId', challengeId, callback, limitCount);
  }

  /**
   * Get initial chat messages (for pagination)
   */
  async getChatMessages(tournamentId: string, limitCount: number = 50, lastDoc: DocumentSnapshot | null = null): Promise<{ messages: ChatMessage[], lastDoc: DocumentSnapshot | null }> {
    try {
      const chatRef = collection(db, 'tournament_chats');
      let q = query(
        chatRef,
        where('tournamentId', '==', tournamentId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot: QuerySnapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];

      return {
        messages: messages.reverse(),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { messages: [], lastDoc: null };
    }
  }

  /**
   * Delete a message (admin/owner only)
   */
  async deleteMessage(collectionName: string, messageId: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, collectionName, messageId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }
}

export const chatService = new ChatService();
