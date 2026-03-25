"use client";

import Link from "next/link";
import { Users, Trophy, Zap, Clock, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export default function TournamentCard({ tournament }) {
  const isLive =
    tournament.status === "live" || tournament.status === "ongoing";
  const isFull =
    (tournament.participants?.length || 0) >= (tournament.maxParticipants || 0);

  return (
    <Link
      href={`/tournament/${tournament.id}`}
      className="group relative block rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-orange-500/30 hover:shadow-[0_40px_80px_-20px_rgba(249,115,22,0.2)]"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />

      {/* Hero Image / Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={tournament.bannerUrl || tournament.image || "/assets/tournament-thumb.png"}
          alt={tournament.name || tournament.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
        
        {/* Animated Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-3">
          {isLive && (
            <div className="px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-red-600/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Broadcast Live
            </div>
          )}
          <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
            {tournament.game || "Elite Arena"}
          </div>
        </div>

        {/* Prize Pool Display */}
        <div className="absolute bottom-6 left-6">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">
            Championship Prize
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black italic text-white leading-none tracking-tighter">
              {formatCurrency(tournament.prizePool || tournament.first_place_value || 0, tournament.currency).split('.')[0]}
            </span>
            <span className="text-sm font-black text-white/40 uppercase">USD</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-8 space-y-6">
        <div className="relative">
          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter line-clamp-1 group-hover:text-orange-500 transition-colors mb-2">
            {tournament.name || tournament.title}
          </h3>
          <div className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-widest text-[10px]">
            <div className="w-4 h-[2px] bg-orange-500/50" />
            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Commencing Soon"}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-orange-500">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Slots</span>
            </div>
            <p className="text-lg font-black text-white italic tracking-tighter">
              {tournament.participants?.length || 0} <span className="text-white/20">/</span> {tournament.maxParticipants || 100}
            </p>
          </div>
          
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-orange-500">
              <Zap size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Format</span>
            </div>
            <p className="text-lg font-black text-white italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              {tournament.format || "Knockout"}
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-2">
          <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-300 ${
            isFull 
              ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
              : "bg-orange-600 text-white shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] group-hover:bg-orange-500 group-hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.5)] group-hover:scale-[1.02]"
          }`}>
            {isFull ? "Roster Full" : (
              <>
                Enter the Arena
                <Zap size={14} />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
