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
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types/auth';
import { UserStats } from '@/types/stats';

const USERS_COLLECTION = 'users';
const USER_STATS_COLLECTION = 'userStats';

class UserService {
  /**
   * Search users by name (firstName, lastName, or username)
   */
  async searchUsersByName(searchTerm: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const term = searchTerm.toLowerCase();

      // Fetch a larger batch to filter client-side
      const q = query(usersRef, limit(1000));
      const snapshot: QuerySnapshot = await getDocs(q);

      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(user => {
          return (
            user.username?.toLowerCase().includes(term) ||
            user.firstName?.toLowerCase().includes(term) ||
            user.lastName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
          );
        });

      return results.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get user profile data
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = doc(db, USERS_COLLECTION, userId);
      const snapshot: DocumentSnapshot = await getDoc(userDoc);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const statsDoc = doc(db, USER_STATS_COLLECTION, userId);
      const snapshot: DocumentSnapshot = await getDoc(statsDoc);

      if (!snapshot.exists()) {
        // Return default stats if none exist
        return {
          userId,
          xp: 0,
          level: 1,
          tournamentsPlayed: 0,
          tournamentsWon: 0,
          totalEarnings: 0,
          winRate: 0,
          currentStreak: 0,
          bestPlacement: null,
          placements: { first: 0, second: 0, third: 0 },
          lastUpdated: serverTimestamp()
        };
      }

      return snapshot.data() as UserStats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user stats');
    }
  }

  /**
   * Get user's tournament matches
   */
  async getUserMatches(userId: string, status: 'upcoming' | 'completed' | 'all' = 'all'): Promise<any[]> {
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

      const snapshot: QuerySnapshot = await getDocs(q);
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
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
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
   */
  async getLeaderboard(metric: keyof UserStats = 'tournamentsWon', limitCount: number = 50): Promise<any[]> {
    try {
      const statsRef = collection(db, USER_STATS_COLLECTION);
      const q = query(
        statsRef,
        orderBy(metric as string, 'desc'),
        limit(limitCount)
      );

      const snapshot: QuerySnapshot = await getDocs(q);
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

  /**
   * Get multiple users by their emails
   */
  async getUsersByEmails(emails: string[]): Promise<UserProfile[]> {
    if (!emails || emails.length === 0) return [];
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const chunks: string[][] = [];
      for (let i = 0; i < emails.length; i += 30) {
        chunks.push(emails.slice(i, i + 30));
      }

      const results: UserProfile[] = [];
      for (const chunk of chunks) {
        const q = query(usersRef, where('email', 'in', chunk));
        const snapshot: QuerySnapshot = await getDocs(q);
        snapshot.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
      }
      return results;
    } catch (error) {
      console.error('Error fetching users by emails:', error);
      throw new Error('Failed to fetch users');
    }
  }
}

export const userService = new UserService();