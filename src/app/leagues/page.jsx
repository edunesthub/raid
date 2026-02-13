"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Trophy,
    Calendar,
    Users,
    Play,
    Info,
    ChevronRight,
    Gamepad2,
    Clock,
    TrendingUp,
    LayoutDashboard,
    ListOrdered,
    History,
    FileText,
    ArrowRight
} from 'lucide-react';

// --- Mock Data ---
const mockLeagueStandings = [
    { id: 1, team: "Super Strikers", tag: "SS", country: "GH", p: 12, w: 9, d: 2, l: 1, gd: 15, pts: 29, form: ['W', 'W', 'W', 'D', 'W'] },
    { id: 2, team: "Cyber Warriors", tag: "CW", country: "NG", p: 12, w: 8, d: 3, l: 1, gd: 12, pts: 27, form: ['W', 'L', 'W', 'W', 'D'] },
    { id: 3, team: "Elite Gamers", tag: "EG", country: "KE", p: 12, w: 8, d: 2, l: 2, gd: 8, pts: 26, form: ['L', 'W', 'W', 'D', 'W'] },
    { id: 4, team: "Raid Masters", tag: "RM", country: "GH", p: 12, w: 7, d: 3, l: 2, gd: 5, pts: 24, form: ['W', 'D', 'D', 'W', 'L'] },
    { id: 5, team: "Alpha Squad", tag: "AS", country: "NG", p: 12, w: 6, d: 2, l: 4, gd: 0, pts: 20, form: ['L', 'L', 'W', 'W', 'D'] },
    { id: 6, team: "Delta Force", tag: "DF", country: "GH", p: 12, w: 5, d: 3, l: 4, gd: -3, pts: 18, form: ['W', 'L', 'L', 'D', 'L'] },
    { id: 7, team: "Titan Kings", tag: "TK", country: "ZA", p: 12, w: 4, d: 2, l: 6, gd: -7, pts: 14, form: ['L', 'D', 'L', 'L', 'W'] },
    { id: 8, team: "Shadow Ninjas", tag: "SN", country: "NG", p: 12, w: 3, d: 2, l: 7, gd: -12, pts: 11, form: ['L', 'L', 'W', 'L', 'L'] },
];

const mockMatches = [
    { id: 101, team1: "Super Strikers", team2: "Cyber Warriors", score1: 3, score2: 1, time: "Yesterday", round: "Round 12", completed: true },
    { id: 102, team1: "Elite Gamers", team2: "Raid Masters", score1: 1, score2: 1, time: "Yesterday", round: "Round 12", completed: true },
    { id: 103, team1: "Alpha Squad", team2: "Delta Force", score1: 0, score2: 2, time: "Yesterday", round: "Round 12", completed: true },
    { id: 104, team1: "Titan Kings", team2: "Shadow Ninjas", score1: 1, score2: 0, time: "Yesterday", round: "Round 12", completed: true },
    { id: 201, team1: "Super Strikers", team2: "Elite Gamers", score1: null, score2: null, time: "Sat, 14:00", round: "Round 13", completed: false },
    { id: 202, team1: "Cyber Warriors", team2: "Raid Masters", score1: null, score2: null, time: "Sat, 16:00", round: "Round 13", completed: false },
    { id: 203, team1: "Alpha Squad", team2: "Titan Kings", score1: null, score2: null, time: "Sun, 12:00", round: "Round 13", completed: false },
    { id: 204, team1: "Delta Force", team2: "Shadow Ninjas", score1: null, score2: null, time: "Sun, 18:00", round: "Round 13", completed: false },
];

// --- Sub-components ---

const FlagEmoji = ({ countryCode }) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return <span className="mr-1.5 md:mr-2 text-xs md:text-base">{String.fromCodePoint(...codePoints)}</span>;
};

const FormBadge = ({ result }) => {
    const colors = {
        'W': 'bg-green-500/20 text-green-500 border-green-500/30',
        'L': 'bg-red-500/20 text-red-500 border-red-500/30',
        'D': 'bg-orange-500/20 text-orange-500 border-orange-500/30'
    };
    return (
        <span className={`w-4 h-4 md:w-6 md:h-6 rounded flex items-center justify-center text-[8px] md:text-xs font-bold border ${colors[result]}`}>
            {result}
        </span>
    );
};

export default function LeaguesPage() {
    const [activeTab, setActiveTab] = useState('standing');
    const [activeRound, setActiveRound] = useState('Round 13');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'standing', label: 'Standings', icon: <ListOrdered size={18} /> },
        { id: 'fixtures', label: 'Fixtures', icon: <Calendar size={18} /> },
        { id: 'results', label: 'Results', icon: <History size={18} /> },
    ];

    const rounds = ["Round 11", "Round 12", "Round 13", "Round 14"];

    return (
        <div className="min-h-screen bg-[#050505] overflow-x-hidden">
            {/* --- Compact Hero Section --- */}
            <div className="relative pt-4 md:pt-10 pb-6 md:pb-10 bg-gradient-to-b from-orange-500/10 to-transparent border-b border-white/5">
                <div className="container-mobile px-4">
                    <div className="flex items-center gap-4 md:gap-12">
                        {/* Compact Poster Left */}
                        <div className="relative w-24 h-32 md:w-44 md:h-60 flex-shrink-0">
                            <div className="absolute inset-0 bg-orange-500/30 blur-2xl rounded-xl" />
                            <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                <Image
                                    src="/assets/league-banner.png"
                                    alt="League Banner"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Titles Right */}
                        <div className="flex flex-col gap-1 md:gap-4 flex-1 min-w-0 font-black">
                            <div>
                                <span className="text-[10px] md:text-xs text-orange-500 uppercase tracking-[0.3em] block mb-1">
                                    Pro Series • S1
                                </span>
                                <h1 className="text-xl md:text-6xl text-white leading-[1.1] uppercase tracking-tighter">
                                    Elite African <br className="hidden md:block" />
                                    <span className="text-orange-500">Pro Series</span>
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:gap-8 mt-1">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Trophy className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-[10px] md:text-sm uppercase tracking-widest">₵50K Pool</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Users className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-[10px] md:text-sm uppercase tracking-widest">32 Teams</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Navigation Tabs --- */}
            <div className="sticky top-16 z-40 bg-[#050505] border-b border-white/5">
                <div className="md:container-mobile px-2 md:px-0">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-full whitespace-nowrap transition-all duration-300 font-black text-[11px] md:text-sm uppercase tracking-wider
                                    ${activeTab === tab.id
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white/5 text-gray-500 hover:text-white'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="md:container-mobile pt-6 md:pt-0 md:mt-8">

                {/* 1. STANDING VIEW */}
                {activeTab === 'standing' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="bg-[#0a0a0a] md:bg-gray-900/40 md:border md:border-white/5 md:rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left table-fixed">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-3 md:px-4 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[45px]">#</th>
                                            <th className="px-1 md:px-4 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest flex-1">Team</th>
                                            <th className="px-1 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[35px] md:w-16">P</th>
                                            <th className="px-1 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[50px] md:w-20">W-L</th>
                                            <th className="px-1 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[35px] md:w-16 hidden md:table-cell">GD</th>
                                            <th className="px-1 py-4 md:py-5 text-[10px] font-black text-orange-500 uppercase tracking-widest text-center w-[45px] md:w-20">Pts</th>
                                            <th className="px-3 md:px-4 py-4 md:py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-[100px] md:w-[160px]">Form</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {mockLeagueStandings.map((team, idx) => (
                                            <tr
                                                key={team.id}
                                                className={`
                                                    active:bg-white/10 transition-colors group
                                                    ${idx < 4 ? 'bg-orange-500/[0.04]' : ''}
                                                `}
                                            >
                                                <td className="px-3 md:px-4 py-4 text-center">
                                                    <span className={`
                                                        inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-[11px]
                                                        ${idx < 3 ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(255,140,0,0.3)]' : 'bg-white/10 text-gray-500'}
                                                    `}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="px-1 md:px-4 py-4 overflow-hidden">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center truncate">
                                                                <FlagEmoji countryCode={team.country} />
                                                                <span className="font-bold text-white text-[13px] md:text-base truncate">
                                                                    {team.team}
                                                                </span>
                                                            </div>
                                                            <span className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate md:hidden">DIV 1 PRO</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-1 py-4 text-center font-bold text-gray-400 text-xs md:text-sm">{team.p}</td>
                                                <td className="px-1 py-4 text-center text-[11px] md:text-sm font-semibold text-gray-500">
                                                    {team.w}-{team.l}
                                                </td>
                                                <td className="px-1 py-4 text-center hidden md:table-cell font-bold text-gray-500 text-sm">{team.gd}</td>
                                                <td className="px-1 py-4 text-center font-black text-white text-sm md:text-lg bg-orange-500/[0.02]">{team.pts}</td>
                                                <td className="px-3 md:px-4 py-4">
                                                    <div className="flex items-center justify-center gap-0.5 md:gap-1">
                                                        {team.form.map((res, i) => <FormBadge key={i} result={res} />)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Legend section */}
                        <div className="p-4 md:px-0 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 glow-orange" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seeds 1-4: Championship Bracket</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seeds 5-8: Consolation Bracket</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. FIXTURES & RESULTS VIEW */}
                {(activeTab === 'fixtures' || activeTab === 'results') && (
                    <div className="animate-in fade-in duration-500 px-4 md:px-0 mt-4 md:mt-0">
                        {/* Round switcher */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 no-scrollbar">
                            {rounds.map(round => (
                                <button
                                    key={round}
                                    onClick={() => setActiveRound(round)}
                                    className={`
                                        px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                                        ${activeRound === round
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white/5 text-gray-500 active:bg-white/10'
                                        }
                                    `}
                                >
                                    {round}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {mockMatches
                                .filter(m => m.round === activeRound && (activeTab === 'fixtures' ? !m.completed : m.completed))
                                .map(match => (
                                    <div key={match.id} className="bg-white/5 md:bg-gray-900/40 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 active:bg-white/10 transition-all group">
                                        <div className="flex items-center justify-between mb-4 md:mb-6">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${match.completed ? 'bg-gray-700/50 text-gray-400' : 'bg-green-500 text-white'}`}>
                                                {match.completed ? 'Result' : 'Fixture'}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                {match.time}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/5 flex items-center justify-center font-black text-white text-sm md:text-xl border border-white/10">
                                                    {match.team1.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-bold text-white text-[11px] md:text-sm text-center truncate w-full">{match.team1}</span>
                                            </div>

                                            <div className="flex flex-col items-center justify-center px-4">
                                                {match.completed ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl md:text-4xl font-black text-white">{match.score1}</span>
                                                        <span className="text-gray-700 font-black">-</span>
                                                        <span className="text-2xl md:text-4xl font-black text-white">{match.score2}</span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-md">
                                                        <span className="text-[10px] font-black text-orange-500 italic">VS</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/5 flex items-center justify-center font-black text-white text-sm md:text-xl border border-white/10">
                                                    {match.team2.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-bold text-white text-[11px] md:text-sm text-center truncate w-full">{match.team2}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {mockMatches.filter(m => m.round === activeRound && (activeTab === 'fixtures' ? !m.completed : m.completed)).length === 0 && (
                                <div className="md:col-span-2 py-20 flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                                    <Clock size={40} />
                                    <span className="text-xs font-black uppercase tracking-widest">No {activeTab} for this round</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. OVERVIEW VIEW (LiveScore Style) */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-700 px-4 md:px-0 space-y-8 pb-0">

                        {/* League Identity Section (Moved to Top) */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 italic">League Identity</h4>
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Trophy className="text-orange-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tighter">Elite African Series</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Season 1 • 2026</p>
                                    </div>
                                </div>
                                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                                    The premier continental showdown where Africa's finest esports talent competes for professional dominance and a <span className="text-white font-bold">₵50,000</span> prize pool.
                                </p>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Latest Results Summary */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <History size={14} className="text-orange-500" /> Latest Results
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('results')}
                                        className="text-[10px] font-black text-orange-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
                                    >
                                        See All <ChevronRight size={14} />
                                    </button>
                                </div>
                                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                                    {mockMatches.filter(m => m.completed).slice(0, 3).map(match => (
                                        <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="w-12 text-[10px] font-black text-gray-500 uppercase leading-none">
                                                FT <br />
                                                <span className="text-[8px] opacity-60 font-medium">Feb 12</span>
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs md:text-sm font-bold text-white">{match.team1}</span>
                                                    <span className="text-xs md:text-sm font-black text-white">{match.score1}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs md:text-sm font-bold text-white">{match.team2}</span>
                                                    <span className="text-xs md:text-sm font-black text-white">{match.score2}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Fixtures Summary */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} className="text-orange-500" /> Upcoming Fixtures
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('fixtures')}
                                        className="text-[10px] font-black text-orange-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
                                    >
                                        See All <ChevronRight size={14} />
                                    </button>
                                </div>
                                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                                    {mockMatches.filter(m => !m.completed).slice(0, 3).map(match => (
                                        <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="w-12 text-[10px] font-black text-orange-500 leading-none">
                                                {match.time.split(',')[1] || 'TBD'} <br />
                                                <span className="text-[8px] text-gray-500 font-medium uppercase">{match.time.split(',')[0]}</span>
                                            </div>
                                            <div className="flex-1 space-y-1.5 border-l border-white/5 pl-4 ml-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs md:text-sm font-bold text-white/90">{match.team1}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs md:text-sm font-bold text-white/90">{match.team2}</span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black text-gray-600 bg-white/5 px-2 py-1 rounded">
                                                VS
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Standings Summary */}
                            <div className="space-y-4 lg:col-span-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <ListOrdered size={14} className="text-orange-500" /> League Standings
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('standing')}
                                        className="text-[10px] font-black text-orange-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest"
                                    >
                                        View Table <ChevronRight size={14} />
                                    </button>
                                </div>
                                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                <th className="px-4 py-3 w-12 text-center">#</th>
                                                <th className="px-2 py-3">Team</th>
                                                <th className="px-2 py-3 text-center w-12">P</th>
                                                <th className="px-2 py-3 text-center w-12">GD</th>
                                                <th className="px-4 py-3 text-center w-16 text-orange-500">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mockLeagueStandings.slice(0, 5).map((team, idx) => (
                                                <tr key={team.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`w-1 h-4 rounded-full mr-2 ${idx < 3 ? 'bg-orange-500' : 'bg-transparent'}`} />
                                                            <span className={`text-[11px] md:text-sm font-black ${idx < 3 ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FlagEmoji countryCode={team.country} />
                                                            <span className="text-xs md:text-sm font-bold text-white truncate">{team.team}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3 text-center text-[11px] md:text-sm font-bold text-gray-400">{team.p}</td>
                                                    <td className="px-2 py-3 text-center text-[11px] md:text-sm font-bold text-gray-500">{team.gd}</td>
                                                    <td className="px-4 py-3 text-center text-[11px] md:text-sm font-black text-white bg-orange-500/5">{team.pts}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center gap-4 px-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Qualification Zone</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
