import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  runTransaction,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FRIEND_REQUESTS_COLLECTION = 'friend_requests';
const FRIENDS_SUBCOLLECTION = 'friends';

class FriendService {
  /**
   * Send a friend request to another user
   */
  async sendFriendRequest(senderId, receiverId) {
    try {
      if (senderId === receiverId) throw new Error('Cannot send a request to yourself');

      // Check if already friends
      const friendsQuery = query(
        collection(db, `users/${senderId}/${FRIENDS_SUBCOLLECTION}`),
        where('friendId', '==', receiverId)
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      if (!friendsSnapshot.empty) throw new Error('Already friends');

      // Check if request already pending
      const pendingQuery = query(
        collection(db, FRIEND_REQUESTS_COLLECTION),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        where('status', '==', 'pending')
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      if (!pendingSnapshot.empty) throw new Error('Friend request already pending');

      await addDoc(collection(db, FRIEND_REQUESTS_COLLECTION), {
        senderId,
        receiverId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Get incoming pending requests
   */
  async getPendingRequests(userId) {
    try {
      const q = query(
        collection(db, FRIEND_REQUESTS_COLLECTION),
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const requests = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const senderProfileDoc = await getDoc(doc(db, 'users', data.senderId));
          return {
            id: doc.id,
            ...data,
            senderProfile: senderProfileDoc.exists() ? senderProfileDoc.data() : null
          };
        })
      );
      return requests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  /**
   * Respond to friend request (Accept/Reject)
   */
  async respondToFriendRequest(requestId, status) {
    try {
      const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
      const requestSnapshot = await getDoc(requestRef);
      if (!requestSnapshot.exists()) throw new Error('Request not found');

      const requestData = requestSnapshot.data();
      if (status === 'accepted') {
        const batch = [];
        // Add to both users' friends list
        await runTransaction(db, async (transaction) => {
          transaction.set(doc(db, `users/${requestData.senderId}/${FRIENDS_SUBCOLLECTION}`, requestData.receiverId), {
            friendId: requestData.receiverId,
            since: serverTimestamp()
          });
          transaction.set(doc(db, `users/${requestData.receiverId}/${FRIENDS_SUBCOLLECTION}`, requestData.senderId), {
            friendId: requestData.senderId,
            since: serverTimestamp()
          });
          transaction.delete(requestRef);
        });
      } else {
        await deleteDoc(requestRef);
      }
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }

  /**
   * Get a user's friends list
   */
  async getFriendsList(userId) {
    try {
      const q = query(collection(db, `users/${userId}/${FRIENDS_SUBCOLLECTION}`));
      const snapshot = await getDocs(q);
      const friends = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const friendProfileDoc = await getDoc(doc(db, 'users', data.friendId));
          return {
            id: doc.id,
            ...data,
            profile: friendProfileDoc.exists() ? friendProfileDoc.data() : null
          };
        })
      );
      return friends;
    } catch (error) {
      console.error('Error fetching friends list:', error);
      throw error;
    }
  }

  /**
   * Endless players list (Pagination ready)
   */
  async getEndlessPlayers(lastVisibleDoc = null, limitCount = 20) {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('username'), limit(limitCount));
      if (lastVisibleDoc) {
        // Logic for next page: startAfter(lastVisibleDoc)
      }
      const snapshot = await getDocs(q);
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { players, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }
}

export const friendService = new FriendService();
