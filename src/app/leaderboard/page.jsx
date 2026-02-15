// src/app/leaderboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userService } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserAvatar from "@/components/UserAvatar";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("tournamentsWon");

  useEffect(() => {
    loadLeaderboard();
  }, [metric]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getLeaderboard(metric, 50);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricValue = (player) => {
    switch (metric) {
      case "tournamentsWon":
        return player.tournamentsWon || 0;
      case "winRate":
        return `${player.winRate?.toFixed(1) || 0}%`;
      default:
        return "-";
    }
  };

  return (
    <div className="container-mobile min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-400">Top players on RAID Arena</p>
        </div>

        {/* Filter Tabs */}
        <div className="card-raid p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMetric("tournamentsWon")}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${metric === "tournamentsWon"
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
            >
              🏅 Wins
            </button>
            <button
              onClick={() => setMetric("winRate")}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${metric === "winRate"
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
            >
              📊 Win Rate
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <button onClick={loadLeaderboard} className="btn-raid">
              Try Again
            </button>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="card-raid p-4 text-center flex flex-col items-center justify-end">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="relative mb-3">
                    <UserAvatar
                      user={leaderboard[1]}
                      size="lg"
                      className="border-2 border-gray-400"
                    />
                  </div>
                  <p className="font-bold text-white text-sm truncate w-full">
                    {leaderboard[1].username}
                  </p>
                  <p className="text-orange-400 font-bold">
                    {formatMetricValue(leaderboard[1])}
                  </p>
                </div>

                {/* 1st Place */}
                <div className="card-raid p-4 text-center flex flex-col items-center justify-end bg-gradient-to-b from-orange-900/20 to-transparent">
                  <div className="text-5xl mb-2">🥇</div>
                  <div className="relative mb-3">
                    <UserAvatar
                      user={leaderboard[0]}
                      size="xl"
                      className="border-4 border-orange-500"
                    />
                  </div>
                  <p className="font-bold text-white truncate w-full">
                    {leaderboard[0].username}
                  </p>
                  <p className="text-orange-400 font-bold text-lg">
                    {formatMetricValue(leaderboard[0])}
                  </p>
                </div>

                {/* 3rd Place */}
                <div className="card-raid p-4 text-center flex flex-col items-center justify-end">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="relative mb-3">
                    <UserAvatar
                      user={leaderboard[2]}
                      size="lg"
                      className="border-2 border-orange-700"
                    />
                  </div>
                  <p className="font-bold text-white text-sm truncate w-full">
                    {leaderboard[2].username}
                  </p>
                  <p className="text-orange-400 font-bold">
                    {formatMetricValue(leaderboard[2])}
                  </p>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-2">
              {leaderboard.slice(3).map((player, index) => (
                <div
                  key={player.userId}
                  className="card-raid p-4 flex items-center justify-between hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 font-bold w-8 text-center">
                      #{index + 4}
                    </span>
                    <UserAvatar
                      user={player}
                      size="md"
                      className="border-2 border-gray-700"
                    />
                    <div>
                      <p className="font-semibold text-white">{player.username}</p>
                      <p className="text-gray-400 text-sm">
                        {player.tournamentsPlayed || 0} tournaments
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-400">
                      {formatMetricValue(player)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {leaderboard.length === 0 && (
              <div className="card-raid p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Players Yet
                </h3>
                <p className="text-gray-400">
                  Be the first to compete and make it to the leaderboard!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}