"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { useFeaturedTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/app/contexts/AuthContext";

const HERO_IMAGES = [
  {
    desktop: "https://codm.garena.com/static/images/Main-page/P1/main-kv.jpg",
    mobile: "https://codm.garena.com/static/images/Main-page/P1/main-kv.jpg"
  },
  {
    desktop: "https://www.konami.com/efootball/s/img/share/eFootball_kv_play_crazy.jpg",
    mobile: "https://www.konami.com/efootball/s/img/share/eFootball_kv_play_crazy.jpg"
  },
  {
    desktop: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202102/pubgmobile_1200x768.jpeg",
    mobile: "https://m.media-amazon.com/images/M/MV5BODQzNzJjY2QtY2Y2YS00OWJmLTlkZWMtMmNmMmE2NTg1MjQzXkEyXkFqcGc@._V1_.jpg",
  },
  {
    desktop: "https://images.hindustantimes.com/tech/img/2022/06/23/1600x900/54f31449f5f91cf0cc223cc635cd5952jpg_1655955051259_1655955067513.jpeg",
    mobile: "https://images.hindustantimes.com/tech/img/2022/06/23/1600x900/54f31449f5f91cf0cc223cc635cd5952jpg_1655955051259_1655955067513.jpeg"
  }
];

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { tournaments, loading: tournamentsLoading, error } = useFeaturedTournaments(4);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loading = authLoading || tournamentsLoading;

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{
        minHeight: "calc(var(--vh, 1vh) * 100)",
      }}
    >
      {/* Modern Hero Section */}
      <section className="relative h-[calc(100dvh-64px)] lg:h-[85vh] w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, idx) => (
            <div key={idx} className="absolute inset-0">
              {/* Desktop Image Layer */}
              <div
                className={`absolute inset-0 hidden lg:block transition-all duration-[3000ms] ease-out ${idx === currentImageIndex ? "opacity-60 scale-105" : "opacity-0 scale-110"
                  }`}
                style={{
                  backgroundImage: `url(${img.desktop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Mobile Image Layer */}
              <div
                className={`absolute inset-0 lg:hidden transition-all duration-[3000ms] ease-out ${idx === currentImageIndex ? "opacity-60 scale-105" : "opacity-0 scale-110"
                  }`}
                style={{
                  backgroundImage: `url(${img.mobile})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          ))}
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
        </div>

        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Content Wrapper */}
        <div className="container-mobile relative z-40 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-12 h-full py-4">
          {/* Visual Content: 3D iPhone */}
          <div className="flex-none lg:flex-1 flex justify-center items-center order-1 lg:order-2 px-6 lg:px-0">
            <div className="relative group perspective-2000">
              {/* Phone Frame */}
              <div className="iphone-frame-3d animate-float">
                <div className="iphone-screen">
                  <img
                    src="/screenshot.png"
                    alt="App Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-1/3 bg-black rounded-b-2xl z-20" />
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-10 bg-orange-500/15 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-none lg:flex-1 text-center lg:text-left animate-fade-in order-2 lg:order-1 lg:pt-0">
            <h1 className="text-3xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-tight lg:leading-none mb-3 lg:mb-6">
              Home of <span className="text-orange-500">esports</span> <br className="hidden lg:block" /> in africa
            </h1>
            <p className="text-gray-400 text-xs md:text-lg font-medium max-w-lg mb-6 lg:mb-10 mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
              The ultimate destination for competitive mobile gaming. Join daily tournaments, build your squad, and claim your glory.
            </p>
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 px-4 lg:px-0">
              <Link href="/tournament" className="flex-1 lg:flex-none px-6 lg:px-10 py-3 lg:py-4 bg-orange-500 text-white font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] rounded-xl lg:rounded-2xl shadow-xl shadow-orange-500/25 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all">
                Enter Arena
              </Link>
              <Link href="/about" className="flex-1 lg:flex-none px-6 lg:px-10 py-3 lg:py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] rounded-xl lg:rounded-2xl hover:bg-white/10 transition-all text-center">
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10" />
      </section>

      <div className="container-mobile py-16">
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
