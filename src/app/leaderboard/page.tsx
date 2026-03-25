"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userStatsService } from "@/services/userStatsService";
import { userService } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserAvatar from "@/components/UserAvatar";
import { UserStats } from "@/types/stats";
import { Trophy, Award, TrendingUp, Sparkles } from "lucide-react";

type LeaderboardMetric = "xp" | "tournamentsWon" | "winRate";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<LeaderboardMetric>("xp");

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (metric === "xp") {
        data = await userStatsService.getXPLeaderboard(50);
      } else {
        // cast metric to match expected service parameter if necessary
        data = await userService.getLeaderboard(metric as any, 50);
      }
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const formatMetricValue = (player: any) => {
    switch (metric) {
      case "xp":
        return `${player.xp || 0} XP`;
      case "tournamentsWon":
        return `${player.tournamentsWon || 0} Wins`;
      case "winRate":
        return `${player.winRate?.toFixed(1) || 0}% WR`;
      default:
        return "-";
    }
  };

  const getMetricIcon = (m: LeaderboardMetric) => {
    switch (m) {
      case "xp": return <Sparkles size={18} />;
      case "tournamentsWon": return <Trophy size={18} />;
      case "winRate": return <TrendingUp size={18} />;
    }
  };

  return (
    <div className="container-mobile min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter uppercase">Hall of Fame</h1>
          <p className="text-gray-400 font-medium tracking-wide">The elite warriors of RAID Arena</p>
        </div>

        <div className="bg-[#16161a] border border-white/5 p-1.5 rounded-2xl mb-10 flex gap-2">
          {(["xp", "tournamentsWon", "winRate"] as LeaderboardMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                metric === m
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {getMetricIcon(m)}
              {m === "tournamentsWon" ? "Wins" : (m === "winRate" ? "Win Rate" : "XP Rank")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <LoadingSpinner size="lg" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-primary">Synchronizing Rankings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center">
            <p className="text-red-400 font-bold mb-6">⚠️ {error}</p>
            <button onClick={loadLeaderboard} className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl font-bold transition-all">
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((player, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={player.userId || player.id}
                  className={`relative group flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
                    isTop3 ? "border-primary/40 bg-primary/5 scale-[1.02]" : "bg-[#16161a] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      index === 0 ? "bg-primary text-black" : 
                      index === 1 ? "bg-gray-400 text-black" :
                      index === 2 ? "bg-orange-700 text-black" : "bg-white/5 text-gray-500"
                    }`}>
                      {index + 1}
                    </div>
                    
                    <UserAvatar
                      user={player}
                      size="lg"
                    />
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                          {player.username || "Warrior"}
                        </span>
                        {index === 0 && <Award size={14} className="text-primary" />}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        Level {player.level || 1} • {player.tournamentsPlayed || 0} Tourneys
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-white group-hover:scale-110 transition-transform origin-right">
                      {formatMetricValue(player)}
                    </div>
                    {metric === "xp" && player.winRate > 0 && (
                      <div className="text-[10px] text-gray-600 font-bold uppercase">{player.winRate}% Win Rate</div>
                    )}
                  </div>
                </div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="text-center py-24 opacity-30">
                <Trophy size={64} className="mx-auto mb-6" />
                <p className="font-black uppercase tracking-[0.2em]">The arena is currently empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}