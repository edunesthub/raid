// src/app/tournament/page.jsx
"use client";

import { useState, useEffect } from "react";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { tournamentService } from "@/services/tournamentService";
import { useAuth } from "../contexts/AuthContext";

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
  }, [tournaments, filters]);

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
    <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Tournaments</h1>
          <p className="text-gray-400 text-sm md:text-base font-medium">
            Browse and join competitive gaming tournaments
          </p>
        </div>

      {/* Modern Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-2 md:p-3 backdrop-blur-md">
        {/* Search input */}
        <div className="relative flex-1 bg-white/[0.03] border border-white/5 rounded-xl transition-colors focus-within:border-orange-500/50">
          <input
            type="text"
            placeholder="Search tournaments, games, or organizers..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters({ ...filters, searchTerm: e.target.value })
            }
            className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-500 pl-11 pr-10 py-3.5 md:py-4 text-sm font-medium"
          />
          <svg
            className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
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
              className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
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
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] md:text-xs px-6 py-3.5 md:py-4 rounded-xl transition-all w-full sm:w-auto active:scale-95"
        >
          <svg
            className="w-4 h-4 text-orange-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-6 text-center">
              Filter Tournaments
            </h2>

            {/* Status Custom Select */}
            <div className="mb-6 relative z-30">
              <label className="block text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
                Status
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('status-dropdown').classList.toggle('hidden');
                    document.getElementById('game-dropdown').classList.add('hidden');
                  }}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                >
                  <span className="capitalize">{filters.status.replace('-', ' ')}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {/* Custom Options Menu */}
                <div id="status-dropdown" className="hidden absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-[#121217] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  {[
                    { val: "all", label: "All Status" },
                    { val: "registration-open", label: "Registration Open" },
                    { val: "upcoming", label: "Upcoming" },
                    { val: "live", label: "Live" },
                    { val: "completed", label: "Completed" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, status: opt.val });
                        document.getElementById('status-dropdown').classList.add('hidden');
                      }}
                      className="w-full text-left px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/[0.06] flex items-center justify-between group border-b border-white/5 last:border-0"
                    >
                      <span className={filters.status === opt.val ? 'text-orange-500 font-bold' : 'text-gray-300 group-hover:text-white'}>
                        {opt.label}
                      </span>
                      {filters.status === opt.val && (
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Custom Select */}
            <div className="mb-8 relative z-20">
              <label className="block text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
                Game
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('game-dropdown').classList.toggle('hidden');
                    document.getElementById('status-dropdown').classList.add('hidden');
                  }}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                >
                  <span className="capitalize">{filters.game === 'all' ? 'All Games' : filters.game}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {/* Custom Options Menu */}
                <div id="game-dropdown" className="hidden absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-[#121217] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-56 overflow-y-auto scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, game: 'all' });
                      document.getElementById('game-dropdown').classList.add('hidden');
                    }}
                    className="w-full text-left px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/[0.06] flex items-center justify-between group border-b border-white/5"
                  >
                    <span className={filters.game === 'all' ? 'text-orange-500 font-bold' : 'text-gray-300 group-hover:text-white'}>
                      All Games
                    </span>
                    {filters.game === 'all' && (
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    )}
                  </button>
                  
                  {availableGames.map((game) => (
                    <button
                      key={game}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, game: game });
                        document.getElementById('game-dropdown').classList.add('hidden');
                      }}
                      className="w-full text-left px-5 py-3.5 text-sm font-medium transition-colors hover:bg-white/[0.06] flex items-center justify-between group border-b border-white/5 last:border-0"
                    >
                      <span className={filters.game === game ? 'text-orange-500 font-bold' : 'text-gray-300 group-hover:text-white'}>
                        {game}
                      </span>
                      {filters.game === game && (
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center"
              >
                Close
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center"
              >
                Apply
              </button>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 text-center">
                <button
                  onClick={clearFilters}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
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
        <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto mt-8 backdrop-blur-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
            Failed to load tournaments
          </h3>
          <p className="text-gray-400 text-sm font-medium mb-6">
            {error}
          </p>
          <button
            onClick={loadTournaments}
            className="inline-flex items-center space-x-3 px-8 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all rounded-xl font-black uppercase tracking-widest text-xs"
          >
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
        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto mt-8">
          <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
            No Tournaments Found
          </h3>
          <p className="text-gray-400 text-sm md:text-base font-medium mb-8 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? "Try adjusting your search or filters to see more results."
              : "Check back soon for exciting tournaments!"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-2xl w-full md:w-auto justify-center font-black uppercase tracking-widest text-xs"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
