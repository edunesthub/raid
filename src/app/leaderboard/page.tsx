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
    <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16 flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 lg:px-12">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
            Hall of <span className="text-orange-500">Fame</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest">
            The elite warriors of RAID Arena
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-1.5 rounded-2xl mb-10 md:mb-12 flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar snap-x max-w-3xl mx-auto">
          {(["xp", "tournamentsWon", "winRate"] as LeaderboardMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`flex-1 flex-shrink-0 snap-center flex items-center justify-center min-w-[130px] gap-2 py-3 px-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 ${
                metric === m
                  ? "bg-orange-500 text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)]"
                  : "bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {getMetricIcon(m)}
              {m === "tournamentsWon" ? "Wins" : (m === "winRate" ? "Win Rate" : "XP Rank")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 grayscale opacity-50">
            <LoadingSpinner size="lg" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-orange-500">Synchronizing Rankings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center shadow-2xl max-w-2xl mx-auto">
            <p className="text-red-400 font-bold mb-6 uppercase tracking-wider text-sm">⚠️ {error}</p>
            <button onClick={loadLeaderboard} className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 hover:border-white/20">
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {leaderboard.map((player, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={player.userId || player.id}
                  className={`relative group flex items-center justify-between p-4 md:p-5 rounded-3xl border transition-all duration-300 ${
                    isTop3 
                      ? "border-orange-500/30 bg-orange-500/[0.03] hover:bg-orange-500/[0.06] hover:-translate-y-1 shadow-[0_10px_30px_-15px_rgba(249,115,22,0.15)] z-10" 
                      : "bg-white/[0.02] border-white/5 hover:border-orange-500/30 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(249,115,22,0.1)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-sm border ${
                      index === 0 ? "bg-orange-500/10 text-orange-500 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : 
                      index === 1 ? "bg-gray-300/10 text-gray-300 border-gray-300/40 shadow-[0_0_20px_rgba(209,213,219,0.15)]" :
                      index === 2 ? "bg-[#b08d57]/10 text-[#b08d57] border-[#b08d57]/40 shadow-[0_0_20px_rgba(176,141,87,0.15)]" : 
                      "bg-white/5 text-gray-500 border-white/5"
                    }`}>
                      {index + 1}
                    </div>
                    
                    <UserAvatar
                      user={player}
                      size="md"
                    />
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm md:text-base group-hover:text-orange-500 transition-colors uppercase tracking-tight truncate max-w-[120px] sm:max-w-[150px]">
                          {player.username || "Warrior"}
                        </span>
                        {index === 0 && <Award size={14} className="text-orange-500 flex-shrink-0" />}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                        Level {player.level || 1} <span className="mx-0.5">•</span> {player.tournamentsPlayed || 0} Tourneys
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-lg md:text-xl font-black text-white group-hover:scale-110 transition-transform origin-right flex flex-col items-end">
                      {formatMetricValue(player)}
                    </div>
                    {metric === "xp" && player.winRate > 0 && (
                      <div className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 rounded border border-white/5 mt-1 inline-block">
                        {Math.round(player.winRate)}% Win
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="col-span-full text-center py-32 opacity-30 border border-white/5 border-dashed rounded-[3rem] bg-white/[0.01]">
                <Trophy size={64} className="mx-auto mb-6 text-gray-500" />
                <p className="font-black uppercase tracking-[0.2em] text-sm text-gray-400">The arena is currently empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}