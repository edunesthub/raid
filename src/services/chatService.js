// src/services/chatService.js
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
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class ChatService {
  /**
   * Send a message to a tournament chat
   */
  async sendMessage(tournamentId, messageData) {
    try {
      const chatRef = collection(db, 'tournament_chats');
      await addDoc(chatRef, {
        tournamentId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message.trim(),
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
  async sendTeamMessage(teamId, messageData) {
    try {
      const chatRef = collection(db, 'team_chats');
      await addDoc(chatRef, {
        teamId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message.trim(),
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending team message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Send a message to a league chat
   */
  async sendLeagueMessage(leagueId, messageData) {
    try {
      const chatRef = collection(db, 'league_chats');
      await addDoc(chatRef, {
        leagueId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar || null,
        message: messageData.message.trim(),
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending league message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Subscribe to tournament chat messages in real-time
   */
  subscribeToChat(tournamentId, callback, limitCount = 50) {
    try {
      const chatRef = collection(db, 'tournament_chats');
      const q = query(
        chatRef,
        where('tournamentId', '==', tournamentId),
        orderBy('createdAt', 'desc'),
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
        console.error('Error subscribing to chat:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up chat subscription:', error);
      return () => { }; // Return empty unsubscribe function
    }
  }

  /**
   * Subscribe to team chat messages in real-time
   */
  subscribeToTeamChat(teamId, callback, limitCount = 50) {
    try {
      const chatRef = collection(db, 'team_chats');
      const q = query(
        chatRef,
        where('teamId', '==', teamId),
        orderBy('createdAt', 'desc'),
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
        console.error('Error subscribing to team chat:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up team chat subscription:', error);
      return () => { };
    }
  }

  /**
   * Subscribe to league chat messages in real-time
   */
  subscribeToLeagueChat(leagueId, callback, limitCount = 50) {
    try {
      const chatRef = collection(db, 'league_chats');
      const q = query(
        chatRef,
        where('leagueId', '==', leagueId),
        orderBy('createdAt', 'desc'),
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
        console.error('Error subscribing to league chat:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up league chat subscription:', error);
      return () => { };
    }
  }

  /**
   * Get initial chat messages (for pagination)
   */
  async getChatMessages(tournamentId, limitCount = 50, lastDoc = null) {
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

      const snapshot = await getDocs(q);
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        messages: messages.reverse(),
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { messages: [], lastDoc: null };
    }
  }

  /**
   * Delete a tournament message (admin/owner only)
   */
  async deleteMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'tournament_chats', messageId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Delete a team message (admin/owner only)
   */
  async deleteTeamMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'team_chats', messageId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting team message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Delete a league message (admin/owner only)
   */
  async deleteLeagueMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'league_chats', messageId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting league message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Check if user is participant in tournament
   */
  async isUserInTournament(tournamentId, userId) {
    try {
      const tournamentRef = doc(db, 'tournaments', tournamentId);
      const tournamentSnap = await getDocs(query(collection(db, 'tournaments'), where('__name__', '==', tournamentId)));

      if (tournamentSnap.empty) return false;

      const tournamentData = tournamentSnap.docs[0].data();
      const participants = tournamentData.participants || [];

      return participants.includes(userId);
    } catch (error) {
      console.error('Error checking tournament participation:', error);
      return false;
    }
  }
}

export const chatService = new ChatService();
