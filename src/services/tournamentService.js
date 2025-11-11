// src/services/tournamentService.js - FIXED VERSION
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
  Timestamp,
  runTransaction,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TOURNAMENTS_COLLECTION = 'tournaments';
const PARTICIPANTS_COLLECTION = 'tournament_participants';

class TournamentService {
  /**
   * Convert Firestore timestamp to ISO string
   */
  convertTimestampToISO(timestamp) {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp.toDate) {
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
 * Determine tournament status based on data
 */
determineStatus(data) {
  // If status is manually set, use that
  if (data.status && ['registration-open', 'upcoming', 'live', 'completed'].includes(data.status)) {
    return data.status;
  }

  // Otherwise, determine from dates
  if (!data.start_date || !data.end_date) {
    return 'registration-open'; // Default to registration open if no dates
  }

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
   * Check if user is participant in tournament
   */
  async isUserParticipant(tournamentId, userId) {
    try {
      const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);
      const participantDoc = await getDoc(participantRef);
      return participantDoc.exists();
    } catch (error) {
      console.error('Error checking participant status:', error);
      return false;
    }
  }

  /**
   * Get tournament participants
   */
  async getTournamentParticipants(tournamentId) {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('tournamentId', '==', tournamentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().userId);
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
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
      const tournaments = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const tournament = this.transformTournamentDoc(doc);
          
          // Get actual participants if userId provided
          if (options.userId) {
            tournament.isUserParticipant = await this.isUserParticipant(tournament.id, options.userId);
          }
          
          return tournament;
        })
      );

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
  async getTournamentById(tournamentId, userId = null) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const snapshot = await getDoc(tournamentDoc);
      
      if (!snapshot.exists()) {
        return null;
      }

      const tournament = this.transformTournamentDoc(snapshot);
      
      // Get participants list
      tournament.participants = await this.getTournamentParticipants(tournamentId);
      
      // Check if current user is participant
      if (userId) {
        tournament.isUserParticipant = tournament.participants.includes(userId);
      }

      return tournament;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error('Failed to fetch tournament');
    }
  }

  /**
   * Get featured tournaments (registration open or upcoming)
   */
  async getFeaturedTournaments(limitCount = 4, userId = null) {
    try {
      const tournaments = await this.getAllTournaments({ 
        limit: limitCount * 2,
        userId 
      });
      
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
  async searchTournaments(searchTerm, userId = null) {
    try {
      const tournaments = await this.getAllTournaments({ userId });
      
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
   * Join tournament - IMPROVED WITH TRANSACTION
   */
  async joinTournament(tournamentId, userId) {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        // Get current tournament data
        const tournamentDoc = await transaction.get(tournamentRef);
        
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const currentCount = tournamentData.current_participants || 0;
        const maxCount = tournamentData.max_participant || 0;

        // Check if tournament is full
        if (currentCount >= maxCount) {
          throw new Error('Tournament is full');
        }

        // Check if already joined
        const participantDoc = await transaction.get(participantRef);
        if (participantDoc.exists()) {
          throw new Error('Already joined this tournament');
        }

        // Check tournament status
        const status = this.determineStatus(tournamentData);
        if (status !== 'registration-open' && status !== 'upcoming') {
          throw new Error('Tournament registration is closed');
        }

        // Add participant record
        transaction.set(participantRef, {
          tournamentId,
          userId,
          joinedAt: serverTimestamp(),
          status: 'active',
          paymentStatus: 'pending'
        });

        // Update tournament participant count
        transaction.update(tournamentRef, {
          current_participants: increment(1),
          updated_at: serverTimestamp()
        });
      });

      console.log('Successfully joined tournament:', tournamentId);
      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  /**
   * Leave tournament - IMPROVED WITH TRANSACTION
   */
  async leaveTournament(tournamentId, userId) {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        // Check if user is participant
        const participantDoc = await transaction.get(participantRef);
        if (!participantDoc.exists()) {
          throw new Error('Not a participant in this tournament');
        }

        // Get tournament data
        const tournamentDoc = await transaction.get(tournamentRef);
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const status = this.determineStatus(tournamentData);

        // Check if tournament has started
        if (status === 'live' || status === 'completed') {
          throw new Error('Cannot leave tournament after it has started');
        }

        // Delete participant record
        transaction.delete(participantRef);

        // Update tournament participant count
        transaction.update(tournamentRef, {
          current_participants: increment(-1),
          updated_at: serverTimestamp()
        });
      });

      console.log('Successfully left tournament:', tournamentId);
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
      // Get user's participant records
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const tournamentIds = snapshot.docs.map(doc => doc.data().tournamentId);

      if (tournamentIds.length === 0) {
        return [];
      }

      // Get tournament details for each ID
      const tournaments = await Promise.all(
        tournamentIds.map(id => this.getTournamentById(id, userId))
      );

      return tournaments.filter(t => t !== null);
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