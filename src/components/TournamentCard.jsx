import React, { useState } from "react";
import Link from "next/link";
import { Loader } from "lucide-react";

const TournamentCard = ({ tournament }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="relative group bg-[#0a0a0f]/90 backdrop-blur-xl border border-blue-500/30 overflow-hidden transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
      {/* scanline overlay for card */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20"></div>

      {/* IMAGE */}
      <div className="relative w-full h-40 sm:h-48 overflow-hidden border-b border-blue-500/20">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-60"></div>

        <span className="absolute top-3 left-3 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-black/80 border border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(0,243,255,0.3)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
          {tournament.country || tournament.region || 'Ghana'}
        </span>

        <span
          className={`absolute top-3 right-3 px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-tighter text-white shadow-lg ${tournament.status === "live"
            ? "bg-pink-600 animate-pulse"
            : tournament.status === "registration-open"
              ? "bg-blue-600"
              : tournament.status === "upcoming"
                ? "bg-purple-600"
                : "bg-gray-700"
            }`}
          style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
        >
          {tournament.status === "registration-open"
            ? "OPEN"
            : tournament.status === "live"
              ? "LIVE"
              : tournament.status === "upcoming"
                ? "SOON"
                : "ENDED"}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3 relative z-20">
        {/* Title + Game */}
        <div>
          <h3 className="text-lg font-black text-white line-clamp-1 tracking-tighter uppercase italic group-hover:text-blue-400 transition-colors">
            {tournament.title}
          </h3>
          <p className="text-blue-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            // {tournament.game}
          </p>
        </div>

        {/* Prize & Entry */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-blue-500/20 p-2 bg-blue-500/5 hover:bg-blue-500/10 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Prize Pool</p>
            <p className="text-cyan-400 font-black tracking-tighter">
              {tournament.currency || '₵'}{tournament.prizePool.toLocaleString()}
            </p>
          </div>
          <div className="border border-purple-500/20 p-2 bg-purple-500/5 hover:bg-purple-500/10 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Entry Fee</p>
            <p className="text-purple-400 font-black tracking-tighter">
              {tournament.currency || '₵'}{tournament.entryFee.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Players Progress */}
        <div className="mt-1">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            <span>Slots Occupied</span>
            <span className="text-blue-400 font-bold">
              {tournament.currentPlayers} / {tournament.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-gray-900/50 border border-blue-500/20 h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,243,255,0.5)]"
              style={{
                width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/tournament/${tournament.id}/`}
          onClick={() => setIsNavigating(true)}
          className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.3em] py-3 transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          {isNavigating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Initializing...</span>
            </>
          ) : (
            'Access Data'
          )}
        </Link>

        {tournament.status === "live" && tournament.twitch_link && (
          <a
            href={tournament.twitch_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-pink-600 hover:bg-pink-500 text-white text-xs font-black uppercase tracking-[0.3em] py-3 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </div>
            <span>Stream Live</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
