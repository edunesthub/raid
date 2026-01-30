"use client";

import Link from "next/link";
import Image from "next/image";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import UserSearchBar from "@/components/UserSearchBar.jsx";
import { useFeaturedTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useRef } from "react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { tournaments, loading: tournamentsLoading, error } = useFeaturedTournaments(4);

  const loading = authLoading || tournamentsLoading;
  const adsRef = useRef(null);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const el = adsRef.current;
    if (!el) return;

    const stopAnimation = () => {
      el.classList.add("stop-animation");
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        el.classList.remove("stop-animation");
      }, 1200);
    };

    el.addEventListener("scroll", stopAnimation, { passive: true });
    return () => el.removeEventListener("scroll", stopAnimation);
  }, []);

  const assets = [
    "/assets/8ball.jpg", "/assets/amongus.jpg", "/assets/brawlhalla.jpg",
    "/assets/chess.jpg", "/assets/cod.jpg", "/assets/dream.jpg",
    "/assets/efootball.jpg", "/assets/fifa.jpg", "/assets/freefire.jpg",
    "/assets/mortal.jpg", "/assets/pubg-mobile.jpg", "/assets/raid1.svg",
    "/assets/shawdow.jpg", "/assets/2kmbile.jpg",
  ];

  return (
    <div className="w-full h-full overflow-y-auto relative">
      <div className="container-mobile py-8 relative z-10">
        {/* Cyber Hero */}
        <div className="text-center mb-10 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-black/40 backdrop-blur-md border border-blue-500/30 p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(0,243,255,0.1)]" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_15px_#00f3ff]"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>

            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4 glitch-hover">
              RAID <span className="text-blue-500">ARENA</span>
            </h1>
            <p className="text-xs text-blue-300 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto">
              [SYSTEM_INITIALIZED]: Ghanaian Skill-Based Combat
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="h-1 w-12 bg-blue-500/40"></div>
              <div className="h-1 w-4 bg-pink-500/60"></div>
              <div className="h-1 w-12 bg-blue-500/40"></div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <UserSearchBar />
        </div>

        {/* 🟧 Ads Ticker */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Sponsored Uplinks</h2>
          </div>

          <div
            ref={adsRef}
            className="relative overflow-x-auto overflow-y-hidden w-full group hide-scrollbar"
          >
            <div className="ads-track gap-6 whitespace-nowrap animate-scroll-slow group-hover:pause-scroll py-2">
              {[...assets, ...assets].map((src, idx) => (
                <Link
                  key={idx}
                  href={`/ads/${idx % assets.length}`}
                  className="shrink-0 w-72 h-44 relative overflow-hidden border border-white/10 group/ad transition-all duration-500 hover:border-blue-500/50"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
                >
                  <Image
                    src={src}
                    alt={`ad-${idx}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/ad:scale-110 grayscale-[0.5] group-hover/ad:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/ad:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/ad:opacity-100 transition-opacity">
                    <div className="w-4 h-1 bg-blue-500"></div>
                    <div className="w-1 h-1 bg-blue-500"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-pink-500 shadow-[0_0_10px_#ff00ff]"></div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest italic">
                Active Nodes
              </h2>
            </div>
            <Link href="/tournament" className="text-blue-500 hover:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
              View Database <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20 bg-black/20 border border-white/5" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}>
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner />
                <span className="text-blue-500 text-[10px] animate-pulse uppercase font-black tracking-widest">Accessing Network...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-pink-600/10 border border-pink-600/30 p-8 text-center" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)' }}>
              <p className="text-pink-500 font-black uppercase tracking-widest mb-2">⚠️ CONNECTION_ERROR</p>
              <p className="text-gray-500 text-xs">{error}</p>
            </div>
          )}

          {!loading && !error && tournaments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments
                .filter((t) => {
                  const viewerCountry = user?.country?.toLowerCase?.();
                  if (!viewerCountry || (viewerCountry !== "ghana" && viewerCountry !== "nigeria")) return true;
                  const country = (t.country || t.region || "Ghana").toLowerCase();
                  return country === viewerCountry;
                })
                .map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
            </div>
          )}

          {!loading && !error && tournaments.length === 0 && (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-16 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
              <div className="text-5xl mb-6 grayscale opacity-50">📡</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">ZERO_NODES_FOUND</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 font-bold">
                The arena is currently silent. Scan later for new transmissions.
              </p>
              <Link href="/about" className="btn-raid inline-block px-10">
                Network Protocol
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
