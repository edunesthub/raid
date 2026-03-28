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
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CHALLENGES_COLLECTION = 'challenges';

class ArenaService {
  /**
   * Generate a random 6-character uppercase alphanumeric code
   */
  generateChallengeCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new open challenge
   */
  async createChallenge(challengeData) {
    try {
      const {
        creatorId,
        game,
        name,
        rounds,
        visibility,
        liveStreamLink = ''
      } = challengeData;

      const code = this.generateChallengeCode();

      const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), {
        creatorId,
        game,
        name,
        rounds: parseInt(rounds),
        visibility,
        code,
        status: 'open',
        participants: [creatorId],
        currentParticipants: 1,
        maxParticipants: 2, // Default for 1v1, can be extended
        liveStreamLink,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, code };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get public open challenges
   */
  async getPublicChallenges(gameFilter = 'all') {
    try {
      const challengesRef = collection(db, CHALLENGES_COLLECTION);
      let q = query(
        challengesRef,
        where('visibility', '==', 'Public'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (gameFilter !== 'all') {
        q = query(q, where('game', '==', gameFilter));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching public challenges:', error);
      throw error;
    }
  }

  /**
   * Join a challenge using a code (for private) or ID (for public)
   */
  async joinChallenge(userId, challengeCodeOrId, isCode = false) {
    try {
      let challengeId;
      if (isCode) {
        const q = query(
          collection(db, CHALLENGES_COLLECTION),
          where('code', '==', challengeCodeOrId.toUpperCase()),
          where('status', '==', 'open'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error('Invalid or expired challenge code');
        challengeId = snapshot.docs[0].id;
      } else {
        challengeId = challengeCodeOrId;
      }

      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
      
      const result = await runTransaction(db, async (transaction) => {
        const challengeDoc = await transaction.get(challengeRef);
        if (!challengeDoc.exists()) throw new Error('Challenge not found');

        const data = challengeDoc.data();
        
        // If already a participant, just return the data (allows entry even if status is 'active')
        if (data.participants && data.participants.includes(userId)) {
          return { id: challengeId, ...data };
        }

        if (data.status !== 'open') throw new Error('Challenge is no longer open');

        if (data.participants.length >= data.maxParticipants) {
          throw new Error('Challenge is full');
        }

        const newParticipants = [...data.participants, userId];
        const newCount = newParticipants.length;
        const newStatus = newCount >= data.maxParticipants ? 'active' : 'open';

        transaction.update(challengeRef, {
          participants: newParticipants,
          currentParticipants: newCount,
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        return { id: challengeId, ...data, participants: newParticipants, currentParticipants: newCount, status: newStatus };
      });

      return result;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Subscribe to challenge details in real-time
   */
  subscribeToChallenge(challengeId, callback) {
    const ref = doc(db, CHALLENGES_COLLECTION, challengeId);
    return onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to challenge:', error);
    });
  }

  /**
   * Get challenge details
   */
  async getChallengeById(challengeId) {
    try {
      const ref = doc(db, CHALLENGES_COLLECTION, challengeId);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() };
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }
}

export const arenaService = new ArenaService();
