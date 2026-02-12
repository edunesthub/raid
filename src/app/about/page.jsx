"use client";

import React from 'react';
import {
  Target, Globe, Shield, Users, Trophy, Zap, Gamepad2
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-orange-500/30">

      {/* Header Section */}
      <div className="relative py-20 px-6 sm:px-12 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
            About <span className="text-orange-500">RAID</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            RAID Arena is an Africa-first esports and competitive gaming platform designed for gamers, teams, and tournament organizers. We are empowering African gamers to compete, connect, and earn through skill-based mobile gaming tournaments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 space-y-24">

        {/* Mission Statement */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-orange-500 mb-2">
              <Target size={24} />
              <h2 className="text-xl font-bold uppercase tracking-wide">Our Goal</h2>
            </div>
            <h3 className="text-3xl font-bold text-white">Revolutionizing African Esports</h3>
            <p className="leading-relaxed text-gray-400 text-lg">
              To revolutionize the esports scene in Africa and build an ecosystem for African esports to compete globally.
            </p>
          </div>
          <div className="relative h-64 md:h-full min-h-[300px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center group">
            <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-5"></div>
            <Globe className="text-orange-500/20 w-32 h-32 md:w-48 md:h-48 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </section>

        {/* Core Values Grid */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Principles</h2>
            <p className="text-gray-500">The foundation of the RAID experience.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Competitive Integrity",
                desc: "Zero tolerance for cheating. Fair matchmaking. Verified results."
              },
              {
                icon: Zap,
                title: "Instant Rewards",
                desc: "Automated prize distribution. Winners get paid immediately."
              },
              {
                icon: Users,
                title: "Community Driven",
                desc: "Built by gamers, for gamers. We listen and evolve with you."
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl hover:border-orange-500/30 transition-colors">
                <item.icon className="text-orange-500 mb-4" size={32} />
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>



        {/* Supported Games */}
        <section>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 text-orange-500 mb-2">
              <Gamepad2 size={24} />
              <h2 className="text-xl font-bold uppercase tracking-wide">Supported Games</h2>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">The Arena Awaits</h3>
            <p className="text-gray-500">Compete in the most popular mobile games.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "COD Mobile", img: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Call_of_Duty_Mobile_Logo.png/220px-Call_of_Duty_Mobile_Logo.png" },
              { name: "Free Fire", img: "https://upload.wikimedia.org/wikipedia/en/a/a6/Free_Fire_logo.jpg" },
              { name: "PUBG Mobile", img: "https://upload.wikimedia.org/wikipedia/en/3/3a/PUBG_Mobile_Logo.jpg" },
              { name: "eFootball Mobile", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/EFootball_logo.svg/1200px-EFootball_logo.svg.png" },
              { name: "FC Mobile", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/EA_Sports_FC_Mobile_logo.svg/1200px-EA_Sports_FC_Mobile_logo.svg.png" },
              { name: "Mobile Legends", img: "https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Mobile_Legends_Bang_Bang_logo.png/220px-Mobile_Legends_Bang_Bang_logo.png" }
            ].map((game, idx) => (
              <div key={idx} className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-all cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors z-10" />
                <img
                  src={game.img}
                  alt={game.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-20">
                  <p className="text-white font-bold text-sm text-center">{game.name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 italic font-medium">...and more</p>
        </section>

        {/* Closing / CTA */}
        <section className="bg-orange-500 text-black rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Ready to Compete?</h2>
            <p className="font-medium opacity-90 text-lg">
              Join thousands of players proving their skills daily on RAID Arena.
            </p>
            <div className="pt-4">
              <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-900 hover:scale-105 transition-all">
                Enter the Arena
              </Link>
            </div>
          </div>

          {/* Decorative background elements */}
          <Trophy className="absolute -bottom-8 -left-8 text-orange-600/30 w-48 h-48 rotate-12" />
          <Globe className="absolute -top-8 -right-8 text-orange-600/30 w-48 h-48 -rotate-12" />
        </section>

      </div >
    </div >
  );
}