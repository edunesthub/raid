// src/services/tournamentService.js - COMPLETE KNOCKOUT SYSTEM
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
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TOURNAMENTS_COLLECTION = 'tournaments';
const PARTICIPANTS_COLLECTION = 'tournament_participants';
const BRACKETS_COLLECTION = 'tournament_brackets';
const MATCHES_COLLECTION = 'tournament_matches';

class TournamentService {
  // ========== EXISTING METHODS (unchanged) ==========

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

  transformTournamentDoc(doc) {
    const data = doc.data();
    const rawCountry = data.country || data.region || 'Ghana';
    const normalized = typeof rawCountry === 'string' ? rawCountry.trim().toLowerCase() : 'ghana';
    const country = normalized === 'nigeria' ? 'Nigeria' : 'Ghana';
    const currency = country === 'Nigeria' ? '₦' : '₵';

    return {
      id: doc.id,
      title: data.tournament_name || 'Untitled Tournament',
      description: data.description || '',
      game: data.game || 'Unknown Game',
      image: data.tournament_flyer || data.game_icon || '/assets/raid1.svg',
      prizePool: data.first_place || 0,
      entryFee: data.entry_fee || 0,
      currentPlayers: data.participant_type === 'Team' ? (data.teams || []).length : (data.current_participants || 0),
      maxPlayers: data.max_participant || 0,
      format: data.format || data.platform || 'Knockout',
      region: country,
      country,
      status: this.determineStatus(data),
      startDate: this.convertTimestampToISO(data.start_date),
      endDate: this.convertTimestampToISO(data.end_date),
      currency,
      rules: Array.isArray(data.rules) ? data.rules : (data.rules ? [data.rules] : []),
      twitch_link: data.twitch_link || '',
      requirements: [],
      organizer: data.organizer || 'RAID Arena',
      prizeDistribution: Array.isArray(data.prize_distribution) ? data.prize_distribution : [
        { rank: '1st Place', reward: data.first_place || 'TBD' }
      ],
      first_place: data.first_place || '',
      bracketGenerated: data.bracketGenerated || false,
      currentRound: data.currentRound || 0,
      totalRounds: data.totalRounds || 0,
      participant_type: data.participant_type || 'Individual',
      squad_size: data.squad_size || null,
      teams: data.teams || [],
      rosters: data.rosters || {},
      memberPairings: data.memberPairings || []
    };
  }

  determineStatus(data) {
    if (data.status && ['registration-open', 'upcoming', 'live', 'completed'].includes(data.status)) {
      return data.status;
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

  async getTournamentParticipants(tournamentId) {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.data().userId,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  async getAllTournaments(options = {}) {
    try {
      const tournamentRef = collection(db, TOURNAMENTS_COLLECTION);
      let q = tournamentRef;

      if (options.game && options.game !== 'all') {
        q = query(q, where('game', '==', options.game));
      }

      q = query(q, orderBy('created_at', 'desc'));

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
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

  async getTournamentById(tournamentId, userId = null) {
    try {
      const tournamentDoc = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const snapshot = await getDoc(tournamentDoc);

      if (!snapshot.exists()) {
        return null;
      }

      const tournament = this.transformTournamentDoc(snapshot);

      tournament.participants = await this.getTournamentParticipants(tournamentId);

      if (userId) {
        tournament.isUserParticipant = tournament.participants.some(p => p.id === userId);
      }

      return tournament;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error('Failed to fetch tournament');
    }
  }

  async getFeaturedTournaments(limitCount = 4, userId = null) {
    try {
      const tournaments = await this.getAllTournaments({
        limit: limitCount * 2,
        userId
      });

      const featured = tournaments
        .filter(t => ['registration-open', 'upcoming'].includes(t.status))
        .slice(0, limitCount);

      return featured;
    } catch (error) {
      console.error('Error fetching featured tournaments:', error);
      throw new Error('Failed to fetch featured tournaments');
    }
  }

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

  async joinTournament(tournamentId, userId) {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const tournamentDoc = await transaction.get(tournamentRef);

        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const currentCount = tournamentData.current_participants || 0;
        const maxCount = tournamentData.max_participant || 0;

        if (currentCount >= maxCount) {
          throw new Error('Tournament is full');
        }

        const participantDoc = await transaction.get(participantRef);
        if (participantDoc.exists()) {
          throw new Error('Already joined this tournament');
        }

        const status = this.determineStatus(tournamentData);
        if (status !== 'registration-open' && status !== 'upcoming') {
          throw new Error('Tournament registration is closed');
        }

        if (tournamentData.participant_type === 'Team') {
          throw new Error('This is a squad tournament. Please register your team via the Manager Portal.');
        }

        // Duo tournaments allow individual payments, users will link up later
        // No change needed here if we treat Duo as Individual-style join

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

      console.log('Successfully joined tournament:', tournamentId);
      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  async leaveTournament(tournamentId, userId) {
    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, `${tournamentId}_${userId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const participantDoc = await transaction.get(participantRef);
        if (!participantDoc.exists()) {
          throw new Error('Not a participant in this tournament');
        }

        const tournamentDoc = await transaction.get(tournamentRef);
        if (!tournamentDoc.exists()) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const status = this.determineStatus(tournamentData);

        if (status === 'live' || status === 'completed') {
          throw new Error('Cannot leave tournament after it has started');
        }

        transaction.delete(participantRef);

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

  async getUserTournaments(userId) {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const tournamentIds = snapshot.docs.map(doc => doc.data().tournamentId);

      if (tournamentIds.length === 0) {
        return [];
      }

      const tournaments = await Promise.all(
        tournamentIds.map(id => this.getTournamentById(id, userId))
      );

      return tournaments.filter(t => t !== null);
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw new Error('Failed to fetch user tournaments');
    }
  }

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

  // ========== NEW KNOCKOUT TOURNAMENT METHODS ==========

  /**
   * Calculate number of rounds needed
   */
  calculateTotalRounds(participantCount) {
    return Math.ceil(Math.log2(participantCount));
  }

  /**
   * Get round name
   */
  getRoundName(roundNumber, totalRounds) {
    const roundsFromEnd = totalRounds - roundNumber;

    switch (roundsFromEnd) {
      case 0:
        return 'Final';
      case 1:
        return 'Semifinals';
      case 2:
        return 'Quarterfinals';
      default:
        return `Round ${roundNumber}`;
    }
  }

  /**
   * Shuffle array for random matching
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate bracket for knockout tournament
   */
  async generateBracket(tournamentId) {
    try {
      const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const tournamentDoc = await getDoc(tournamentRef);

      if (!tournamentDoc.exists()) {
        throw new Error('Tournament not found');
      }

      const tournamentData = tournamentDoc.data();

      // Check if bracket already generated
      if (tournamentData.bracketGenerated) {
        throw new Error('Bracket already generated for this tournament');
      }

      // Get active participants (individuals or members)
      const isTeamTournament = tournamentData.participant_type === 'Team';
      let participants = [];

      if (isTeamTournament) {
        // Collect all members from rosters
        const rosters = tournamentData.rosters || {};
        const allEmails = [];
        Object.values(rosters).forEach(roster => {
          if (Array.isArray(roster)) {
            allEmails.push(...roster);
          }
        });

        if (allEmails.length === 0) {
          throw new Error('No members found in squad rosters. Teams must select their lineups before you can generate the bracket.');
        }

        // Resolve emails to actual user objects/IDs
        const { userService } = await import('./userService');
        const userProfiles = await userService.getUsersByEmails(allEmails);

        // Map back to include team context if needed, but primarily we need user IDs for matches
        participants = userProfiles.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username,
          teamId: Object.keys(rosters).find(tid => rosters[tid].includes(u.email))
        }));
      } else {
        // For individual tournaments, fetch from participants collection
        participants = await this.getTournamentParticipants(tournamentId);
      }

      if (participants.length < 2) {
        const typeLabel = isTeamTournament ? 'squad members' : 'active participants';
        throw new Error(`Need at least 2 ${typeLabel} to generate bracket. Current: ${participants.length}`);
      }

      // Calculate rounds
      const totalRounds = this.calculateTotalRounds(participants.length);

      // Generate first round matches
      const batch = writeBatch(db);
      const matches = [];

      let firstRoundParticipants = [];
      if (isTeamTournament) {
        // SPECIAL LOGIC: Try to pair members of different teams against each other in Round 1
        const pools = {};
        participants.forEach(p => {
          if (!pools[p.teamId]) pools[p.teamId] = [];
          pools[p.teamId].push(p);
        });

        const poolKeys = Object.keys(pools);
        if (poolKeys.length >= 2) {
          // Cross-team pairing
          const p1Pool = pools[poolKeys[0]];
          const p2Pool = pools[poolKeys[1]] || [];
          // This is a simplified version; for multiple teams we'd need more complex logic
          // but let's at least fulfill the "pair members of a team with members of the other"
          const maxLen = Math.max(p1Pool.length, p2Pool.length);
          for (let i = 0; i < maxLen; i++) {
            if (p1Pool[i]) firstRoundParticipants.push(p1Pool[i]);
            if (p2Pool[i]) firstRoundParticipants.push(p2Pool[i]);
          }
          // Add any remaining pools
          poolKeys.slice(2).forEach(tk => {
            firstRoundParticipants.push(...pools[tk]);
          });
        } else {
          firstRoundParticipants = this.shuffleArray(participants);
        }
      } else {
        firstRoundParticipants = this.shuffleArray(participants);
      }

      for (let i = 0; i < firstRoundParticipants.length; i += 2) {
        const player1 = firstRoundParticipants[i];
        const player2 = firstRoundParticipants[i + 1] || null; // Bye if odd number

        const matchRef = doc(collection(db, MATCHES_COLLECTION));
        const matchData = {
          tournamentId,
          round: 1,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: player1.id,
          player2Id: player2 ? player2.id : null,
          player1Score: null,
          player2Score: null,
          winnerId: player2 ? null : player1.id, // Auto-win for bye
          status: player2 ? 'pending' : 'completed',
          createdAt: serverTimestamp()
        };

        batch.set(matchRef, matchData);
        matches.push({ id: matchRef.id, ...matchData });
      }

      // Update tournament
      batch.update(tournamentRef, {
        bracketGenerated: true,
        currentRound: 1,
        totalRounds,
        status: 'live',
        updated_at: serverTimestamp()
      });

      await batch.commit();

      console.log(`Generated bracket with ${matches.length} matches in round 1`);
      return { success: true, matches, totalRounds };
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  }

  /**
   * Get tournament bracket
   */
  async getTournamentBracket(tournamentId) {
    try {
      const q = query(
        collection(db, MATCHES_COLLECTION),
        where('tournamentId', '==', tournamentId),
        orderBy('round', 'asc'),
        orderBy('matchNumber', 'asc')
      );

      const snapshot = await getDocs(q);
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get player profiles for each match
      const matchesWithParticipants = await Promise.all(
        matches.map(async (match) => {
          const player1 = match.player1Id ? await this.getUserData(match.player1Id) : null;
          const player2 = match.player2Id ? await this.getUserData(match.player2Id) : null;

          return {
            ...match,
            player1,
            player2
          };
        })
      );

      // Group by rounds
      const rounds = {};
      matchesWithParticipants.forEach(match => {
        if (!rounds[match.round]) {
          rounds[match.round] = [];
        }
        rounds[match.round].push(match);
      });

      return rounds;
    } catch (error) {
      console.error('Error fetching bracket:', error);
      throw error;
    }
  }

  /**
   * Get user data for bracket display
   */
  async getUserData(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        id: userId,
        username: data.username || 'Unknown',
        avatarUrl: data.avatarUrl || null
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Get team data for bracket display
   */
  async getTeamData(teamId) {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) return null;

      const data = teamDoc.data();
      return {
        id: teamId,
        username: data.name || 'Unknown Team', // Using username prop to remain compatible with Bracket component
        avatarUrl: data.avatarUrl || null
      };
    } catch (error) {
      console.error('Error fetching team data:', error);
      return null;
    }
  }

  /**
   * Submit match result and progress winner
   */
  async submitMatchResult(matchId, player1Score, player2Score) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId);
      const matchDoc = await getDoc(matchRef);

      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const matchData = matchDoc.data();

      if (matchData.status === 'completed') {
        throw new Error('Match already completed');
      }

      if (!matchData.player2Id) {
        throw new Error('Cannot submit result for bye match');
      }

      // Determine winner
      const winnerId = player1Score > player2Score ? matchData.player1Id : matchData.player2Id;
      const loserId = winnerId === matchData.player1Id ? matchData.player2Id : matchData.player1Id;

      // Update match
      await updateDoc(matchRef, {
        player1Score,
        player2Score,
        winnerId,
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // Eliminate loser
      const loserParticipantRef = doc(db, PARTICIPANTS_COLLECTION, `${matchData.tournamentId}_${loserId}`);
      await updateDoc(loserParticipantRef, {
        eliminated: true,
        eliminatedAt: serverTimestamp(),
        eliminatedInRound: matchData.round
      });

      // Check if round is complete and generate next round
      await this.checkAndGenerateNextRound(matchData.tournamentId, matchData.round);

      console.log(`Match ${matchId} completed. Winner: ${winnerId}`);
      return { success: true, winnerId };
    } catch (error) {
      console.error('Error submitting match result:', error);
      throw error;
    }
  }

  /**
   * Check if round is complete and generate next round
   */
  async checkAndGenerateNextRound(tournamentId, completedRound) {
    try {
      // Get all matches in the completed round
      const q = query(
        collection(db, MATCHES_COLLECTION),
        where('tournamentId', '==', tournamentId),
        where('round', '==', completedRound)
      );

      const snapshot = await getDocs(q);
      const matches = snapshot.docs.map(doc => doc.data());

      // Check if all matches are completed
      const allCompleted = matches.every(match => match.status === 'completed');

      if (!allCompleted) {
        return { roundComplete: false };
      }

      // Get winners
      const winners = matches.map(match => match.winnerId).filter(id => id);

      // If only one winner, tournament is complete
      if (winners.length === 1) {
        await this.completeTournament(tournamentId, winners[0]);
        return { tournamentComplete: true, winnerId: winners[0] };
      }

      // Generate next round
      const nextRound = completedRound + 1;
      const batch = writeBatch(db);

      // Shuffle winners for next round
      const shuffledWinners = this.shuffleArray(winners);

      for (let i = 0; i < shuffledWinners.length; i += 2) {
        const player1 = shuffledWinners[i];
        const player2 = shuffledWinners[i + 1] || null;

        const matchRef = doc(collection(db, MATCHES_COLLECTION));
        batch.set(matchRef, {
          tournamentId,
          round: nextRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: player1,
          player2Id: player2,
          player1Score: null,
          player2Score: null,
          winnerId: player2 ? null : player1,
          status: player2 ? 'pending' : 'completed',
          createdAt: serverTimestamp()
        });
      }

      // Update tournament current round
      const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      batch.update(tournamentRef, {
        currentRound: nextRound,
        updated_at: serverTimestamp()
      });

      await batch.commit();

      console.log(`Generated round ${nextRound} with ${Math.ceil(shuffledWinners.length / 2)} matches`);
      return { roundComplete: true, nextRound };
    } catch (error) {
      console.error('Error checking/generating next round:', error);
      throw error;
    }
  }

  /**
   * Complete tournament
   */
  async completeTournament(tournamentId, winnerId) {
    try {
      const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);

      await updateDoc(tournamentRef, {
        status: 'completed',
        winnerId,
        completedAt: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      console.log(`Tournament ${tournamentId} completed. Winner: ${winnerId}`);
      return { success: true, winnerId };
    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }

  /**
   * Get live tournaments for admin
   */
  async getLiveTournaments() {
    try {
      const q = query(
        collection(db, TOURNAMENTS_COLLECTION),
        where('status', '==', 'live'),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.transformTournamentDoc(doc)
      }));
    } catch (error) {
      console.error('Error fetching live tournaments:', error);
      throw error;
    }
  }
  /**
   * Generate random pairings between members of different squads
   */
  async generateMemberPairings(tournamentId) {
    try {
      const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
      const tournamentDoc = await getDoc(tournamentRef);

      if (!tournamentDoc.exists()) {
        throw new Error('Tournament not found');
      }

      const tournamentData = tournamentDoc.data();
      const rosters = tournamentData.rosters || {};
      const teamIds = Object.keys(rosters);

      if (teamIds.length < 2) {
        throw new Error('Not enough squads with selected lineups. Need at least 2 squads to have set their rosters before pairings can be generated.');
      }

      // Collect all members with their team context
      let allMembers = [];
      teamIds.forEach(teamId => {
        const members = rosters[teamId] || [];
        members.forEach(email => {
          allMembers.push({ email, teamId });
        });
      });

      if (allMembers.length < 2) {
        throw new Error('Not enough members to generate pairings');
      }

      const pairings = [];
      const MAX_ATTEMPTS = 100;
      let success = false;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const tempPairings = [];
        const available = [...allMembers];
        this.shuffleArray(available);

        let failed = false;
        while (available.length > 1) {
          const m1 = available.pop();
          const m2Index = available.findIndex(m => m.teamId !== m1.teamId);

          if (m2Index === -1) {
            failed = true;
            break;
          }

          const m2 = available.splice(m2Index, 1)[0];
          tempPairings.push({ player1: m1, player2: m2 });
        }

        if (!failed) {
          if (available.length > 0) {
            tempPairings.push({ player1: available[0], player2: null, isBye: true });
          }
          pairings.push(...tempPairings);
          success = true;
          break;
        }
      }

      if (!success) {
        throw new Error('Could not generate valid pairings after multiple attempts. Try adding more members or squads.');
      }

      // Save pairings to tournament document
      await updateDoc(tournamentRef, {
        memberPairings: pairings,
        pairingsGeneratedAt: serverTimestamp()
      });

      return pairings;
    } catch (error) {
      console.error('Error generating member pairings:', error);
      throw error;
    }
  }
}

export const tournamentService = new TournamentService();