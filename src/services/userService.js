// src/services/userService.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const USERS_COLLECTION = 'users';
const USER_STATS_COLLECTION = 'userStats';

class UserService {
  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User profile data
   */
  async getUserProfile(userId) {
    try {
      const userDoc = doc(db, USERS_COLLECTION, userId);
      const snapshot = await getDoc(userDoc);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    try {
      const statsDoc = doc(db, USER_STATS_COLLECTION, userId);
      const snapshot = await getDoc(statsDoc);
      
      if (!snapshot.exists()) {
        // Return default stats if none exist
        return {
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          totalEarnings: 0,
          winRate: 0,
          currentStreak: 0,
          bestPlacement: null
        };
      }

      return snapshot.data();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user stats');
    }
  }

  /**
   * Get user's tournament matches
   * @param {string} userId - User ID
   * @param {string} status - Match status filter ('upcoming' | 'completed' | 'all')
   * @returns {Promise<Array>} Array of matches
   */
  async getUserMatches(userId, status = 'all') {
    try {
      const matchesRef = collection(db, 'matches');
      let q = query(
        matchesRef,
        where('participants', 'array-contains', userId),
        orderBy('date', 'desc')
      );

      if (status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user matches:', error);
      throw new Error('Failed to fetch user matches');
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<boolean>} Success status
   */
  async updateUserProfile(userId, updates) {
    try {
      const userDoc = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Get leaderboard
   * @param {string} metric - Metric to order by ('totalEarnings' | 'tournamentsWon' | 'winRate')
   * @param {number} limitCount - Number of users to return
   * @returns {Promise<Array>} Array of top users
   */
  async getLeaderboard(metric = 'totalEarnings', limitCount = 50) {
    try {
      const statsRef = collection(db, USER_STATS_COLLECTION);
      const q = query(
        statsRef,
        orderBy(metric, 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const leaderboardData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userId = doc.id;
          const stats = doc.data();
          
          // Get user profile data
          const userProfile = await this.getUserProfile(userId);
          
          return {
            userId,
            username: userProfile?.username || 'Unknown',
            avatarUrl: userProfile?.avatarUrl || null,
            firstName: userProfile?.firstName || '',
            lastName: userProfile?.lastName || '',
            ...stats
          };
        })
      );

      return leaderboardData;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }
}

export const userService = new UserService();