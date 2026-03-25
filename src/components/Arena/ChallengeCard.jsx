"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Swords, Trophy, Lock, Globe } from "lucide-react";

const ChallengeCard = ({ challenge }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const getGameIcon = (game) => {
    switch (game?.toLowerCase()) {
      case 'codm': return '🔫';
      case 'free fire': return '🔥';
      case 'pubg': return '🍳';
      default: return '🎮';
    }
  };

  return (
    <div className="relative group bg-[#0f0f10]/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_-10px_rgba(255,120,0,0.5)]">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-orange-500/10 via-transparent to-white/5 opacity-50"></div>
      
      <div className="p-5 flex flex-col gap-4">
        {/* Header: Game + Visibility */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center text-2xl">
              {getGameIcon(challenge.game)}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight group-hover:text-orange-400 transition-colors">
                {challenge.name}
              </h3>
              <p className="text-orange-500/80 text-xs font-black uppercase tracking-widest">
                {challenge.game}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 border ${
            challenge.visibility === 'Private' 
              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
              : 'bg-green-500/10 border-green-500/20 text-green-500'
          }`}>
            {challenge.visibility === 'Private' ? <Lock size={10} /> : <Globe size={10} />}
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {challenge.visibility}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Rounds</span>
            <span className="text-white font-black text-sm">{challenge.rounds}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Players</span>
            <span className="text-white font-black text-sm">
              {challenge.currentParticipants}/{challenge.maxParticipants}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              style={{ width: `${(challenge.currentParticipants / challenge.maxParticipants) * 100}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/arena/${challenge.id}`}
          onClick={() => setIsNavigating(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
        >
          <Swords size={14} />
          {isNavigating ? 'Entering...' : 'Join Challenge'}
        </Link>
      </div>
    </div>
  );
};

export default ChallengeCard;
