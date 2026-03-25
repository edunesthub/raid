// src/services/userStatsService.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc,
  query, 
  where,
  increment,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class UserStatsService {
  /**
   * Initialize user stats document
   */
  async initializeUserStats(userId) {
    try {
      const statsRef = doc(db, 'userStats', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        await setDoc(statsRef, {
          userId,
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          totalEarnings: 0,
          winRate: 0,
          currentStreak: 0,
          bestPlacement: null,
          placements: {
            first: 0,
            second: 0,
            third: 0
          },
          lastUpdated: serverTimestamp()
        });
        console.log(`[Stats] Initialized stats for user ${userId}`);
      }
    } catch (error) {
      console.error('[Stats] Error initializing user stats:', error);
      throw error;
    }
  }

  /**
   * Calculate all stats for a user from scratch
   */
  async recalculateUserStats(userId) {
    try {
      console.log(`[Stats] Recalculating stats for user ${userId}`);

      // Get all tournament participations
      const participantsQuery = query(
        collection(db, 'tournament_participants'),
        where('userId', '==', userId)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      
      const stats = {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalEarnings: 0,
        placements: {
          first: 0,
          second: 0,
          third: 0
        },
        bestPlacement: null,
        completedTournaments: []
      };

      // Process each participation
      for (const participantDoc of participantsSnapshot.docs) {
        const participantData = participantDoc.data();
        const tournamentId = participantData.tournamentId;

        // Get tournament data
        const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
        if (!tournamentDoc.exists()) continue;

        const tournamentData = tournamentDoc.data();

        // Only count completed tournaments
        if (tournamentData.status !== 'completed') continue;

        stats.tournamentsPlayed++;

        // Check placement
        const placement = participantData.placement;
        
        if (placement) {
          stats.completedTournaments.push({
            tournamentId,
            placement,
            tournamentName: tournamentData.tournament_name
          });

          // Count placements
          if (placement === 1) {
            stats.tournamentsWon++;
            stats.placements.first++;
            
            // Calculate earnings (first place gets the prize)
            const firstPlacePrize = tournamentData.first_place || 0;
            stats.totalEarnings += firstPlacePrize;
          } else if (placement === 2) {
            stats.placements.second++;
            // Add second place earnings if defined
            const secondPlacePrize = tournamentData.second_place || 0;
            stats.totalEarnings += secondPlacePrize;
          } else if (placement === 3) {
            stats.placements.third++;
            // Add third place earnings if defined
            const thirdPlacePrize = tournamentData.third_place || 0;
            stats.totalEarnings += thirdPlacePrize;
          }

          // Update best placement
          if (!stats.bestPlacement || placement < stats.bestPlacement) {
            stats.bestPlacement = placement;
          }
        }

        // Alternative: Check if user is the winner
        if (tournamentData.winnerId === userId) {
          if (!placement) {
            stats.tournamentsWon++;
            stats.placements.first++;
            
            const firstPlacePrize = tournamentData.first_place || 0;
            stats.totalEarnings += firstPlacePrize;
            
            if (!stats.bestPlacement || 1 < stats.bestPlacement) {
              stats.bestPlacement = 1;
            }
          }
        }
      }

      // Calculate win rate
      stats.winRate = stats.tournamentsPlayed > 0 
        ? (stats.tournamentsWon / stats.tournamentsPlayed) * 100 
        : 0;

      // Update user stats document
      const statsRef = doc(db, 'userStats', userId);
      await setDoc(statsRef, {
        userId,
        tournamentsPlayed: stats.tournamentsPlayed,
        tournamentsWon: stats.tournamentsWon,
        totalEarnings: stats.totalEarnings,
        winRate: Math.round(stats.winRate * 10) / 10, // Round to 1 decimal
        currentStreak: 0, // TODO: Calculate streak
        bestPlacement: stats.bestPlacement,
        placements: stats.placements,
        lastUpdated: serverTimestamp(),
        lastRecalculated: new Date().toISOString()
      }, { merge: true });

      console.log(`[Stats] Updated stats for ${userId}:`, stats);
      return stats;
    } catch (error) {
      console.error('[Stats] Error recalculating user stats:', error);
      throw error;
    }
  }

  /**
   * Update stats when tournament completes
   */
  async updateStatsForTournamentCompletion(tournamentId) {
    try {
      console.log(`[Stats] Updating stats for completed tournament ${tournamentId}`);

      // Get tournament data
      const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (!tournamentDoc.exists()) {
        throw new Error('Tournament not found');
      }

      const tournamentData = tournamentDoc.data();
      const winnerId = tournamentData.winnerId;
      const secondPlaceId = tournamentData.secondPlaceId;
      const thirdPlaceId = tournamentData.thirdPlaceId;

      // Get all participants
      const participantsQuery = query(
        collection(db, 'tournament_participants'),
        where('tournamentId', '==', tournamentId)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      const batch = writeBatch(db);

      // Update stats for all participants
      for (const participantDoc of participantsSnapshot.docs) {
        const userId = participantDoc.data().userId;
        const statsRef = doc(db, 'userStats', userId);

        // Initialize if doesn't exist
        const statsDoc = await getDoc(statsRef);
        if (!statsDoc.exists()) {
          await this.initializeUserStats(userId);
        }

        // Increment tournaments played
        batch.update(statsRef, {
          tournamentsPlayed: increment(1),
          lastUpdated: serverTimestamp()
        });
      }

      // Update winner stats
      if (winnerId) {
        const winnerStatsRef = doc(db, 'userStats', winnerId);
        const winnerStatsDoc = await getDoc(winnerStatsRef);
        
        if (!winnerStatsDoc.exists()) {
          await this.initializeUserStats(winnerId);
        }

        const currentStats = winnerStatsDoc.data() || {};
        const newWins = (currentStats.tournamentsWon || 0) + 1;
        const newPlayed = (currentStats.tournamentsPlayed || 0) + 1;
        const newWinRate = (newWins / newPlayed) * 100;

        batch.update(winnerStatsRef, {
          tournamentsWon: increment(1),
          'placements.first': increment(1),
          totalEarnings: increment(tournamentData.first_place || 0),
          winRate: Math.round(newWinRate * 10) / 10,
          bestPlacement: 1,
          lastUpdated: serverTimestamp()
        });

        console.log(`[Stats] Updated winner ${winnerId} stats`);
      }

      // Update second place stats
      if (secondPlaceId) {
        const secondStatsRef = doc(db, 'userStats', secondPlaceId);
        const secondStatsDoc = await getDoc(secondStatsRef);
        
        if (!secondStatsDoc.exists()) {
          await this.initializeUserStats(secondPlaceId);
        }

        const currentBest = secondStatsDoc.data()?.bestPlacement;

        batch.update(secondStatsRef, {
          'placements.second': increment(1),
          totalEarnings: increment(tournamentData.second_place || 0),
          bestPlacement: !currentBest || 2 < currentBest ? 2 : currentBest,
          lastUpdated: serverTimestamp()
        });

        console.log(`[Stats] Updated second place ${secondPlaceId} stats`);
      }

      // Update third place stats
      if (thirdPlaceId) {
        const thirdStatsRef = doc(db, 'userStats', thirdPlaceId);
        const thirdStatsDoc = await getDoc(thirdStatsRef);
        
        if (!thirdStatsDoc.exists()) {
          await this.initializeUserStats(thirdPlaceId);
        }

        const currentBest = thirdStatsDoc.data()?.bestPlacement;

        batch.update(thirdStatsRef, {
          'placements.third': increment(1),
          totalEarnings: increment(tournamentData.third_place || 0),
          bestPlacement: !currentBest || 3 < currentBest ? 3 : currentBest,
          lastUpdated: serverTimestamp()
        });

        console.log(`[Stats] Updated third place ${thirdPlaceId} stats`);
      }

      await batch.commit();
      console.log(`[Stats] Successfully updated stats for tournament ${tournamentId}`);

      return true;
    } catch (error) {
      console.error('[Stats] Error updating stats for tournament completion:', error);
      throw error;
    }
  }

  /**
   * Recalculate stats for all users (admin function)
   */
  async recalculateAllUserStats() {
    try {
      console.log('[Stats] Starting full recalculation for all users');

      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userIds = usersSnapshot.docs.map(doc => doc.id);

      console.log(`[Stats] Found ${userIds.length} users to process`);

      let processed = 0;
      let failed = 0;

      // Process each user
      for (const userId of userIds) {
        try {
          await this.recalculateUserStats(userId);
          processed++;
          
          if (processed % 10 === 0) {
            console.log(`[Stats] Progress: ${processed}/${userIds.length} users processed`);
          }
        } catch (error) {
          console.error(`[Stats] Failed to process user ${userId}:`, error);
          failed++;
        }
      }

      console.log(`[Stats] Recalculation complete. Processed: ${processed}, Failed: ${failed}`);

      return {
        total: userIds.length,
        processed,
        failed
      };
    } catch (error) {
      console.error('[Stats] Error in full recalculation:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const statsRef = doc(db, 'userStats', userId);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        await this.initializeUserStats(userId);
        return {
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          totalEarnings: 0,
          winRate: 0,
          currentStreak: 0,
          bestPlacement: null,
          placements: {
            first: 0,
            second: 0,
            third: 0
          }
        };
      }

      return statsDoc.data();
    } catch (error) {
      console.error('[Stats] Error getting user stats:', error);
      throw error;
    }
  }
}

export const userStatsService = new UserStatsService();