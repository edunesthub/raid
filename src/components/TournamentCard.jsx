import React, { useState } from "react";
import Link from "next/link";
import { Loader, Shield, Users } from "lucide-react";

const TournamentCard = ({ tournament }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="relative group bg-[#0f0f10]/90 backdrop-blur-md border border-orange-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_-5px_rgba(255,120,0,0.6)]">
      {/* glowing accent edge */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-orange-500/15 via-transparent to-transparent opacity-80"></div>

      {/* IMAGE */}
      <div className="relative w-full h-40 sm:h-48 overflow-hidden border-b border-orange-500/30">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-black/70 border border-white/10 text-white shadow-md">
          {tournament.country || tournament.region || 'Ghana'}
        </span>
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full text-white shadow-md ${tournament.status === "live"
            ? "bg-green-500/90 animate-pulse"
            : tournament.status === "registration-open"
              ? "bg-blue-500/90"
              : tournament.status === "upcoming"
                ? "bg-yellow-500/90"
                : "bg-gray-500/90"
            }`}
        >
          {tournament.status === "registration-open"
            ? "🔥 OPEN"
            : tournament.status === "live"
              ? "🔴 LIVE"
              : tournament.status === "upcoming"
                ? "⏰ SOON"
                : "✅ ENDED"}
        </span>

        {tournament.participant_type === 'Team' && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-full bg-blue-600/90 text-white shadow-md flex items-center gap-1 border border-blue-400/30 animate-pulse">
            <Shield size={12} fill="currentColor" /> SQUAD
          </span>
        )}

        {tournament.participant_type === 'Duo' && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] sm:text-xs font-black rounded-full bg-green-600/90 text-white shadow-md flex items-center gap-1 border border-green-400/30 animate-pulse">
            <Users size={12} fill="currentColor" /> DUO
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + Game */}
        <div>
          <h3 className="text-lg font-bold text-white line-clamp-1 tracking-wide">
            {tournament.title}
          </h3>
          <p className="text-orange-400 text-xs uppercase tracking-wider font-semibold">
            {tournament.game}
          </p>
        </div>

        {/* Prize & Entry */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-orange-500/40 rounded-lg p-2 bg-[#1a1a1d]/90 hover:bg-[#1e1e22]/90 transition-colors">
            <p className="text-gray-400 text-xs text-center">Top Prize</p>
            <p className="text-green-400 font-bold text-center truncate">
              {tournament.first_place || '-'}
            </p>
          </div>
          <div className="border border-orange-500/40 rounded-lg p-2 bg-[#1a1a1d]/90 hover:bg-[#1e1e22]/90 transition-colors">
            <p className="text-gray-400 text-xs">Entry Fee</p>
            <p className="text-white font-semibold">
              {tournament.currency || '₵'}{tournament.entryFee.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Players Progress */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
            <span>{tournament.participant_type === 'Team' ? 'Squads' : 'Players'}</span>
            <span className="text-white">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-[#1b1b1f] border border-orange-500/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100
                  }%`,
              }}
            />
          </div>
        </div>



        {/* CTA */}
        <Link
          href={`/tournament/${tournament.id}/`}
          onClick={() => setIsNavigating(true)}
          className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-sm font-bold py-2 rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(255,120,0,0.4)] hover:shadow-[0_0_20px_rgba(255,140,0,0.6)] active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isNavigating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            'View Details'
          )}
        </Link>
        {tournament.status === "live" && tournament.twitch_link && (
          <a
            href={tournament.twitch_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#9146FF] hover:bg-[#772ce8] text-white text-sm font-bold py-2 rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(145,70,255,0.4)] hover:shadow-[0_0_20px_rgba(145,70,255,0.6)] active:scale-[0.97] flex items-center justify-center gap-2 border border-white/10"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </div>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
            <span>Watch Livestream</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
