'use client';

import { useEffect, useState } from 'react';
import { leagueApiClient } from '@/lib/apiClient';
import LeagueCard from '@/components/LeagueCard.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { defaultGames } from '@/data/defaultClans';

const LeaguesPage = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState('all');

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const fetchedLeagues = await leagueApiClient.getAllLeagues();
        setLeagues(fetchedLeagues);
      } catch (err) {
        setError('Failed to fetch leagues.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  const filteredLeagues = selectedGame === 'all'
    ? leagues
    : leagues.filter(league => league.gameId === selectedGame);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Raid Arena Leagues</h1>

      <div className="mb-8 flex justify-center">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white rounded-md p-2"
        >
          <option value="all">All Games</option>
          {defaultGames.map((game) => (
            <option key={game.gameId} value={game.gameId}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeagues.length > 0 ? (
          filteredLeagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No leagues available for this game.</p>
        )}
      </div>
    </div>
  );
};

export default LeaguesPage;