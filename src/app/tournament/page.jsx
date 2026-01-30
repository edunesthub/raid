// src/app/tournament/page.jsx
"use client";

import { useState, useEffect } from "react";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { tournamentService } from "@/services/tournamentService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { user } = useAuth();

  const [filters, setFilters] = useState({
    status: "all",
    game: "all",
    searchTerm: "",
  });

  useEffect(() => {
    loadTournaments();
    loadAvailableGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tournaments, filters, user?.country]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGames = async () => {
    try {
      const games = await tournamentService.getAvailableGames();
      setAvailableGames(games);
    } catch (err) {
      console.error("Error loading games:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...tournaments];

    const viewerCountry = user?.country?.toLowerCase?.();
    if (viewerCountry === "ghana" || viewerCountry === "nigeria") {
      filtered = filtered.filter((t) => {
        const tournamentCountry = (t.country || t.region || "Ghana").toLowerCase();
        return tournamentCountry === viewerCountry;
      });
    }

    // Hide completed tournaments by default
    if (filters.status === "completed") {
      filtered = filtered.filter((t) => t.status === "completed");
    } else if (filters.status === "all") {
      filtered = filtered.filter((t) => t.status !== "completed");
    } else {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.game !== "all") {
      filtered = filtered.filter((t) => t.game === filters.game);
    }

    if (filters.searchTerm.trim()) {
      const lowerSearch = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerSearch) ||
          t.game.toLowerCase().includes(lowerSearch) ||
          t.organizer.toLowerCase().includes(lowerSearch) ||
          t.description.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredTournaments(filtered);
  };

  const clearFilters = () => {
    setFilters({ status: "all", game: "all", searchTerm: "" });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.game !== "all" ||
    filters.searchTerm.trim() !== "";

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Tournaments</h1>
        <p className="text-gray-400">
          Browse and join competitive gaming tournaments
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="flex items-center gap-3 mb-8 bg-gray-900/70 border border-gray-700 rounded-xl px-4 py-3 backdrop-blur-sm shadow-md">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tournaments, games, or organizers..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters({ ...filters, searchTerm: e.target.value })
            }
            className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-400 pl-10 pr-8"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              onClick={() => setFilters({ ...filters, searchTerm: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 font-medium px-4 py-2 rounded-lg transition-all"
        >
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V20a1 1 0 01-1.447.894l-4-2A1 1 0 019 18v-4.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filters
        </button>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              Filter Tournaments
            </h2>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="registration-open">Registration Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Game */}
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Game
              </label>
              <select
                value={filters.game}
                onChange={(e) =>
                  setFilters({ ...filters, game: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Games</option>
                {availableGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between mt-6">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-400 transition-all"
                >
                  Clear Filters
                </button>
              ) : (
                <span></span>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-2">⚠️ Failed to load tournaments</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={loadTournaments} className="btn-raid">
            Try Again
          </button>
        </div>
      )}

      {/* Tournament Grid */}
      {!loading && !error && filteredTournaments.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              Showing {filteredTournaments.length} tournament
              {filteredTournaments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && !error && filteredTournaments.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Tournaments Found
          </h3>
          <p className="text-gray-400 mb-6">
            {hasActiveFilters
              ? "Try adjusting your search or filters to see more results."
              : "Check back soon for exciting tournaments!"}
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
