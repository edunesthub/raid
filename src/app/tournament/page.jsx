"use client";

import { useState } from "react";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { useTournaments } from "@/hooks/useTournaments";

export default function TournamentsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    game: 'all'
  });

  // Build query options based on filters
  const queryOptions = {};
  if (filters.status !== 'all') {
    queryOptions.status = filters.status;
  }
  if (filters.game !== 'all') {
    queryOptions.game = filters.game;
  }

  const { tournaments, loading, error, refresh } = useTournaments(queryOptions);

  // Extract unique games from tournaments for filter
  const availableGames = [...new Set(tournaments.map(t => t.game))];

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Tournaments</h1>
        <p className="text-gray-400">Browse and join competitive gaming tournaments</p>
      </div>

      {/* Filters */}
      <div className="card-raid p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="registration-open">Registration Open</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Game Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Game
            </label>
            <select
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Games</option>
              {availableGames.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(filters.status !== 'all' || filters.game !== 'all') && (
          <button
            onClick={() => setFilters({ status: 'all', game: 'all' })}
            className="mt-4 text-orange-500 hover:text-orange-400 text-sm"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-2">⚠️ Failed to load tournaments</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={refresh} className="btn-raid">
            Try Again
          </button>
        </div>
      )}

      {/* Tournaments Grid */}
      {!loading && !error && tournaments.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              Showing {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && tournaments.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
          <p className="text-gray-400 mb-6">
            {filters.status !== 'all' || filters.game !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Check back soon for exciting tournaments!'}
          </p>
          {(filters.status !== 'all' || filters.game !== 'all') && (
            <button
              onClick={() => setFilters({ status: 'all', game: 'all' })}
              className="btn-raid"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}