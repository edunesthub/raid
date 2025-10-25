'use client';

import { useState } from 'react';
import { defaultGames } from '@/data/defaultClans';
import Image from 'next/image';

export default function ClanList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [loading, setLoading] = useState(false);

  // Get all default clans from all games
  const preexistingClans = defaultGames.flatMap(game => 
    game.defaultClans.map(clan => ({
      ...clan,
      gameName: game.name,
      gameImage: game.imageUrl
    }))
  );

  // Filter clans based on search and selected game
  const filteredClans = preexistingClans.filter(clan => {
    const matchesSearch = 
      clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame === 'all' || clan.gameId === selectedGame;
    return matchesSearch && matchesGame;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search clans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
        />
        
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full md:w-48 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
        >
          <option value="all">All Games</option>
          {defaultGames.map(game => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClans.map((clan) => (
          <div key={clan.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {/* Game Banner Image */}
            <div className="relative w-full h-24">
              <Image
                src={clan.imageUrl}
                alt={clan.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-4">
              {/* Clan Info */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{clan.name}</h3>
                <span className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-300">
                  [{clan.tag}]
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {clan.description}
              </p>

              {/* Stats & Join Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span>{clan.members.length} members</span>
                </div>

                <button 
                  onClick={() => {}} // TODO: Implement join functionality
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredClans.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            No clans found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}