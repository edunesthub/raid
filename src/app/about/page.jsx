"use client";

import React from 'react';
import {
  Target, Globe, Shield, Users, Trophy, Zap, Gamepad2
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-[100dvh] bg-black relative overflow-x-clip flex flex-col items-center">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-[1600px] px-6 md:px-10 lg:px-12 pt-[110px] md:pt-[140px] pb-20 space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-bold uppercase tracking-wider">
            <Trophy size={16} />
            <span>The Premier Esports Platform</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-tight">
            ABOUT <span className="text-orange-600">RAID</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Raid Arena is an Africa-first esports ecosystem, empowering a new generation of 
            competitive gamers through skill-based tournaments and seamless distribution.
          </p>
        </section>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="group p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center gap-4 text-orange-500 mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <Target size={32} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight">Our Goal</h2>
            </div>
            <h3 className="text-3xl md:text-5xl font-black italic uppercase text-white mb-6 leading-tight">
              Revolutionizing <span className="text-orange-600">African</span> Esports
            </h3>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium">
              We aim to build a world-class ecosystem where discovery, competition, and 
              commercialization of skills happen seamlessly across the continent.
            </p>
          </section>

          <section className="group p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center gap-4 text-orange-500 mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <Globe size={32} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight">Our Reach</h2>
            </div>
            <h3 className="text-3xl md:text-5xl font-black italic uppercase text-white mb-6 leading-tight">
              Connecting <span className="text-orange-600">Millions</span> Globally
            </h3>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium">
              By leveraging mobile-first technology, we bridge the gap between local talent 
              and global opportunities, creating a truly unified gaming community.
            </p>
          </section>
        </div>

        {/* Core Principles Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase text-white">
              CORE <span className="text-orange-600">PRINCIPLES</span>
            </h2>
            <p className="text-gray-500 text-xl font-medium tracking-wide">The foundation of the RAID experience.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Competitive Integrity",
                desc: "Zero tolerance for cheating. Fair matchmaking and verified results ensure a level playing field."
              },
              {
                icon: Zap,
                title: "Instant Rewards",
                desc: "Automated prize distribution. Winners get paid immediately through our secure distribution system."
              },
              {
                icon: Users,
                title: "Community Driven",
                desc: "Built by gamers, for gamers. We listen and evolve with our community's needs and aspirations."
              },
            ].map((item, idx) => (
              <div key={idx} className="group p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-orange-500/50 hover:bg-white/10 transition-all duration-500">
                <div className="p-4 w-fit rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-8 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                  <item.icon size={32} />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Games */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-orange-500">
              <Gamepad2 size={24} />
              <h2 className="text-xl font-black italic uppercase tracking-wider">The Arena Awaits</h2>
            </div>
            <h3 className="text-4xl md:text-6xl font-black italic uppercase text-white">
              SUPPORTED <span className="text-orange-600">GAMES</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "COD Mobile", img: "https://images.unsplash.com/photo-1627850604058-52e40de1b847?q=80&w=800&auto=format&fit=crop" },
              { name: "Free Fire", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" },
              { name: "PUBG Mobile", img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800&auto=format&fit=crop" },
              { name: "eFootball", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" },
            ].map((game, idx) => (
              <div key={idx} className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all cursor-pointer">
                <img
                  src={game.img}
                  alt={game.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-white font-black italic uppercase text-lg tracking-tight">{game.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing / CTA Section */}
        <section className="relative p-12 md:p-24 rounded-[40px] bg-gradient-to-br from-orange-600 to-orange-400 text-black text-center overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              READY TO <br /> JOIN THE ARENA?
            </h2>
            <p className="text-xl md:text-2xl font-bold opacity-90 max-w-2xl mx-auto italic">
              Experience the future of African esports today. Compete, grow, and crown yourself champion.
            </p>
            <div className="pt-6">
              <Link
                href="/auth/signup"
                className="inline-block bg-black text-white px-12 py-5 rounded-full font-black italic uppercase tracking-widest text-lg hover:bg-zinc-900 hover:scale-105 transition-all shadow-2xl"
              >
                Get Started Now
              </Link>
            </div>
          </div>

          <Trophy className="absolute -bottom-10 -left-10 text-black/10 w-64 h-64 rotate-12" />
          <Globe className="absolute -top-10 -right-10 text-black/10 w-64 h-64 -rotate-12" />
        </section>
      </div>
    </div>
  );
}