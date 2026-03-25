"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userStatsService } from '@/services/userStatsService';
import { MatchHistoryEntry } from '@/types/stats';

export default function MatchHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userStatsService.getMatchHistory(user!.id);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-12 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Back to Profile
        </button>

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">MATCH HISTORY</h1>
            <p className="text-gray-400 font-medium">Your recent performance in the arena</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center">
            <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Total XP</div>
            <div className="text-2xl font-black flex items-center gap-2">
               <Sparkles size={20} className="text-primary" />
               {history.reduce((acc, curr) => acc + (curr.xpGained || 0), 0)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-[#16161a] rounded-2xl animate-pulse" />
            ))
          ) : history.length > 0 ? (
            history.map((match, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={match.id}
                className="group bg-[#16161a] border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                    match.placement === 1 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {match.placement === 1 ? '1st' : (match.placement === 2 ? '2nd' : (match.placement === 3 ? '3rd' : `#${match.placement || '?'}`))}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{match.tournamentName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 rounded-md uppercase tracking-wider">{match.game}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Gain</div>
                    <div className="flex items-center gap-1 text-primary font-black">
                      <TrendingUp size={14} />
                      +{match.xpGained} XP
                    </div>
                  </div>
                  {match.prize > 0 && (
                     <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Earned</div>
                        <div className="text-green-500 font-black">
                         ₵{match.prize}
                        </div>
                     </div>
                  )}
                  <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-white/5">
                <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Matches Recorded</h3>
                <p className="text-gray-500 font-medium">Your arena journey starts here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
