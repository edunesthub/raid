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
      {/* Dynamic Grid Background Overlay (Grid-Lock style) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(249,115,22,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-orange-500/10 via-transparent to-white/5 opacity-50"></div>

      {/* Live Pulse Indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 z-20">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
        <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Live</span>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        {/* Header: Game + Visibility */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg border border-orange-500/20 flex items-center justify-center text-xl">
              {getGameIcon(challenge.game)}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight group-hover:text-orange-400 transition-colors">
                {challenge.name}
              </h3>
              <p className="text-orange-500/80 text-[9px] font-black uppercase tracking-widest">
                {challenge.game}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
              challenge.visibility === 'Private' 
                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                : 'bg-green-500/10 border-green-500/20 text-green-500'
            }`}>
              {challenge.visibility === 'Private' ? <Lock size={8} /> : <Globe size={8} />}
              <span className="text-[8px] font-bold uppercase tracking-tighter">
                {challenge.visibility}
              </span>
            </div>
            
            {/* Avatar Stack Mockup */}
            <div className="flex -space-x-2">
              {[1, 2].map((i) => (
                <div key={i} className={`w-5 h-5 rounded-full border border-black bg-gray-900 overflow-hidden flex items-center justify-center ${i > challenge.currentParticipants ? 'opacity-20' : ''}`}>
                  {i <= challenge.currentParticipants ? (
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${challenge.id}${i}`} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={8} className="text-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="text-[8px] text-gray-500 font-bold uppercase">Rounds</span>
            <span className="text-white font-black text-xs">{challenge.rounds}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="text-[8px] text-gray-500 font-bold uppercase">Players</span>
            <span className="text-white font-black text-xs">
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
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
        >
          <Swords size={12} />
          {isNavigating ? 'Entering...' : 'Join Room'}
        </Link>
      </div>
    </div>
  );
};

export default ChallengeCard;
