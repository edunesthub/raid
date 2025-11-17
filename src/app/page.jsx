"use client";

import Link from "next/link";
import Image from "next/image";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import UserSearchBar from "@/components/UserSearchBar.jsx";
import { useFeaturedTournaments } from "@/hooks/useTournaments";
import { useEffect, useRef } from "react";

export default function Home() {
  const { tournaments, loading, error } = useFeaturedTournaments(4);

  const adsRef = useRef(null);
  const scrollTimeout = useRef(null);   // ✅ place here

  useEffect(() => {
    const el = adsRef.current;
    if (!el) return;

    const stopAnimation = () => {
      el.classList.add("stop-animation");

      if (scrollTimeout.current)
        clearTimeout(scrollTimeout.current);

      scrollTimeout.current = setTimeout(() => {
        el.classList.remove("stop-animation");
      }, 1200);
    };

    el.addEventListener("scroll", stopAnimation, { passive: true });

    return () => {
      el.removeEventListener("scroll", stopAnimation);
    };
  }, []);


  const assets = [
    "/assets/8ball.jpg",
    "/assets/amongus.jpg",
    "/assets/brawlhalla.jpg",
    "/assets/chess.jpg",
    "/assets/cod.jpg",
    "/assets/dream.jpg",
    "/assets/efootball.jpg",
    "/assets/fifa.jpg",
    "/assets/freefire.jpg",
    "/assets/mortal.jpg",
    "/assets/pubg-mobile.jpg",
    "/assets/raid1.svg",
    "/assets/shawdow.jpg",
    "/assets/2kmbile.jpg",
  ];

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

        {/* 🟧 Ads Ticker */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Ads</h2>

         <div
  ref={adsRef}
  className="relative overflow-x-auto overflow-y-hidden w-full group scrollbar-hide"
>
  <div className="ads-track gap-4 whitespace-nowrap animate-scroll-slow group-hover:pause-scroll">
    {[...assets, ...assets].map((src, idx) => (
      <Link
        key={idx}
        href={`/ads/${idx % assets.length}`}
        className="shrink-0 w-64 h-40 relative rounded-lg overflow-hidden border border-gray-700"
      >
        <Image
          src={src}
          alt={`ad-${idx}`}
          fill
          className="object-cover"
        />
      </Link>
    ))}
  </div>
</div>

        </section>

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
