"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trophy, Users, Tv, MessageSquare, ArrowRight, Shield, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChallenge } from '@/hooks/useChallenge';
import { challengeService } from '@/services/challengeService';
import { Challenge } from '@/types/challenge';
import Link from 'next/link';

export default function ChallengesPage() {
  const { user } = useAuth();
  const { findChallengeByCode, loading: searchLoading, error: searchError } = useChallenge();
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [filter, setFilter] = useState('all');

  const loadPublicChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await challengeService.getPublicChallenges(filter === 'all' ? undefined : filter);
      setPublicChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPublicChallenges();
  }, [loadPublicChallenges]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    try {
      const challenge = await findChallengeByCode(joinCode);
      if (challenge) {
        // Redirect to challenge lobby
        window.location.href = `/challenges/${challenge.code}`;
      } else {
        alert('Challenge not found. Please check the code.');
      }
    } catch (err) {
      alert('Error searching for challenge');
    }
  };

  const games = ['all', 'CODM', 'Free Fire', 'PUBG', 'eFootball'];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-24">
      {/* Header */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-[#0a0a0c] z-0" />
        <div className="absolute inset-0 backdrop-blur-3xl z-0" />
        
        <div className="relative z-10 container mx-auto px-6 pt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Open Challenges
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-lg"
          >
            Create or join quick matches. Prove your skills in the arena and climb the ranks.
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/challenges/create" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105">
              <Plus size={20} />
              Create Challenge
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-12 relative z-20">
        {/* Search & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Join by Code Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#16161a] border border-white/5 p-6 rounded-2xl shadow-2xl lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold">Join by Code</h2>
            </div>
            
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code (e.g. RX72B8)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary/50 transition-all outline-none text-lg tracking-widest font-mono"
                />
              </div>
              <button 
                type="submit"
                disabled={searchLoading}
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {searchLoading ? '...' : 'Search'}
              </button>
            </form>
            {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-primary" size={24} />
              <h2 className="text-xl font-bold">Arena Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Live Matches</span>
                <span className="text-white font-bold">{publicChallenges.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Players</span>
                <span className="text-white font-bold">1.2k+</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Globe size={18} className="text-gray-500 shrink-0" />
          {games.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all border ${
                filter === g 
                ? 'bg-primary text-black border-primary font-bold' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
              }`}
            >
              {g === 'all' ? 'All Games' : g}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-[#16161a] h-64 rounded-2xl animate-pulse" />
              ))
            ) : publicChallenges.length > 0 ? (
              publicChallenges.map((challenge) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={challenge.id}
                  className="bg-[#16161a] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg text-xs font-bold text-primary border border-primary/20">
                        {challenge.game}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={14} />
                        {challenge.participants.length}/10
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {challenge.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <div className="flex items-center gap-1">
                        <Tv size={14} />
                        {challenge.rounds} Rounds
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        Chat Enabled
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-gray-500">Created by {challenge.creatorUsername}</span>
                      <Link 
                        href={`/challenges/${challenge.code}`}
                        className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
                      >
                        Join Room
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={40} className="text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">No active challenges found</h3>
                <p className="text-gray-600">Be the first to create one!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
