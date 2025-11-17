"use client";


import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Globe, Zap, Target, Award, 
  TrendingUp, Shield, Gamepad2, Crown, Sparkles,
  ChevronRight, Play, Star, Rocket, Heart
} from 'lucide-react';

export default function AboutPage() {
  const [activeFeature, setActiveFeature] = useState(0);
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
      color: "from-yellow-500 to-orange-500",
      stats: "200+ Monthly Tournaments"
    },
    {
      icon: Users,
      title: "Clan System",
      description: "Form or join clans, compete together, and build lasting gaming communities",
      color: "from-blue-500 to-cyan-500",
      stats: "50+ Active Clans"
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Win prizes paid directly through mobile money - fast, secure, and reliable",
      color: "from-green-500 to-emerald-500",
      stats: "24hr Processing"
    },
    {
      icon: Globe,
      title: "Pan-African Vision",
      description: "Starting in Ghana, expanding across Africa to unite gamers continent-wide",
      color: "from-purple-500 to-pink-500",
      stats: "Growing Daily"
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div 
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-semibold">About RAID Arena</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 text-transparent bg-clip-text leading-tight">
            Ghana's Premier
            <br />
            Mobile Esports Platform
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Empowering African gamers to compete, connect, and earn through 
            skill-based mobile gaming tournaments
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button className="group flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-105">
              <Rocket className="w-5 h-5" />
              Join Tournament
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl font-bold transition-all">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all hover:scale-105 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="w-10 h-10 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-8 hover:border-orange-500/40 transition-all">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To democratize competitive gaming in Africa by providing a fair, 
              transparent, and rewarding platform where skill determines success. 
              We're building the infrastructure that transforms gaming passion into 
              real opportunities.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 transition-all">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              To establish Ghana as a continental esports hub and expand RAID Arena 
              across Africa, creating a unified platform that showcases African gaming 
              talent on the global stage.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">RAID Arena</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built by gamers, for gamers. Experience competitive gaming like never before.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all cursor-pointer"
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-orange-400 font-semibold">{feature.stats}</span>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From registration to victory in four simple steps
            </p>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 -translate-y-1/2" />
            
            <div className="grid sm:grid-cols-4 gap-8 relative">
              {timeline.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg shadow-orange-500/25 hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold border-4 border-black">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.phase}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supported Games */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Supported Games</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Compete in your favorite mobile titles
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {games.map((game, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all hover:scale-105 cursor-pointer group text-center"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{game.icon}</div>
                <p className="font-semibold text-sm">{game.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* League System Highlight */}
        <div className="bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className="w-10 h-10 text-yellow-400" />
              <h2 className="text-3xl sm:text-4xl font-bold text-center">
                RAID Arena League System
              </h2>
              <Crown className="w-10 h-10 text-yellow-400" />
            </div>
            
            <p className="text-center text-gray-300 text-lg mb-8">
              Experience continuous competition with our seasonal league format. 
              Climb divisions, earn recognition, and compete for bigger prizes.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Division System</h3>
                <p className="text-gray-400 text-sm">Bronze, Silver, Gold tiers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Seasonal Play</h3>
                <p className="text-gray-400 text-sm">6-8 week competitions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Special Awards</h3>
                <p className="text-gray-400 text-sm">MVP, Top Scorer, & more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Fair Play", desc: "100% skill-based competition with zero tolerance for cheating" },
              { icon: Heart, title: "Community First", desc: "Building lasting connections between African gamers" },
              { icon: Zap, title: "Innovation", desc: "Cutting-edge platform features and seamless UX" },
              { icon: TrendingUp, title: "Growth", desc: "Continuous improvement for players and platform" },
              { icon: Globe, title: "Inclusion", desc: "Open to all skill levels and backgrounds" },
              { icon: Award, title: "Excellence", desc: "Premium experience in every interaction" }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <Icon className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-400 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-orange-500/10 backdrop-blur-sm border border-orange-500/30 rounded-3xl p-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-semibold text-sm">Ready to Compete?</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Join Ghana's Fastest
            <br />
            Growing Gaming Community
          </h2>
          
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Whether you're a casual player or aspiring pro, RAID Arena is your 
            gateway to competitive mobile gaming in Africa.
          </p>

          <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-105">
            Get Started Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}