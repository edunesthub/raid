// src/services/userStatsService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  query, 
  where,
  increment,
  serverTimestamp,
  writeBatch,
  orderBy,
  limit,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserStats, MatchHistoryEntry } from '@/types/stats';

class UserStatsService {
  async initializeUserStats(userId: string): Promise<void> {
    try {
      const statsRef = doc(db, 'userStats', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        await setDoc(statsRef, {
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
        });
      }
    } catch (error) {
      console.error('[Stats] Error initializing stats:', error);
      throw error;
    }
  }

  async recalculateUserStats(userId: string): Promise<UserStats> {
    try {
      const participantsQuery = query(collection(db, 'tournament_participants'), where('userId', '==', userId));
      const snapshot: QuerySnapshot = await getDocs(participantsQuery);
      
      const stats = { xp: 0, played: 0, won: 0, earnings: 0, placements: { first: 0, second: 0, third: 0 }, best: null as number | null };

      for (const pDoc of snapshot.docs) {
        const pData = pDoc.data();
        const tDoc = await getDoc(doc(db, 'tournaments', pData.tournamentId));
        if (!tDoc.exists() || tDoc.data().status !== 'completed') continue;

        const tData = tDoc.data();
        stats.played++;
        stats.xp += 10;

        if (pData.placement === 1) {
          stats.won++;
          stats.placements.first++;
          stats.xp += 50;
          stats.earnings += tData.first_place || 0;
        } else if (pData.placement === 2) {
          stats.placements.second++;
          stats.earnings += tData.second_place || 0;
        } else if (pData.placement === 3) {
          stats.placements.third++;
          stats.earnings += tData.third_place || 0;
        }

        if (pData.placement && (!stats.best || pData.placement < stats.best)) stats.best = pData.placement;
      }

      const userData: UserStats = {
        userId,
        xp: stats.xp,
        level: Math.floor(Math.sqrt(stats.xp / 100)) + 1,
        tournamentsPlayed: stats.played,
        tournamentsWon: stats.won,
        totalEarnings: stats.earnings,
        winRate: stats.played > 0 ? Math.round((stats.won / stats.played) * 1000) / 10 : 0,
        bestPlacement: stats.best,
        placements: stats.placements,
        currentStreak: 0,
        lastUpdated: serverTimestamp(),
        lastRecalculated: new Date().toISOString()
      };

      await setDoc(doc(db, 'userStats', userId), userData, { merge: true });
      return userData;
    } catch (error) {
      console.error('[Stats] Recalculate failed:', error);
      throw error;
    }
  }

  async updateStatsForTournamentCompletion(tournamentId: string): Promise<void> {
    const tDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    if (!tDoc.exists()) return;
    const tData = tDoc.data();
    const pQuery = query(collection(db, 'tournament_participants'), where('tournamentId', '==', tournamentId));
    const pSnap = await getDocs(pQuery);
    const batch = writeBatch(db);

    for (const pDoc of pSnap.docs) {
      const uid = pDoc.data().userId;
      const sRef = doc(db, 'userStats', uid);
      batch.set(sRef, { 
        tournamentsPlayed: increment(1), 
        xp: increment(10),
        lastUpdated: serverTimestamp() 
      }, { merge: true });

      if (uid === tData.winnerId) {
        batch.update(sRef, {
          tournamentsWon: increment(1),
          xp: increment(50),
          'placements.first': increment(1),
          totalEarnings: increment(tData.first_place || 0),
          bestPlacement: 1
        });
      }
    }
    await batch.commit();
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const sDoc = await getDoc(doc(db, 'userStats', userId));
    if (!sDoc.exists()) {
      await this.initializeUserStats(userId);
      return this.getUserStats(userId);
    }
    return sDoc.data() as UserStats;
  }

  async getMatchHistory(userId: string, limitCount: number = 20): Promise<MatchHistoryEntry[]> {
    const q = query(collection(db, 'tournament_participants'), where('userId', '==', userId), orderBy('joinedAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const history: MatchHistoryEntry[] = [];

    for (const d of snap.docs) {
      const pData = d.data();
      const tDoc = await getDoc(doc(db, 'tournaments', pData.tournamentId));
      if (tDoc.exists()) {
        const tData = tDoc.data();
        history.push({
          id: d.id,
          tournamentId: pData.tournamentId,
          tournamentName: tData.name,
          game: tData.game,
          placement: pData.placement,
          status: tData.status,
          date: tData.completedAt?.toDate?.()?.toISOString() || tData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          xpGained: pData.placement === 1 ? 60 : 10,
          prize: pData.placement === 1 ? tData.first_place : (pData.placement === 2 ? tData.second_place : 0)
        });
      }
    }
    return history;
  }

  async getXPLeaderboard(limitCount: number = 50): Promise<UserStats[]> {
    const q = query(collection(db, 'userStats'), orderBy('xp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserStats);
  }

  async recalculateAllUserStats(): Promise<{ processed: number, failed: number, total: number }> {
    const uSnap = await getDocs(collection(db, 'users'));
    let p = 0, f = 0;
    for (const d of uSnap.docs) {
      try { await this.recalculateUserStats(d.id); p++; }
      catch { f++; }
    }
    return { processed: p, failed: f, total: uSnap.size };
  }
}

export const userStatsService = new UserStatsService();