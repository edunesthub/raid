"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Search, Trophy, Shield, Zap, SearchX } from "lucide-react";
import { userService } from "@/services/userService";
import { friendService } from "@/services/friendService";
import { useAuth } from "@/app/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await userService.searchUsersByName("");
      setPlayers(data.filter(p => p.id !== user?.uid)); // Exclude self
    } catch (error) {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      fetchPlayers();
      return;
    }
    setLoading(true);
    try {
      const results = await userService.searchUsersByName(e.target.value);
      setPlayers(results.filter(p => p.id !== user?.uid));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetId) => {
    try {
      await friendService.sendFriendRequest(user.uid, targetId);
      toast.success("Friend request sent!");
      setPendingRequests(prev => [...prev, targetId]);
    } catch (error) {
      toast.error(error.message || "Failed to send request");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <section className="container-mobile pt-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Find <span className="text-orange-500">Rivals</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm md:text-base border-r-2 border-orange-500 pr-4">
            Connect with friends, build your squad, and prepare for glory.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Search players by username, email, or name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-[#0f0f10] border border-orange-500/20 rounded-2xl py-6 pl-16 pr-8 text-sm font-bold focus:border-orange-500/50 outline-none transition-all placeholder:text-gray-600 shadow-2xl"
          />
        </div>

        {/* Player Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 px-2">
            <h2 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Zap className="text-orange-500" fill="currentColor" size={18} />
              Global Warriors
            </h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Showing {players.length} Players
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map(player => (
                <div key={player.id} className="group relative bg-[#0f0f10] hover:bg-[#151516] border border-white/5 hover:border-orange-500/30 rounded-3xl p-6 transition-all duration-300 flex items-center gap-4 overflow-hidden">
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-orange-500/5 via-transparent to-white/5 opacity-50"></div>
                  
                  <div className="relative">
                    <img 
                      src={player.avatarUrl || '/assets/avatar-placeholder.png'} 
                      alt={player.username}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/20 group-hover:border-orange-500/50 transition-all duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-black rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors">
                        {player.username}
                      </h3>
                      {player.isVerified && <Shield size={14} className="text-blue-500 fill-blue-500/20" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <Trophy size={10} className="text-orange-500" />
                        LVL {player.level || 1}
                      </div>
                      <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {player.rank || 'Bronze'}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => sendRequest(player.id)}
                    disabled={pendingRequests.includes(player.id)}
                    className={`h-12 w-12 rounded-2xl border transition-all flex items-center justify-center relative z-10 ${
                      pendingRequests.includes(player.id)
                        ? 'bg-white/5 border-white/5 text-gray-600'
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20 active:scale-90'
                    }`}
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-[#0f0f10] border border-white/5 rounded-3xl">
              <SearchX size={64} className="mx-auto text-gray-800 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2 italic uppercase">No Warriors Found</h3>
              <p className="text-gray-500 text-sm mb-0">Try a different search term or explore your friends list.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
