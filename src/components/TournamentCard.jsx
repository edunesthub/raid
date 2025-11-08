import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TournamentCard = ({ tournament }) => {
  return (
    <div className="bg-raid-gray-dark rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-40 w-full">
        <img
          src={tournament.image}
          alt={tournament.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
              <p className="text-raid-gray-light text-sm">{tournament.game}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${tournament.status === 'live' ? 'bg-green-600' :
            tournament.status === 'registration-open' ? 'bg-blue-600' :
              'bg-yellow-600'
            }`}>
            {tournament.status === 'registration-open' ? 'REGISTRATION OPEN' : tournament.status.toUpperCase()}
          </span>
        </div>

        <p className="text-raid-gray-light mb-6 line-clamp-2">{tournament.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-raid-gray-light text-sm">Prize Pool</p>
            <p className="text-2xl font-extrabold text-green-400">₵{tournament.prizePool.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-raid-gray-light text-sm">Entry Fee</p>
            <p className="text-2xl font-bold text-white">₵{tournament.entryFee.toLocaleString()}</p>
          </div>
          {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
            <div className="col-span-2">
              <p className="text-raid-gray-light text-sm mb-2">Prize Distribution</p>
              <div className="bg-raid-gray-darker rounded-md p-3">
                {tournament.prizeDistribution.map((prize, index) => (
                  <div key={index} className="flex justify-between text-sm text-white mb-1">
                    <span>{prize.rank}</span>
                    <span>{prize.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-raid-gray-light text-sm">Format</p>
            <p className="text-white">{tournament.format}</p>
          </div>
          <div>
            <p className="text-raid-gray-light text-sm">Players</p>
            <p className="text-white">{tournament.currentPlayers}/{tournament.maxPlayers}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-raid-gray-light text-sm">Players</span>
            <span className="text-white">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </span>
          </div>
          <div className="w-full bg-raid-gray-darker rounded-full h-2">
            <div
              className="bg-raid-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
            />
          </div>
        </div>

        <Link
          href={`/tournament/${tournament.id}/`}
          className="block w-full text-center bg-raid-orange hover:bg-raid-orange-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TournamentCard;