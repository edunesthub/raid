"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Medal, 
  Swords, 
  Activity, 
  History 
} from "lucide-react";
import { userStatsService } from "@/services/userStatsService";
import { useAuth } from "@/app/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function StatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await userStatsService.getUserStats(user.uid);
      setStats(data);
      // Mock history for now
      setHistory([
        { id: 1, type: 'Arena', game: 'CODM', result: 'win', xp: '+50', date: '2h ago' },
        { id: 2, type: 'Tournament', game: 'Free Fire', result: '3rd', xp: '+20', date: '1d ago' },
        { id: 3, type: 'Arena', game: 'PUBG', result: 'loss', xp: '+10', date: '2d ago' },
      ]);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const calculateXPProgress = () => {
    if (!stats) return 0;
    const progress = (stats.xp % 100); // 100 XP per level for simplicity
    return progress;
  };

  if (loading) return <div className="min-h-screen bg-black flex center justify-center items-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header Profile Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-b from-[#0f0f10] to-black border-b border-orange-500/10">
        <div className="container-mobile flex flex-col md:flex-row items-center gap-8 px-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-orange-500/20 blur-[20px] rounded-full group-hover:bg-orange-500/30 transition-all duration-500"></div>
            <img 
              src={user?.photoURL || '/assets/avatar-placeholder.png'} 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-orange-500/30 object-cover"
              alt="Profile"
            />
            <div className="absolute -bottom-4 right-0 left-0 flex justify-center">
              <span className="px-4 py-1.5 bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-lg shadow-orange-500/40">
                LVL {stats?.level || 1}
              </span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
              {user?.displayName || 'Pro Gamer'}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <Medal size={14} className="text-orange-500" />
                {stats?.rank || 'Bronze'} Division
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <Activity size={14} className="text-orange-500" />
                {stats?.winRate || 0}% Win Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-mobile mt-10 space-y-10 px-6">
        {/* Level Progress */}
        <div className="bg-[#0f0f10] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Progress Wave */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute bottom-0 left-0 w-full bg-orange-500/10 h-1/2 blur-[80px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="text-orange-500" size={24} fill="currentColor" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Season <span className="text-orange-500">Progress</span></h2>
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                {stats?.xp || 0} / {(stats?.level || 1) * 100} XP
              </span>
            </div>

            <div className="w-full bg-white/5 border border-white/5 h-4 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                style={{ width: `${calculateXPProgress()}%` }}
              />
            </div>
            
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
              Reach {((stats?.level || 1) * 100) - (stats?.xp || 0)} more XP to reach level {(stats?.level || 1) + 1}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Played', value: stats?.tournamentsPlayed || 0, icon: <Swords size={18} />, color: 'text-orange-500' },
            { label: 'Wins', value: stats?.tournamentsWon || 0, icon: <Trophy size={18} />, color: 'text-green-500' },
            { label: 'Earnings', value: `${stats?.totalEarnings || 0}`, icon: <Target size={18} />, color: 'text-blue-500' },
            { label: 'Rank', value: stats?.rank || 'N/A', icon: <Medal size={18} />, color: 'text-yellow-500' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0f0f10] border border-white/5 rounded-2xl p-6 text-center hover:border-orange-500/30 transition-all group">
               <div className={`w-10 h-10 ${item.color} bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                 {item.icon}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">{item.label}</span>
               <span className="text-xl font-black text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Match History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <History className="text-orange-500" size={20} />
              Battle Log
            </h2>
            <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1">
              <RotateCcw size={12} /> Full History
            </button>
          </div>

          <div className="space-y-3">
            {history.map(match => (
              <div key={match.id} className="bg-[#0f0f10] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                    match.result === 'win' ? 'bg-green-500/20 text-green-500' : 
                    match.result === 'loss' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {match.result.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{match.game} <span className="text-gray-600 text-[10px] uppercase font-black ml-1">[{match.type}]</span></h4>
                    <p className="text-[10px] text-gray-500 font-black uppercase italic">{match.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-orange-500 block">{match.xp} XP</span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Gained</span>
                  </div>
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all">
                    {match.result === 'win' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
