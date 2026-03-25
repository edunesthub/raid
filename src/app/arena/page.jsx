"use client";

import React, { useState, useEffect } from "react";
import { Swords, Search, Plus, Trophy, Flame, Zap } from "lucide-react";
import { arenaService } from "@/services/arenaService";
import ChallengeCard from "@/components/Arena/ChallengeCard";
import ChallengeCreationWalkthrough from "@/components/Arena/ChallengeCreationWalkthrough";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/app/contexts/AuthContext";
import toast from "react-hot-toast";

export default function ArenaPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [gameFilter, setGameFilter] = useState("all");

  useEffect(() => {
    fetchChallenges();
  }, [gameFilter]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await arenaService.getPublicChallenges(gameFilter);
      setChallenges(data);
    } catch (error) {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!searchCode) return;
    try {
      const challenge = await arenaService.joinChallenge(user.id, searchCode, true);
      window.location.href = `/arena/${challenge.id}`;
    } catch (error) {
      toast.error(error.message || "Invalid challenge code");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Header */}
      <section className="relative h-72 w-full flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
            Raid <span className="text-orange-500">Arena</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm md:text-base border-l-2 border-orange-500 pl-4">
            Casual matches, high stakes. Create your room or join a global challenge.
          </p>
        </div>
      </section>

      <div className="container-mobile -mt-10 relative z-20">
        {/* Quick Actions / Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#0f0f10] border border-orange-500/20 rounded-3xl p-6 flex items-center justify-between shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Start Fresh</h3>
                <p className="text-xs text-gray-500">Create your own battle arena</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
            >
              Setup Room
            </button>
          </div>

          <form onSubmit={handleJoinByCode} className="bg-[#0f0f10] border border-white/5 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Enter Code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold font-mono tracking-widest focus:border-orange-500/50 outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <button type="submit" className="bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl transition-all">
              Join
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
          {['all', 'CODM', 'Free Fire', 'PUBG', 'FIFA'].map((f) => (
            <button
              key={f}
              onClick={() => setGameFilter(f)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                gameFilter === f 
                  ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-[#0f0f10] border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Challenge List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Flame className="text-orange-500" fill="currentColor" size={20} />
              Open Challenges
            </h2>
            <button onClick={fetchChallenges} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1">
              <Zap size={12} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-[#0f0f10] border border-white/5 rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <Swords size={32} />
              </div>
              <h3 className="text-white font-bold mb-1">No challenges found</h3>
              <p className="text-gray-500 text-sm mb-6">Be the first to create one today!</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                Create Challenge
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal Overlay */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowCreate(false)}></div>
          <div className="relative z-10 w-full max-w-xl">
            <ChallengeCreationWalkthrough onSuccess={() => setTimeout(() => setShowCreate(false), 3000)} />
            <button 
              onClick={() => setShowCreate(false)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 uppercase font-black text-[10px] tracking-widest"
            >
              Close <Plus className="rotate-45" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
