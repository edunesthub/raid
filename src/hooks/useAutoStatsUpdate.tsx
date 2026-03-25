// src/hooks/useAutoStatsUpdate.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userStatsService } from '@/services/userStatsService';

export function useAutoStatsUpdate() {
  useEffect(() => {
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('status', '==', 'completed')
    );

    const unsubscribe = onSnapshot(tournamentsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const tournamentData = change.doc.data();
          const tournamentId = change.doc.id;

          if (tournamentData.status === 'completed' && !tournamentData.statsUpdated) {
            console.log(`[AutoStats] Tournament ${tournamentId} completed, updating stats...`);
            try {
              await userStatsService.updateStatsForTournamentCompletion(tournamentId);
            } catch (error) {
              console.error('[AutoStats] Error updating stats:', error);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);
}

interface RecalculateResult {
  processed: number;
  failed: number;
  total: number;
}

export function StatsRecalculationButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecalculateResult | null>(null);

  const handleRecalculate = async () => {
    if (!confirm('Recalculate stats for ALL users? This may take a while.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await userStatsService.recalculateAllUserStats();
      setResult(data);
      alert(`Stats recalculated! Processed: ${data.processed}, Failed: ${data.failed}`);
    } catch (error: any) {
      console.error('Error recalculating stats:', error);
      alert('Failed to recalculate stats: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <h3 className="text-white font-bold mb-2">Stats Recalculation</h3>
      <p className="text-gray-400 text-sm mb-4">
        Manually recalculate statistics for all users based on tournament results.
      </p>
      
      <button
        onClick={handleRecalculate}
        disabled={loading}
        className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Recalculating...' : 'Recalculate All User Stats'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-600/20 border border-green-600/40 rounded-lg">
          <p className="text-green-400 text-sm">
            ✓ Completed: {result.processed}/{result.total} users
            {result.failed > 0 && ` (${result.failed} failed)`}
          </p>
        </div>
      )}
    </div>
  );
}