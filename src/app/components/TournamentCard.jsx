import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TournamentCard = ({ tournament }) => {
  const progressPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 border border-gray-800 hover:border-orange-500/50 transform hover:-translate-y-2">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Tournament Image with overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={tournament.image}
          alt={tournament.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-xs font-bold text-white backdrop-blur-md border-2 shadow-lg ${
            tournament.status === 'live' 
              ? 'bg-green-500/80 border-green-400 animate-pulse' 
              : tournament.status === 'registration-open' 
                ? 'bg-blue-500/80 border-blue-400' 
                : 'bg-yellow-500/80 border-yellow-400'
          }`}>
            {tournament.status === 'registration-open' ? '🔥 OPEN' : tournament.status === 'live' ? '🔴 LIVE' : '⏰ SOON'}
          </span>
        </div>

        {/* Game icon floating badge */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-700">
          <p className="text-white text-sm font-semibold">{tournament.game}</p>
        </div>
      </div>

      {/* Card content */}
      <div className="relative p-6 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
            {tournament.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">{tournament.description}</p>
        </div>

        {/* Prize and Entry Fee - Highlighted */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 hover:border-green-500/60 transition-colors duration-300">
            <p className="text-green-400 text-xs font-medium mb-1 flex items-center">
              <span className="mr-1">💰</span> Prize Pool
            </p>
            <p className="text-2xl font-extrabold text-green-400">
              ₵{tournament.prizePool.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/60 transition-colors duration-300">
            <p className="text-orange-400 text-xs font-medium mb-1 flex items-center">
              <span className="mr-1">🎫</span> Entry Fee
            </p>
            <p className="text-2xl font-bold text-orange-400">
              ₵{tournament.entryFee.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="text-lg">⚔️</span>
            <span>{tournament.format}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="text-lg">🌍</span>
            <span>{tournament.region}</span>
          </div>
        </div>

        {/* Prize Distribution Preview */}
        {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-2 font-medium">🏆 Prize Split</p>
            <div className="flex justify-between items-center">
              {tournament.prizeDistribution.map((prize, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500">{prize.rank}</p>
                  <p className="text-sm font-bold text-white">{prize.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm flex items-center">
              <span className="mr-1">👥</span> Players
            </span>
            <span className="text-white font-semibold text-sm">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </span>
          </div>
          <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
            <div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/50"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {spotsLeft > 0 ? `🔥 ${spotsLeft} spots left!` : '✅ Tournament full!'}
          </p>
        </div>

        {/* Action Button */}
        <Link
          href={`/tournament/${tournament.id}/`}
          className="block w-full text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 group-hover:animate-pulse"
        >
          <span className="flex items-center justify-center">
            View Details
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default TournamentCard;