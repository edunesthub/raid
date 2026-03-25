"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TournamentCard from "@/components/TournamentCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { useFeaturedTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/app/contexts/AuthContext";
import { Sparkles, Trophy, Target, Users, Zap, ArrowRight, Play, Star } from "lucide-react";

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
  }
];

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { tournaments, loading: tournamentsLoading, error } = useFeaturedTournaments(6);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Trophy, title: "Daily Tournaments", desc: "Compete for massive prize pools every single day." },
    { icon: Target, title: "Open Challenges", desc: "Challenge anyone, anytime. Winner takes all." },
    { icon: Users, title: "Pro Clans", desc: "Join or build the next dominant force in African esports." },
    { icon: Zap, title: "Instant Payouts", desc: "Fast, secure, and reliable withdrawals to your wallet." },
  ];

  return (
    <main className="min-h-screen bg-black overflow-x-clip w-full relative">
      {/* Premium Hero Section */}
      <section className="relative min-h-[100dvh] w-full flex items-start justify-center overflow-hidden pt-[120px] lg:pt-[160px] pb-20">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out transform ${
                idx === currentImageIndex ? "opacity-50 scale-100" : "opacity-0 scale-105"
              }`}
              style={{
                backgroundImage: `url(${img.desktop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
          {/* Refined masking to balance clarity and legibility */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-11" />
          <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black via-black/90 to-transparent z-13" />
        </div>

        {/* Content */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 relative z-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div className="text-center lg:text-left space-y-5 lg:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" />
              Africa's Premier Arena
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black italic text-white leading-[0.9] tracking-tighter uppercase">
              Home of <br />
              <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(255,106,0,0.3)]">Competitive <br /> Esports</span> <br />
              In Africa
            </h1>
            
            <p className="text-gray-400 text-base sm:text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
              The ultimate destination for competitive mobile gaming. Join daily tournaments, build your squad, and claim your glory.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 px-6 sm:px-0">
              <Link href="/tournament" className="w-full sm:w-auto btn-raid-v2 flex items-center justify-center gap-2 group text-sm">
                Enter Arena
              </Link>
              <Link href="/about" className="w-full sm:w-auto px-12 py-3 rounded-xl glass-panel border border-white/10 text-white font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm">
                About
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div>
                <p className="text-2xl font-black text-white">50K+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Players</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">$100K+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prizes Won</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">4.9/5</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Player Rating</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center perspective-2000 order-first lg:order-none mb-1 lg:mb-0 scale-[0.85] sm:scale-100 origin-top">
            <div className="relative group">
              <div className="iphone-frame-3d animate-float shadow-[0_0_100px_rgba(255,106,0,0.15)]">
                <div className="iphone-screen">
                  <img src="/screenshot.png" alt="App" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </div>
              <div className="absolute -top-10 -right-10 glass-panel p-4 rounded-2xl animate-float delay-700 shadow-2xl hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black italic text-green-500 leading-none mb-1">LIVE PAYOUT</p>
                    <p className="text-sm font-bold text-white">$250.00 Sent</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 glass-panel p-4 rounded-2xl animate-float delay-1000 shadow-2xl hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Star size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black italic text-orange-500 leading-none mb-1">TOURNAMENT</p>
                    <p className="text-sm font-bold text-white">CODM Elite Pro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-black z-20 -mt-1 pt-25">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -translate-x-1/2" />
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-panel p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 sm:mb-8 mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-orange-500/0 group-hover:shadow-orange-500/20">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black italic text-white mb-3 sm:mb-4 uppercase tracking-tighter">{f.title}</h3>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-16 relative bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
            <div className="relative group pl-4 md:pl-0">
              <div className="absolute left-0 md:-left-4 top-0 w-1 h-full bg-orange-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 text-orange-500/60 font-black uppercase tracking-[0.4em] text-[10px] mb-2">
                <span className="w-12 h-px bg-orange-500/30" />
                Live Arena
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mt-2">
                Featured <br className="md:hidden" /><span className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">Tournaments</span>
              </h2>
            </div>
            
            <Link 
              href="/tournament" 
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
            >
              <span className="text-white font-black uppercase tracking-widest text-xs">View All Events</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          {tournamentsLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="glass-panel p-12 text-center rounded-3xl border-red-500/20">
              <p className="text-red-400 font-bold mb-2">Error loading tournaments</p>
              <button onClick={() => window.location.reload()} className="text-sm text-gray-500 hover:text-white underline">Try Again</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* App CTA */}
      <section className="py-32 relative overflow-hidden bg-black">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] bg-[radial-gradient(circle_at_center,rgba(255,106,0,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-widest mb-8">
            <Zap size={14} className="animate-pulse" />
            Your Legacy Awaits
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.9] max-w-4xl mx-auto mb-8">
            Ready to <br />
            Become <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[0_0_30px_rgba(255,106,0,0.3)]">Legend?</span>
          </h2>
          
          <p className="text-gray-400 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto mb-12 px-2 sm:px-0">
            Join thousands of players already winning big in the Arena. Form your squad, dominate tournaments, and claim your glory.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
            <Link 
              href="/auth/signup" 
              className="group relative w-full sm:w-auto px-6 py-4 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase text-[10px] sm:text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,106,0,0.4)] overflow-hidden flex justify-center"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                Initialize Onboarding <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-6 py-4 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl glass-panel text-white font-black uppercase text-[10px] sm:text-sm tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all flex justify-center"
            >
              Contact Ops
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
