// src/services/tournamentService.ts - COMPLETE KNOCKOUT SYSTEM
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
  setDoc,
  writeBatch,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tournament, TournamentMatch, TournamentParticipant, TournamentStatus } from '@/types/tournament';

const TOURNAMENTS_COLLECTION = 'tournaments';
const PARTICIPANTS_COLLECTION = 'tournament_participants';
const BRACKETS_COLLECTION = 'tournament_brackets';
const MATCHES_COLLECTION = 'tournament_matches';

class TournamentService {
  convertTimestampToISO(timestamp: any): string | null {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    return timestamp;
  }

  transformTournamentDoc(snapshot: DocumentSnapshot|any): Tournament {
    const data = snapshot.data ? snapshot.data() : snapshot;
    if (!data) throw new Error('Document data is empty');

    const country = data.country || data.region || 'Ghana';
    const currency = country === 'Nigeria' ? '₦' : '₵';

    return {
      id: snapshot.id || '',
      name: data.tournament_name || data.name || 'Untitled Tournament',
      title: data.tournament_name || data.name || 'Untitled Tournament',
      game: data.game || 'Unknown Game',
      entry_fee: data.entry_fee || 0,
      prize_pool: data.prize_pool || data.first_place || 0,
      first_place: data.first_place || 0,
      second_place: data.second_place || 0,
      third_place: data.third_place || 0,
      max_participants: data.max_participant || data.max_participants || 0,
      participants_count: data.participant_type === 'Team' ? (data.teams || []).length : (data.current_participants || 0),
      start_date: this.convertTimestampToISO(data.start_date) || '',
      status: this.determineStatus(data),
      winner_id: data.winner_id || data.winnerId || null,
      winnerId: data.winnerId || data.winner_id || null,
      winner_name: data.winner_name || null,
      organizer: data.organizer || 'RAID Arena',
      rules: data.rules || '',
      statsUpdated: data.statsUpdated || false,
      participants: [],
      isUserParticipant: false
    };
  }

  determineStatus(data: any): TournamentStatus {
    if (data.status && ['registration-open', 'upcoming', 'live', 'completed', 'ongoing', 'cancelled'].includes(data.status)) {
      return data.status as TournamentStatus;
    }

    if (!data.start_date || !data.end_date) {
      return 'registration-open';
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

  async isUserParticipant(tournamentId: string, userId: string): Promise<boolean> {
    try {
      const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);
      const participantDoc = await getDoc(participantRef);
      return participantDoc.exists();
    } catch (error) {
      console.error('Error checking participant status:', error);
      return false;
    }
  }

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'active')
      );
      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.data().userId,
        ...doc.data()
      })) as TournamentParticipant[];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  async getAllTournaments(options: { game?: string, limit?: number, userId?: string, status?: string } = {}): Promise<Tournament[]> {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      let q = query(tournamentRef);

      if (options.game && options.game !== 'all') {
        q = query(q, where('game', '==', options.game));
      }

      q = query(q, orderBy('created_at', 'desc'));

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot: QuerySnapshot = await getDocs(q);
      const tournaments = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const tournament = this.transformTournamentDoc(doc);
          if (options.userId) {
            tournament.isUserParticipant = await this.isUserParticipant(tournament.id, options.userId);
          }
          return tournament;
        })
      );

      if (options.status && options.status !== 'all') {
        return tournaments.filter(t => t.status === options.status);
      }

      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  }

  async getTournamentById(tournamentId: string, userId: string | null = null): Promise<Tournament | null> {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const snapshot: DocumentSnapshot = await getDoc(tournamentDoc);

      if (!snapshot.exists()) {
        return null;
      }

      const tournament = this.transformTournamentDoc(snapshot);
      tournament.participants = await this.getTournamentParticipants(tournamentId);

      if (userId && tournament.participants) {
        tournament.isUserParticipant = tournament.participants.some((p: any) => p.userId === userId);
      }

      return tournament;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error('Failed to fetch tournament');
    }
  }

  async getFeaturedTournaments(limitCount: number = 4, userId: string | null = null): Promise<Tournament[]> {
    try {
      const tournaments = await this.getAllTournaments({
        limit: limitCount * 2,
        userId: userId || undefined
      });

      return tournaments
        .filter(t => ['registration-open', 'upcoming'].includes(t.status))
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
      throw new Error('Failed to fetch featured tournaments');
    }
  }

  async searchTournaments(searchTerm: string, userId: string | null = null): Promise<Tournament[]> {
    try {
      const tournaments = await this.getAllTournaments({ userId: userId || undefined });

      if (!searchTerm) return tournaments;

      const lowerSearch = searchTerm.toLowerCase();
      return tournaments.filter(t =>
        (t.title || t.name).toLowerCase().includes(lowerSearch) ||
        t.game.toLowerCase().includes(lowerSearch) ||
        (t.organizer || '').toLowerCase().includes(lowerSearch)
      );
    } catch (error) {
      console.error('Error searching tournaments:', error);
      throw new Error('Failed to search tournaments');
    }
  }

  async joinTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const tournamentDoc = await transaction.get(tournamentRef);
        if (!tournamentDoc.exists()) throw new Error('Tournament not found');

        const tournamentData = tournamentDoc.data() as any;
        const currentCount = tournamentData.current_participants || 0;
        const maxCount = tournamentData.max_participant || 0;

        if (currentCount >= maxCount) throw new Error('Tournament is full');

        const participantDoc = await transaction.get(participantRef);
        if (participantDoc.exists()) throw new Error('Already joined this tournament');

        const status = this.determineStatus(tournamentData);
        if (status !== 'registration-open' && status !== 'upcoming') {
          throw new Error('Tournament registration is closed');
        }

        transaction.set(participantRef, {
          tournamentId,
          userId,
          joinedAt: serverTimestamp(),
          status: 'active',
          eliminated: false,
          paymentStatus: 'pending'
        });

        transaction.update(tournamentRef, {
          current_participants: increment(1),
          updated_at: serverTimestamp()
        });
      });

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  async leaveTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const participantDoc = await transaction.get(participantRef);
        if (!participantDoc.exists()) throw new Error('Not a participant');

        const tournamentDoc = await transaction.get(tournamentRef);
        if (!tournamentDoc.exists()) throw new Error('Tournament not found');

        const tournamentData = tournamentDoc.data() as any;
        const status = this.determineStatus(tournamentData);
        if (status === 'live' || status === 'completed') {
          throw new Error('Cannot leave ongoing/completed tournament');
        }

        transaction.delete(participantRef);
        transaction.update(tournamentRef, {
          current_participants: increment(-1),
          updated_at: serverTimestamp()
        });
      });
      return true;
    } catch (error) {
      console.error('Error leaving tournament:', error);
      throw error;
    }
  }

  async getUserTournaments(userId: string): Promise<Tournament[]> {
    try {
      const q = query(collection(db, PARTICIPANTS_COLLECTION), where('userId', '==', userId));
      const snapshot: QuerySnapshot = await getDocs(q);
      const tournamentIds = snapshot.docs.map(doc => doc.data().tournamentId);
      if (tournamentIds.length === 0) return [];
      const tournaments = await Promise.all(tournamentIds.map(id => this.getTournamentById(id, userId)));
      return tournaments.filter((t): t is Tournament => t !== null);
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw new Error('Failed to fetch user tournaments');
    }
  }

  async getAvailableGames(): Promise<string[]> {
    try {
      const tournaments = await this.getAllTournaments();
      const games = [...new Set(tournaments.map(t => t.game))];
      return games.sort();
    } catch (error) {
      console.error('Error fetching available games:', error);
      return [];
    }
  }

  async generateBracket(tournamentId: string): Promise<{ success: boolean, matches: any[], totalRounds: number }> {
    try {
      const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const tournamentDoc = await getDoc(tournamentRef);
      if (!tournamentDoc.exists()) throw new Error('Tournament not found');
      const tournamentData = tournamentDoc.data() as any;
      if (tournamentData.bracketGenerated) throw new Error('Bracket already generated');

      const participants = await this.getTournamentParticipants(tournamentId);
      if (participants.length < 2) throw new Error('Need at least 2 participants');

      const totalRounds = Math.ceil(Math.log2(participants.length));
      const batch: WriteBatch = writeBatch(db);
      const matches: any[] = [];
      const shuffled = [...participants].sort(() => Math.random() - 0.5);

      for (let i = 0; i < shuffled.length; i += 2) {
        const p1 = shuffled[i];
        const p2 = shuffled[i + 1] || null;
        const matchRef = doc(collection(db, MATCHES_COLLECTION));
        const mData = {
          tournamentId, round: 1, matchNumber: Math.floor(i / 2) + 1,
          player1Id: p1.userId, player2Id: p2 ? p2.userId : null,
          player1Score: null, player2Score: null,
          winnerId: p2 ? null : p1.userId, status: p2 ? 'pending' : 'completed',
          createdAt: serverTimestamp()
        };
        batch.set(matchRef, mData);
        matches.push({ id: matchRef.id, ...mData });
      }

      batch.update(tournamentRef, { bracketGenerated: true, currentRound: 1, totalRounds, status: 'live', updated_at: serverTimestamp() });
      await batch.commit();
      return { success: true, matches, totalRounds };
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  }

  async getTournamentBracket(tournamentId: string): Promise<Record<number, TournamentMatch[]>> {
    try {
      const q = query(collection(db, MATCHES_COLLECTION), where('tournamentId', '==', tournamentId), orderBy('round', 'asc'), orderBy('matchNumber', 'asc'));
      const snapshot: QuerySnapshot = await getDocs(q);
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const sorted: Record<number, TournamentMatch[]> = {};
      matches.forEach(m => {
        if (!sorted[m.round]) sorted[m.round] = [];
        sorted[m.round].push(m);
      });
      return sorted;
    } catch (error) {
      console.error('Error fetching bracket:', error);
      throw error;
    }
  }

  async completeTournament(tournamentId: string, winnerId: string): Promise<any> {
    try {
      await updateDoc(doc(db, TOURNAMENTS_COLLECTION, tournamentId), { status: 'completed', winnerId, winner_id: winnerId, completedAt: serverTimestamp(), updated_at: serverTimestamp() });
      return { success: true, winnerId };
    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }
}

export const tournamentService = new TournamentService();