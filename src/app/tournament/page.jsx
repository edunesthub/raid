// src/app/tournament/page.jsx
"use client";

import { useState, useEffect } from "react";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { tournamentService } from "@/services/tournamentService";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    game: 'all',
    searchTerm: ''
  });

  // Load tournaments on mount
  useEffect(() => {
    loadTournaments();
    loadAvailableGames();
  }, []);

  // Apply filters whenever tournaments or filters change
  useEffect(() => {
    applyFilters();
  }, [tournaments, filters]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGames = async () => {
    try {
      const games = await tournamentService.getAvailableGames();
      setAvailableGames(games);
    } catch (err) {
      console.error('Error loading games:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...tournaments];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Filter by game
    if (filters.game !== 'all') {
      filtered = filtered.filter(t => t.game === filters.game);
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const lowerSearch = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) ||
        t.game.toLowerCase().includes(lowerSearch) ||
        t.organizer.toLowerCase().includes(lowerSearch) ||
        t.description.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredTournaments(filtered);
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
  };

  const handleGameChange = (e) => {
    setFilters({ ...filters, game: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: 'all', game: 'all', searchTerm: '' });
  };

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.game !== 'all' || 
    filters.searchTerm.trim() !== '';

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Tournaments</h1>
        <p className="text-gray-400">Browse and join competitive gaming tournaments</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tournaments, games, or organizers..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {filters.searchTerm && (
            <button
              onClick={() => setFilters({ ...filters, searchTerm: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
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
              onChange={handleStatusChange}
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
              onChange={handleGameChange}
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

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
            </p>
            <button
              onClick={clearFilters}
              className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
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
          <button onClick={loadTournaments} className="btn-raid">
            Try Again
          </button>
        </div>
      )}

      {/* Tournaments Grid */}
      {!loading && !error && filteredTournaments.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              Showing {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTournaments.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
          <p className="text-gray-400 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters to see more results.'
              : 'Check back soon for exciting tournaments!'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-raid">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}