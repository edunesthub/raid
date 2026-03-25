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
  Timestamp
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
      let challengeDoc;
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
        challengeDoc = snapshot.docs[0];
        challengeId = challengeDoc.id;
      } else {
        challengeId = challengeCodeOrId;
        const ref = doc(db, CHALLENGES_COLLECTION, challengeId);
        challengeDoc = await getDoc(ref);
        if (!challengeDoc.exists()) throw new Error('Challenge not found');
      }

      const data = challengeDoc.data();
      if (data.status !== 'open') throw new Error('Challenge is no longer open');
      if (data.participants.includes(userId)) return { id: challengeId, ...data };
      if (data.participants.length >= data.maxParticipants) throw new Error('Challenge is full');

      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
      await updateDoc(challengeRef, {
        participants: [...data.participants, userId],
        currentParticipants: increment(1),
        status: data.participants.length + 1 >= data.maxParticipants ? 'active' : 'open',
        updatedAt: serverTimestamp()
      });

      return { id: challengeId, ...data };
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
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
