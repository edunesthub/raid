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
    <div className="w-full h-full overflow-y-auto relative">
      <div className="scanline"></div>
      <div className="container-mobile py-8 relative z-10">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-8 w-1 bg-blue-500 shadow-[0_0_15px_#00f3ff]"></div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Combat <span className="text-blue-500">Database</span></h1>
          </div>
          <p className="text-blue-300/60 font-bold uppercase tracking-[0.2em] text-xs">
            [SYS]: Accessing active battle nodes across the network...
          </p>
        </div>

        {/* Modern Search Bar */}
        <div className="group relative mb-12">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-none blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex items-center gap-3 bg-black border border-blue-500/30 px-6 py-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
            <div className="relative flex-1 flex items-center gap-4">
              <svg
                className="w-6 h-6 text-blue-500"
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
              <input
                type="text"
                placeholder="SCAN_FOR_TOURNAMENTS_GAMES_OR_ORGANIZERS..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-blue-900/50 font-black uppercase tracking-widest text-xs"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => setFilters({ ...filters, searchTerm: "" })}
                  className="text-pink-500 hover:text-pink-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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

            <div className="h-8 w-px bg-blue-500/20 hidden sm:block"></div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-3 text-blue-400 hover:text-blue-300 font-black uppercase tracking-[0.2em] text-[10px] py-1 transition-all"
            >
              <svg
                className="w-5 h-5"
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
              Filter_Modules
            </button>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#0a0a0f] border border-blue-500/40 p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}>
              <div className="absolute top-0 left-0 w-16 h-0.5 bg-blue-500"></div>
              <div className="absolute top-0 left-0 w-0.5 h-16 bg-blue-500"></div>

              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 text-center">
                Module <span className="text-blue-500">Parameters</span>
              </h2>

              {/* Status */}
              <div className="mb-6 group">
                <label className="block text-blue-500/70 text-[10px] font-black uppercase tracking-[0.3em] mb-2 group-hover:text-blue-400 transition-colors">
                  // Status_Protocol
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full bg-black/50 border border-blue-500/20 rounded-none px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <option value="all">Any Status</option>
                  <option value="registration-open">Registration Open</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Game */}
              <div className="mb-8 group">
                <label className="block text-blue-500/70 text-[10px] font-black uppercase tracking-[0.3em] mb-2 group-hover:text-blue-400 transition-colors">
                  // Game_Interface
                </label>
                <select
                  value={filters.game}
                  onChange={(e) =>
                    setFilters({ ...filters, game: e.target.value })
                  }
                  className="w-full bg-black/50 border border-blue-500/20 rounded-none px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <option value="all">All Modules</option>
                  {availableGames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-10">
                <button
                  onClick={clearFilters}
                  className="w-full border border-pink-500/30 text-pink-500 text-[10px] font-black uppercase tracking-widest py-3 hover:bg-pink-500/10 transition-all"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                >
                  Reset_Cache
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-3 hover:bg-blue-500 shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                  style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
                >
                  Apply_Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <LoadingSpinner />
            <span className="text-blue-500 text-[10px] font-black animate-pulse tracking-[0.5em]">INITIALIZING_SCAN...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-pink-600/10 border border-pink-600/30 p-12 text-center" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}>
            <p className="text-pink-500 font-black uppercase tracking-[0.3em] mb-4">⚠️ DATA_RECEPTION_FAILURE</p>
            <p className="text-gray-500 text-xs mb-8">{error}</p>
            <button onClick={loadTournaments} className="btn-raid px-10">
              Retry_Uplink
            </button>
          </div>
        )}

        {/* Tournament Grid */}
        {!loading && !error && filteredTournaments.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 animate-ping rounded-full"></div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {filteredTournaments.length} NODES_ONLINE
                </p>
              </div>
              <div className="h-px flex-1 bg-blue-500/10 mx-6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && !error && filteredTournaments.length === 0 && (
          <div className="bg-black/40 backdrop-blur-md border border-white/5 p-20 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
            <div className="text-6xl mb-8 grayscale opacity-20 animate-pulse">📡</div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
              ZERO_MATCHES_DETECTED
            </h3>
            <p className="text-gray-500 text-sm mb-12 font-bold uppercase tracking-wide max-w-sm mx-auto">
              {hasActiveFilters
                ? "The current filters returned no active transmissions. Suggest clearing cache."
                : "The arena network is silent. Awaiting new combat data."}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-raid px-12">
                Flush_Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
