"use client";


import React, { useState, useEffect } from 'react';
import {
  Trophy, Users, Globe, Zap, Target, Award,
  TrendingUp, Shield, Gamepad2, Crown, Sparkles,
  ChevronRight, Play, Star, Rocket, Heart
} from 'lucide-react';

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Trophy,
      title: "Competitive Tournaments",
      description: "Join skill-based tournaments with fair matchmaking and real prizes",
      color: "from-blue-600 to-blue-400",
      stats: "[200+ NODES_ACTIVE]"
    },
    {
      icon: Users,
      title: "Clan System",
      description: "Form or join clans, compete together, and build lasting gaming communities",
      color: "from-purple-600 to-purple-400",
      stats: "[50+ CLANS_ONLINE]"
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Win prizes paid directly through mobile money - fast, secure, and reliable",
      color: "from-cyan-600 to-cyan-400",
      stats: "[24H_TRANSFER]"
    },
    {
      icon: Globe,
      title: "Pan-African Vision",
      description: "Starting in Ghana, expanding across Africa to unite gamers continent-wide",
      color: "from-pink-600 to-pink-400",
      stats: "[GROWING_DAILY]"
    }
  ];

  const games = [
    { name: "COD Mobile", icon: "🎮" },
    { name: "PUBG Mobile", icon: "🔫" },
    { name: "Mobile Legends", icon: "⚔️" },
    { name: "FIFA Mobile", icon: "⚽" },
    { name: "Free Fire", icon: "🔥" },
    { name: "Among Us", icon: "👥" }
  ];

  const stats = [
    { label: "Active Players", value: "10K+", icon: Users },
    { label: "Tournaments Hosted", value: "500+", icon: Trophy },
    { label: "Total Prizes Awarded", value: "₵50K+", icon: Award },
    { label: "Success Rate", value: "99.8%", icon: TrendingUp }
  ];

  const timeline = [
    { phase: "Registration", icon: "📝", desc: "Join any open tournament" },
    { phase: "Matchmaking", icon: "🎯", desc: "Fair bracket generation" },
    { phase: "Compete", icon: "⚔️", desc: "Play your matches" },
    { phase: "Win Prizes", icon: "💰", desc: "Instant mobile money payouts" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative">
      {/* Background Grid & Scanline */}
      <div className="scanline"></div>

      <div className="relative z-10 container mx-auto px-4 py-20 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative inline-block mb-10 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-none blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-black border border-blue-500/30 px-8 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.1)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}>
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs">// DECRYPTING_IDENTITY_PROTOCOL //</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-[0.9]">
            THE <span className="text-blue-500 glitch-hover">ARENA</span>
            <br />
            <span className="text-cyber-gradient">REDEFINED</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-300/60 font-bold uppercase tracking-[0.4em] max-w-2xl mx-auto mb-12">
            [SYS_MSG]: EMPOWERING THE NEXT GENERATION OF AFRICAN SKILL-BASED COMBATANTS.
          </p>

          <div className="flex flex-wrap gap-6 justify-center">
            <button className="btn-raid px-12 py-5 group">
              <span className="flex items-center gap-3">
                <Rocket className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                Initialize Access
              </span>
            </button>
            <button className="btn-ghost px-12 py-5 border border-pink-500/30 text-pink-500 group">
              <span className="flex items-center gap-3 uppercase font-black tracking-widest text-sm">
                <Play className="w-5 h-5" />
                Network Demo
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card-raid p-8 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rotate-45 translate-x-6 -translate-y-6 group-hover:bg-blue-500/10 transition-colors"></div>
                <Icon className="w-8 h-8 text-blue-500 mb-4 group-hover:shadow-[0_0_10px_#00f3ff] transition-all" />
                <p className="text-4xl font-black mb-1 tracking-tighter italic text-white group-hover:text-blue-400 transition-colors">{stat.value}</p>
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">// {stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="card-raid p-10 border-blue-500/40 relative">
            <div className="absolute top-2 left-2 w-1 h-10 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Core Mission_</h2>
            <p className="text-gray-400 font-bold leading-relaxed text-sm">
              Democratizing competitive gaming across Africa. We provide a fair,
              transparent, and rewarding infrastructure where skill is the only currency.
              PASSION_INTO_OPPORTUNITY = TRUE.
            </p>
          </div>

          <div className="card-raid p-10 border-pink-500/40 relative">
            <div className="absolute top-2 left-2 w-1 h-10 bg-pink-500 shadow-[0_0_10px_#ff00ff]"></div>
            <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-8" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
              <Rocket className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">Neural Vision_</h2>
            <p className="text-gray-400 font-bold leading-relaxed text-sm">
              Establishing Ghana as the central node of African esports. RAID Arena
              is creating a unified network to launch continental talent onto the
              global stage. AFRICA_CONNECT = ACTIVE.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-24">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30"></div>
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter">
              BATTLE <span className="text-blue-500">SPECIFICATIONS</span>
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group card-raid p-8 hover:border-blue-400 transition-all cursor-pointer relative"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-none flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`} style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-3 tracking-tight group-hover:text-blue-400">{feature.title}</h3>
                  <p className="text-gray-500 text-xs font-bold mb-6 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[9px] text-blue-400 font-black tracking-widest">{feature.stats}</span>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4">DEPLOYMENT_STAGES</h2>
            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.4em]">From Login to Victory</p>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-10 left-0 right-0 h-0.5 bg-blue-500/10" />

            <div className="grid sm:grid-cols-4 gap-12 relative">
              {timeline.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-black border border-blue-500/40 flex items-center justify-center text-4xl mx-auto shadow-[0_0_20px_rgba(0,243,255,0.1)] hover:scale-110 transition-transform hover:border-blue-400" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                      <span className="grayscale opacity-80">{step.icon}</span>
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black w-10 py-1 border border-black shadow-[0_0_10px_rgba(0,243,255,0.5)] z-20">
                      STEP_{index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-black uppercase mb-2 tracking-tight">{step.phase}</h3>
                  <p className="text-gray-500 text-[11px] font-bold uppercase leading-tight px-4">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supported Games */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4">COMPATIBLE_SOFTWARES</h2>
            <div className="h-1 w-24 bg-pink-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {games.map((game, index) => (
              <div
                key={index}
                className="group card-raid p-6 hover:border-pink-500/50 transition-all hover:scale-105 cursor-pointer text-center relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500/5 rotate-45 translate-x-4 translate-y-4"></div>
                <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{game.icon}</div>
                <p className="font-black uppercase text-[10px] tracking-widest text-gray-400 group-hover:text-white transition-colors">{game.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card-raid p-16 text-center border-blue-500/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/[0.02] group-hover:bg-blue-500/[0.04] transition-colors"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2 mb-10" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">// UPLINK_STANDBY //</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
              JOIN THE <span className="text-blue-500">RESISTANCE_</span>
            </h2>

            <p className="text-gray-400 font-bold text-sm mb-12 max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
              Whether you're a rogue agent or part of a elite squad,
              RAID Arena is your terminal for the future of mobile combat.
            </p>

            <button className="btn-raid px-16 py-6 group">
              <span className="flex items-center gap-4 text-lg">
                GET_INITIALIZED
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}