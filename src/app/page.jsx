"use client";

import Link from "next/link";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import UserSearchBar from "@/components/UserSearchBar.jsx";
import { useFeaturedTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { tournaments, loading: tournamentsLoading, error } = useFeaturedTournaments(4);

  // Show loading spinner while auth is initializing
  const loading = authLoading || tournamentsLoading;



  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{
        minHeight: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      <div className="container-mobile py-6">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="bg-linear-to-r from-black/10 to-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300">
              Compete in skill-based tournaments with gamers around Ghana.
            </p>
          </div>
        </div>

        <UserSearchBar />

        {/* Rest of your page unchanged */}
        <section className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">🏆</span>
              Raid Tournaments
            </h2>
            <Link href="/tournament" className="text-orange-500 hover:text-orange-400 text-sm">
              View All →
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-center">
              <p className="text-red-400 mb-2">⚠️ Failed to load tournaments</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && tournaments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}

          {!loading && !error && tournaments.length === 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">No Tournaments Available</h3>
              <p className="text-gray-400 mb-6">
                Check back soon for exciting tournaments!
              </p>
              <Link href="/about" className="btn-raid inline-block">
                Learn More About RAID
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
