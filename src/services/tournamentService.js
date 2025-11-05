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
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TOURNAMENTS_COLLECTION = 'tournaments';

class TournamentService {
  /**
   * Convert Firestore timestamp to ISO string
   */
  convertTimestampToISO(timestamp) {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    return timestamp;
  }

  /**
   * Transform Firestore document to tournament object
   */
  transformTournamentDoc(doc) {
    const data = doc.data();
    
    return {
      id: doc.id,
      title: data.tournament_name || 'Untitled Tournament',
      description: data.description || '',
      game: data.game || 'Unknown Game',
      image: data.tournament_flyer || data.game_icon || '/assets/raid1.svg',
      prizePool: (data.first_place || 0) + (data.second_place || 0),
      entryFee: data.entry_fee || 0,
      currentPlayers: data.current_participants || 0,
      maxPlayers: data.max_participant || 0,
      format: data.platform || 'Mobile',
      region: 'Ghana',
      status: this.determineStatus(data),
      startDate: this.convertTimestampToISO(data.start_date),
      endDate: this.convertTimestampToISO(data.end_date),
      currency: 'GHS',
      participants: data.participants || [],
      rules: data.rules ? [data.rules] : [],
      requirements: [],
      organizer: data.organizer || 'RAID Arena',
      prizeDistribution: [
        { rank: '1st Place', percentage: 60 },
        { rank: '2nd Place', percentage: 40 }
      ]
    };
  }

  /**
   * Determine tournament status based on dates
   */
  determineStatus(data) {
    const now = new Date();
    const startDate = data.start_date?.toDate ? data.start_date.toDate() : new Date(data.start_date);
    const endDate = data.end_date?.toDate ? data.end_date.toDate() : new Date(data.end_date);
    
    if (now < startDate) {
      return 'registration-open';
    } else if (now >= startDate && now <= endDate) {
      return 'live';
    } else {
      return 'completed';
    }
  }

  /**
   * Get all tournaments with optional filters
   */
  async getAllTournaments(options = {}) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      let q = tournamentRef;

      // Apply game filter
      if (options.game && options.game !== 'all') {
        q = query(q, where('game', '==', options.game));
      }

      // Apply ordering
      q = query(q, orderBy('created_at', 'desc'));

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const tournaments = snapshot.docs.map(doc => this.transformTournamentDoc(doc));

      // Filter by status if specified (done client-side since status is calculated)
      if (options.status && options.status !== 'all') {
        return tournaments.filter(t => t.status === options.status);
      }

      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  }

  /**
   * Get tournament by ID
   */
  async getTournamentById(tournamentId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const snapshot = await getDoc(tournamentDoc);
      
      if (!snapshot.exists()) {
        return null;
      }

      return this.transformTournamentDoc(snapshot);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error('Failed to fetch tournament');
    }
  }

  /**
   * Get featured tournaments (registration open or upcoming)
   */
  async getFeaturedTournaments(limitCount = 4) {
    try {
      const tournaments = await this.getAllTournaments({ limit: limitCount * 2 });
      
      // Filter for registration-open and upcoming, then limit
      const featured = tournaments
        .filter(t => ['registration-open', 'upcoming'].includes(t.status))
        .slice(0, limitCount);

      return featured;
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
      throw new Error('Failed to fetch featured tournaments');
    }
  }

  /**
   * Search tournaments by name or game
   */
  async searchTournaments(searchTerm) {
    try {
      const tournaments = await this.getAllTournaments();
      
      if (!searchTerm) return tournaments;

      const lowerSearch = searchTerm.toLowerCase();
      return tournaments.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) ||
        t.game.toLowerCase().includes(lowerSearch) ||
        t.organizer.toLowerCase().includes(lowerSearch)
      );
    } catch (error) {
      console.error('Error searching tournaments:', error);
      throw new Error('Failed to search tournaments');
    }
  }

  /**
   * Join tournament
   */
  async joinTournament(tournamentId, userId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      
      const snapshot = await getDoc(tournamentDoc);
      if (!snapshot.exists()) {
        throw new Error('Tournament not found');
      }

      const data = snapshot.data();
      const currentParticipants = data.current_participants || 0;
      const maxParticipants = data.max_participant || 0;

      if (currentParticipants >= maxParticipants) {
        throw new Error('Tournament is full');
      }

      const participants = data.participants || [];
      if (participants.includes(userId)) {
        throw new Error('Already joined this tournament');
      }

      await updateDoc(tournamentDoc, {
        participants: [...participants, userId],
        current_participants: increment(1),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  /**
   * Leave tournament
   */
  async leaveTournament(tournamentId, userId) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      
      const snapshot = await getDoc(tournamentDoc);
      if (!snapshot.exists()) {
        throw new Error('Tournament not found');
      }

      const data = snapshot.data();
      const participants = data.participants || [];
      
      if (!participants.includes(userId)) {
        throw new Error('Not a participant in this tournament');
      }

      await updateDoc(tournamentDoc, {
        participants: participants.filter(id => id !== userId),
        current_participants: increment(-1),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error leaving tournament:', error);
      throw error;
    }
  }

  /**
   * Get user's tournaments
   */
  async getUserTournaments(userId) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      const q = query(
        tournamentRef,
        where('participants', 'array-contains', userId),
        orderBy('start_date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.transformTournamentDoc(doc));
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw new Error('Failed to fetch user tournaments');
    }
  }

  /**
   * Get all unique games from tournaments
   */
  async getAvailableGames() {
    try {
      const tournaments = await this.getAllTournaments();
      const games = [...new Set(tournaments.map(t => t.game))];
      return games.sort();
    } catch (error) {
      console.error('Error fetching available games:', error);
      return [];
    }
  }
}

export const tournamentService = new TournamentService();