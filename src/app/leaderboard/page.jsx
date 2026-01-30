// src/app/leaderboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userService } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("totalEarnings");

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
    const userCountry = user?.country || 'Ghana';
    switch (metric) {
      case "totalEarnings":
        const symbol = userCountry === 'Nigeria' ? '₦' : '₵';
        return `${symbol}${player.totalEarnings?.toLocaleString() || 0}`;
      case "tournamentsWon":
        return player.tournamentsWon || 0;
      case "winRate":
        return `${player.winRate?.toFixed(1) || 0}%`;
      default:
        return "-";
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto relative">
      <div className="scanline"></div>
      <div className="container-mobile py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-1 bg-pink-500 shadow-[0_0_15px_#ff00ff]"></div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Elite <span className="text-pink-500">Operatives</span></h1>
            </div>
            <p className="text-pink-300/60 font-bold uppercase tracking-[0.2em] text-xs">
              [SYS]: Fetching top-tier combat data from the global network...
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="group relative mb-12">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-none blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative grid grid-cols-3 gap-2 bg-black border border-blue-500/20 p-2" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
              <button
                onClick={() => setMetric("totalEarnings")}
                className={`py-3 px-4 font-black uppercase italic tracking-tighter transition-all text-xs ${metric === "totalEarnings"
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                  : "text-gray-500 hover:text-blue-400"
                  }`}
                style={metric === "totalEarnings" ? { clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' } : {}}
              >
                Credits_Earned
              </button>
              <button
                onClick={() => setMetric("tournamentsWon")}
                className={`py-3 px-4 font-black uppercase italic tracking-tighter transition-all text-xs ${metric === "tournamentsWon"
                  ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                  : "text-gray-500 hover:text-pink-400"
                  }`}
                style={metric === "tournamentsWon" ? { clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' } : {}}
              >
                Nodes_Conquered
              </button>
              <button
                onClick={() => setMetric("winRate")}
                className={`py-3 px-4 font-black uppercase italic tracking-tighter transition-all text-xs ${metric === "winRate"
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(157,0,255,0.4)]"
                  : "text-gray-500 hover:text-purple-400"
                  }`}
                style={metric === "winRate" ? { clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' } : {}}
              >
                Efficiency_Ratio
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <LoadingSpinner />
              <span className="text-blue-500 text-[10px] font-black animate-pulse tracking-[0.5em]">DECRYPTING_RANKS...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-pink-600/10 border border-pink-600/30 p-12 text-center" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}>
              <p className="text-pink-500 font-black uppercase tracking-[0.3em] mb-4">⚠️ RANK_DATA_FAILURE</p>
              <p className="text-gray-500 text-xs mb-8">{error}</p>
              <button onClick={loadLeaderboard} className="btn-raid px-10">
                Resync_Uplink
              </button>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && !error && (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-12">
                  {/* 2nd Place */}
                  <div className="relative group pt-4">
                    <div className="absolute -inset-0.5 bg-gray-500/20 blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-black border border-gray-500/30 p-5 text-center flex flex-col items-center justify-end" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}>
                      <div className="text-2xl mb-4 grayscale opacity-50 group-hover:grayscale-0 transition-all">🥈</div>
                      <div className="relative w-16 h-16 mb-4" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                        <div className="absolute inset-0 bg-gray-500/10"></div>
                        {leaderboard[1].avatarUrl ? (
                          <Image src={leaderboard[1].avatarUrl} alt={leaderboard[1].username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center font-black text-xl text-gray-500">
                            {leaderboard[1].username?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <p className="font-black text-white text-xs uppercase italic truncate w-full mb-1">
                        {leaderboard[1].username}
                      </p>
                      <p className="text-gray-400 font-black text-sm tracking-tighter italic">
                        {formatMetricValue(leaderboard[1])}
                      </p>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-blue-500/20 blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative bg-black border-2 border-blue-500/50 p-6 text-center flex flex-col items-center justify-end shadow-[0_0_30px_rgba(0,243,255,0.1)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}>
                      <div className="text-3xl mb-4 animate-bounce">🥇</div>
                      <div className="relative w-20 h-20 mb-4" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                        <div className="absolute inset-0 bg-blue-500/20 shadow-[0_0_15px_#00f3ff]"></div>
                        {leaderboard[0].avatarUrl ? (
                          <Image src={leaderboard[0].avatarUrl} alt={leaderboard[0].username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-900/40 flex items-center justify-center font-black text-2xl text-blue-400">
                            {leaderboard[0].username?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <p className="font-black text-white text-base uppercase italic truncate w-full mb-1">
                        {leaderboard[0].username}
                      </p>
                      <p className="text-blue-500 font-black text-xl tracking-tighter italic shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                        {formatMetricValue(leaderboard[0])}
                      </p>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="relative group pt-6">
                    <div className="absolute -inset-0.5 bg-pink-500/20 blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-black border border-pink-500/30 p-5 text-center flex flex-col items-center justify-end" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}>
                      <div className="text-2xl mb-4 grayscale opacity-50 group-hover:grayscale-0 transition-all">🥉</div>
                      <div className="relative w-16 h-16 mb-4" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                        <div className="absolute inset-0 bg-pink-500/10"></div>
                        {leaderboard[2].avatarUrl ? (
                          <Image src={leaderboard[2].avatarUrl} alt={leaderboard[2].username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-pink-900/20 flex items-center justify-center font-black text-xl text-pink-500">
                            {leaderboard[2].username?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                      <p className="font-black text-white text-xs uppercase italic truncate w-full mb-1">
                        {leaderboard[2].username}
                      </p>
                      <p className="text-pink-500 font-black text-sm tracking-tighter italic">
                        {formatMetricValue(leaderboard[2])}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of Leaderboard */}
              <div className="space-y-4">
                {leaderboard.slice(3).map((player, index) => (
                  <div
                    key={player.userId}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-black/40 border border-blue-500/10 p-4 flex items-center justify-between transition-all group-hover:border-blue-500/30" style={{ clipPath: 'polygon(1% 0, 100% 0, 100% 70%, 99% 100%, 0 100%, 0 30%)' }}>
                      <div className="flex items-center space-x-6">
                        <span className="text-gray-600 font-black w-8 text-center text-xs tracking-tighter">
                          #{index + 4}
                        </span>
                        <div className="relative w-12 h-12 overflow-hidden border border-blue-500/20" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                          {player.avatarUrl ? (
                            <Image src={player.avatarUrl} alt={player.username} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center font-black text-blue-500/50">
                              {player.username?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{player.username}</p>
                          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            // {player.tournamentsPlayed || 0} TRIALS_COMPLETED
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-500 text-lg tracking-tighter italic group-hover:shadow-[0_0_10px_#00f3ff] transition-all">
                          {formatMetricValue(player)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {leaderboard.length === 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-white/5 p-20 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
                  <div className="text-6xl mb-8 grayscale opacity-20 animate-pulse">🏆</div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
                    ZERO_MATCHES_DETECTED
                  </h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wide max-w-sm mx-auto">
                    The elite ranks are currently void. Engage in combat to establish dominance in the network.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}