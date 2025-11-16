// src/hooks/useAutoStatsUpdate.js
"use client";

import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userStatsService } from '@/services/userStatsService';

/**
 * Hook to automatically update user stats when tournaments complete
 * Place this in your main layout or AppProviders
 */
export function useAutoStatsUpdate() {
  useEffect(() => {
    // Listen for tournament completions
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('status', '==', 'completed')
    );

    const unsubscribe = onSnapshot(tournamentsQuery, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const tournamentData = change.doc.data();
          const tournamentId = change.doc.id;

          // Check if tournament just completed (status changed to completed)
          if (tournamentData.status === 'completed' && !tournamentData.statsUpdated) {
            console.log(`[AutoStats] Tournament ${tournamentId} completed, updating stats...`);
            
            try {
              await userStatsService.updateStatsForTournamentCompletion(tournamentId);
              
              // Mark tournament as stats updated (optional)
              // await updateDoc(doc(db, 'tournaments', tournamentId), {
              //   statsUpdated: true
              // });
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

// Alternative: Manual trigger component for admin
import { useState } from 'react';

export function StatsRecalculationButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRecalculate = async () => {
    if (!confirm('Recalculate stats for ALL users? This may take a while.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await userStatsService.recalculateAllUserStats();
      setResult(result);
      alert(`Stats recalculated! Processed: ${result.processed}, Failed: ${result.failed}`);
    } catch (error) {
      console.error('Error recalculating stats:', error);
      alert('Failed to recalculate stats: ' + error.message);
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