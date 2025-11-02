// src/services/tournamentService.js
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
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TOURNAMENTS_COLLECTION = 'tournaments';

class TournamentService {
  /**
   * Get all tournaments
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of tournaments
   */
  async getAllTournaments(options = {}) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      let q = tournamentRef;

      // Apply filters
      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options.game) {
        q = query(q, where('game', '==', options.game));
      }

      // Apply ordering
      const orderField = options.orderBy || 'startDate';
      const orderDirection = options.orderDirection || 'asc';
      q = query(q, orderBy(orderField, orderDirection));

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  }

  /**
   * Get tournament by ID
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Object|null>} Tournament data or null
   */
  async getTournamentById(tournamentId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const snapshot = await getDoc(tournamentDoc);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error('Failed to fetch tournament');
    }
  }

  /**
   * Get featured tournaments (registration open or upcoming)
   * @param {number} limitCount - Number of tournaments to return
   * @returns {Promise<Array>} Array of featured tournaments
   */
  async getFeaturedTournaments(limitCount = 4) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      const q = query(
        tournamentRef,
        where('status', 'in', ['registration-open', 'upcoming']),
        orderBy('startDate', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
      throw new Error('Failed to fetch featured tournaments');
    }
  }

  /**
   * Create a new tournament
   * @param {Object} tournamentData - Tournament data
   * @returns {Promise<Object>} Created tournament with ID
   */
  async createTournament(tournamentData) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      const docRef = await addDoc(tournamentRef, {
        ...tournamentData,
        currentPlayers: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...tournamentData
      };
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  /**
   * Update tournament
   * @param {string} tournamentId - Tournament ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} Success status
   */
  async updateTournament(tournamentId, updates) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      await updateDoc(tournamentDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament');
    }
  }

  /**
   * Delete tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTournament(tournamentId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      await deleteDoc(tournamentDoc);
      return true;
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw new Error('Failed to delete tournament');
    }
  }

  /**
   * Join tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async joinTournament(tournamentId, userId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      
      // Get current tournament data
      const snapshot = await getDoc(tournamentDoc);
      if (!snapshot.exists()) {
        throw new Error('Tournament not found');
      }

      const tournament = snapshot.data();

      // Check if tournament is full
      if (tournament.currentPlayers >= tournament.maxPlayers) {
        throw new Error('Tournament is full');
      }

      // Check if user already joined
      const participants = tournament.participants || [];
      if (participants.includes(userId)) {
        throw new Error('Already joined this tournament');
      }

      // Update tournament
      await updateDoc(tournamentDoc, {
        participants: [...participants, userId],
        currentPlayers: increment(1),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  /**
   * Leave tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async leaveTournament(tournamentId, userId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      
      const snapshot = await getDoc(tournamentDoc);
      if (!snapshot.exists()) {
        throw new Error('Tournament not found');
      }

      const tournament = snapshot.data();
      const participants = tournament.participants || [];
      
      if (!participants.includes(userId)) {
        throw new Error('Not a participant in this tournament');
      }

      await updateDoc(tournamentDoc, {
        participants: participants.filter(id => id !== userId),
        currentPlayers: increment(-1),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error leaving tournament:', error);
      throw error;
    }
  }

  /**
   * Get user's tournaments
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of user's tournaments
   */
  async getUserTournaments(userId) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      const q = query(
        tournamentRef,
        where('participants', 'array-contains', userId),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw new Error('Failed to fetch user tournaments');
    }
  }
}

export const tournamentService = new TournamentService();