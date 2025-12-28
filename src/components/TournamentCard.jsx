import React from "react";
import Link from "next/link";

const TournamentCard = ({ tournament }) => {
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
  className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full text-white shadow-md ${
    tournament.status === "live"
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
            <p className="text-gray-400 text-xs">Prize Pool</p>
            <p className="text-green-400 font-bold">
              ₵{tournament.prizePool.toLocaleString()}
            </p>
          </div>
          <div className="border border-orange-500/40 rounded-lg p-2 bg-[#1a1a1d]/90 hover:bg-[#1e1e22]/90 transition-colors">
            <p className="text-gray-400 text-xs">Entry Fee</p>
            <p className="text-white font-semibold">
              ₵{tournament.entryFee.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Players Progress */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
            <span>Players</span>
            <span className="text-white">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-[#1b1b1f] border border-orange-500/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  (tournament.currentPlayers / tournament.maxPlayers) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Prize Distribution */}
        {tournament.prizeDistribution?.length > 0 && (
          <div className="bg-[#1a1a1d]/90 border border-orange-500/30 rounded-lg p-2 text-xs text-white space-y-1 max-h-20 overflow-y-auto hover:bg-[#1f1f23]/90 transition-colors">
            {tournament.prizeDistribution.map((prize, index) => (
              <div
                key={index}
                className="flex justify-between text-[11px] sm:text-sm"
              >
                <span>{prize.rank}</span>
                <span>{prize.percentage}%</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/tournament/${tournament.id}/`}
          className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-sm font-bold py-2 rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(255,120,0,0.4)] hover:shadow-[0_0_20px_rgba(255,140,0,0.6)] active:scale-[0.97]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TournamentCard;
