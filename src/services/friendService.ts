// src/services/friendService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  writeBatch,
  WriteBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Friend, FriendRequest, FriendRequestStatus } from '@/types/friend';
import { notificationService } from './notificationService';

const REQUESTS_COLLECTION = 'friend_requests';
const FRIENDS_COLLECTION = 'friends';

class FriendService {
  /**
   * Send a friend request
   */
  async sendFriendRequest(fromUserId: string, fromUsername: string, toUserId: string): Promise<boolean> {
    try {
      // Check if already friends or request exists
      const existing = await this.getFriendRequest(fromUserId, toUserId);
      if (existing) throw new Error('Request already sent');

      const requestData = {
        fromUserId,
        fromUsername,
        toUserId,
        status: 'pending' as FriendRequestStatus,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, REQUESTS_COLLECTION), requestData);
      
      // Notify recipient
      await notificationService.notifyFriendRequest(toUserId, fromUserId, fromUsername);
      
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Get a specific friend request between two users
   */
  async getFriendRequest(userId1: string, userId2: string): Promise<FriendRequest | null> {
    const q1 = query(collection(db, REQUESTS_COLLECTION), where('fromUserId', '==', userId1), where('toUserId', '==', userId2));
    const q2 = query(collection(db, REQUESTS_COLLECTION), where('fromUserId', '==', userId2), where('toUserId', '==', userId1));
    
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const result = s1.docs[0] || s2.docs[0];
    
    return result ? { id: result.id, ...result.data() } as FriendRequest : null;
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, toUserId: string, fromUserId: string, fromUsername: string, toUsername: string): Promise<boolean> {
    try {
      const batch: WriteBatch = writeBatch(db);

      // 1. Update request status
      const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
      batch.update(requestRef, { status: 'accepted', updatedAt: serverTimestamp() });

      // 2. Add as mutual friends
      const f1Ref = doc(db, FRIENDS_COLLECTION, `${fromUserId}_${toUserId}`);
      batch.set(f1Ref, { userId1: fromUserId, userId2: toUserId, friendOfId: fromUserId, friendId: toUserId, friendUsername: toUsername, addedAt: serverTimestamp() });

      const f2Ref = doc(db, FRIENDS_COLLECTION, `${toUserId}_${fromUserId}`);
      batch.set(f2Ref, { userId1: toUserId, userId2: fromUserId, friendOfId: toUserId, friendId: fromUserId, friendUsername: fromUsername, addedAt: serverTimestamp() });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Get user's friend list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const q = query(collection(db, FRIENDS_COLLECTION), where('friendOfId', '==', userId));
      const snapshot: QuerySnapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.friendId,
          username: data.friendUsername,
          addedAt: data.addedAt
        } as Friend;
      });
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw new Error('Failed to fetch friends');
    }
  }
}

export const friendService = new FriendService();
