// src/app/admin/stats/page.jsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext.jsx';
import { userStatsService } from '@/services/userStatsService';
import { RefreshCw, Users, Trophy, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminStatsUtilityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const handleRecalculateAll = async () => {
    if (!confirm('Recalculate stats for ALL users? This may take several minutes.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await userStatsService.recalculateAllUserStats();
      setResult(res);
      alert(`✓ Stats recalculated!\nProcessed: ${res.processed}\nFailed: ${res.failed}`);
    } catch (error) {
      console.error('Error recalculating stats:', error);
      alert('Failed to recalculate stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateSingle = async () => {
    if (!selectedUserId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    setLoadingUser(true);
    setUserStats(null);

    try {
      const stats = await userStatsService.recalculateUserStats(selectedUserId.trim());
      setUserStats(stats);
      alert(`✓ Stats recalculated for user ${selectedUserId}`);
    } catch (error) {
      console.error('Error recalculating user stats:', error);
      alert('Failed to recalculate user stats: ' + error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Stats Utility</h1>
        <p className="text-gray-400">Recalculate user statistics from tournament results</p>
      </div>

      {/* Recalculate All Users */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Recalculate All User Stats</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will recalculate statistics for ALL users based on their tournament participation and results. 
              This process analyzes all completed tournaments and updates:
            </p>
            <ul className="text-gray-400 text-sm space-y-1 mb-4">
              <li>• Tournaments played and won</li>
              <li>• Total earnings from prizes</li>
              <li>• Win rate percentage</li>
              <li>• Best placement achieved</li>
              <li>• Placement breakdown (1st, 2nd, 3rd)</li>
            </ul>
            <p className="text-yellow-400 text-sm mb-4">
              ⚠️ Warning: This operation may take several minutes for large user bases.
            </p>
          </div>
        </div>

        <button
          onClick={handleRecalculateAll}
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Recalculating...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Recalculate All Users
            </>
          )}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-600/20 border border-green-600/40 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-green-400 font-bold">Recalculation Complete</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Users</p>
                <p className="text-white font-bold text-lg">{result.total}</p>
              </div>
              <div>
                <p className="text-gray-400">Processed</p>
                <p className="text-green-400 font-bold text-lg">{result.processed}</p>
              </div>
              <div>
                <p className="text-gray-400">Failed</p>
                <p className={`font-bold text-lg ${result.failed > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {result.failed}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recalculate Single User */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Recalculate Single User</h2>
            <p className="text-gray-400 text-sm mb-4">
              Recalculate statistics for a specific user by their user ID.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              User ID
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Enter user ID (e.g., abc123xyz)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleRecalculateSingle}
            disabled={loadingUser || !selectedUserId.trim()}
            className={`w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
              (loadingUser || !selectedUserId.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loadingUser ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Recalculate User Stats
              </>
            )}
          </button>

          {userStats && (
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Updated Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Tournaments Played</p>
                  <p className="text-white font-bold text-xl">{userStats.tournamentsPlayed}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Tournaments Won</p>
                  <p className="text-green-400 font-bold text-xl">{userStats.tournamentsWon}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Total Earnings</p>
                  <p className="text-green-400 font-bold text-xl">{user?.country === 'Nigeria' ? '₦' : '₵'}{userStats.totalEarnings}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Win Rate</p>
                  <p className="text-blue-400 font-bold text-xl">{userStats.winRate?.toFixed(1) || 0}%</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-2">Placements</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">🥇</span>
                    <span className="text-white font-semibold">{userStats.placements?.first || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🥈</span>
                    <span className="text-white font-semibold">{userStats.placements?.second || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">🥉</span>
                    <span className="text-white font-semibold">{userStats.placements?.third || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          How Stats Are Calculated
        </h3>
        <ul className="text-gray-300 text-sm space-y-2">
          <li>• <strong>Tournaments Played:</strong> Count of all completed tournaments the user participated in</li>
          <li>• <strong>Tournaments Won:</strong> Count of tournaments where user placed 1st</li>
          <li>• <strong>Total Earnings:</strong> Sum of all prize money from placements (1st, 2nd, 3rd)</li>
          <li>• <strong>Win Rate:</strong> (Tournaments Won / Tournaments Played) × 100</li>
          <li>• <strong>Best Placement:</strong> Highest placement achieved (1st is best)</li>
        </ul>
      </div>
    </div>
  );
}