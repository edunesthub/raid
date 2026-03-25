// src/services/challengeService.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Challenge, ChallengeGame, ChallengeVisibility, ChallengeRound } from '@/types/challenge';

const CHALLENGES_COLLECTION = 'challenges';

class ChallengeService {
  /**
   * Generate a unique 6-character alphanumeric code
   */
  private generateJoinCode(): string {
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
  async createChallenge(data: {
    name: string;
    game: ChallengeGame;
    rounds: ChallengeRound;
    visibility: ChallengeVisibility;
    creatorId: string;
    creatorUsername: string;
    streamUrl?: string;
  }): Promise<Challenge> {
    try {
      const code = this.generateJoinCode();
      const challengeData = {
        ...data,
        code,
        participants: [data.creatorId],
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), challengeData);
      return { id: docRef.id, ...challengeData } as any;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw new Error('Failed to create challenge');
    }
  }

  /**
   * Search for a challenge by code
   */
  async findChallengeByCode(code: string): Promise<Challenge | null> {
    try {
      const q = query(
        collection(db, CHALLENGES_COLLECTION),
        where('code', '==', code.toUpperCase())
      );
      const snapshot: QuerySnapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Challenge;
    } catch (error) {
      console.error('Error finding challenge by code:', error);
      throw new Error('Failed to find challenge');
    }
  }

  /**
   * Get all public challenges
   */
  async getPublicChallenges(game?: string): Promise<Challenge[]> {
    try {
      let q = query(
        collection(db, CHALLENGES_COLLECTION),
        where('visibility', '==', 'public'),
        where('status', '==', 'waiting')
      );

      if (game && game !== 'all') {
        q = query(q, where('game', '==', game));
      }

      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[];
    } catch (error) {
      console.error('Error fetching public challenges:', error);
      throw new Error('Failed to fetch challenges');
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) throw new Error('Challenge not found');

      const data = challengeSnap.data() as Challenge;
      if (data.participants.includes(userId)) return true;
      if (data.participants.length >= 10) throw new Error('Challenge is full'); // Default cap

      await updateDoc(challengeRef, {
        participants: [...data.participants, userId],
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }
}

export const challengeService = new ChallengeService();
