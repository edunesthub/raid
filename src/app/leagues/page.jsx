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
    ChevronLeft,
    Gamepad2,
    Clock,
    TrendingUp,
    LayoutDashboard,
    ListOrdered,
    History,
    FileText,
    ArrowRight
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// Flag and Badge components remain...

// --- Sub-components ---

const FlagEmoji = ({ countryCode }) => {
    if (!countryCode) return null;
    try {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return <span className="mr-1.5 md:mr-2 text-xs md:text-base">{String.fromCodePoint(...codePoints)}</span>;
    } catch (e) {
        return null;
    }
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
    const [view, setView] = React.useState('list'); // 'list' or 'details'
    const [activeTab, setActiveTab] = React.useState('overview');
    const [activeRound, setActiveRound] = React.useState('Round 1');
    const [leagueList, setLeagueList] = React.useState([]);
    const [leagueInfo, setLeagueInfo] = React.useState(null);
    const [standings, setStandings] = React.useState([]);
    const [matches, setMatches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [detailsLoading, setDetailsLoading] = React.useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'standing', label: 'Standings', icon: <ListOrdered size={18} /> },
        { id: 'matches', label: 'Fixtures & Results', icon: <Calendar size={18} /> },
    ];

    React.useEffect(() => {
        const fetchLeagues = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, "league_seasons"), orderBy("created_at", "desc"));
                const snapshot = await getDocs(q);
                const leagues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLeagueList(leagues);
            } catch (error) {
                console.error("Error fetching leagues:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeagues();
    }, []);

    const handleSelectLeague = async (league) => {
        // Scroll to top when opening league details
        window.scrollTo(0, 0);

        try {
            setDetailsLoading(true);
            setLeagueInfo(league);
            setView('details');
            setActiveTab('overview');

            // Fetch Standings
            const standingsQ = query(collection(db, "league_standings"), where("league_id", "==", league.id), orderBy("pts", "desc"));
            const standingsSnap = await getDocs(standingsQ);
            setStandings(standingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            // Fetch Matches
            const matchesQ = query(collection(db, "league_matches"), where("league_id", "==", league.id), orderBy("time", "asc"));
            const matchesSnap = await getDocs(matchesQ);
            const matchesData = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMatches(matchesData);

            if (matchesData.length > 0) {
                const lastCompletedRound = matchesData.filter(m => m.completed).pop()?.round;
                if (lastCompletedRound) setActiveRound(lastCompletedRound);
                else setActiveRound(matchesData[0].round);
            }
        } catch (error) {
            console.error("Error loading league details:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const allRounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => {
        const nrA = parseInt(a.replace(/\D/g, '')) || 0;
        const nrB = parseInt(b.replace(/\D/g, '')) || 0;
        return nrA - nrB;
    });

    const rounds = allRounds.length > 0 ? allRounds : ["Round 1"];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse">Synchronizing Data</span>
            </div>
        );
    }

    if (view === 'list') {
        return (
            <div className="h-[100dvh] bg-[#050505] flex flex-col overflow-hidden">
                <div className="flex-none pt-24 pb-8 px-6 bg-gradient-to-b from-orange-500/10 to-transparent">
                    <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                        All <span className="text-orange-500">Leagues</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest">Select a league to view standings, fixtures and results</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start content-start scrollbar-hide">
                    {leagueList.map((league) => (
                        <div
                            key={league.id}
                            onClick={() => handleSelectLeague(league)}
                            className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-stretch gap-3 p-0">
                                {/* League Image/Icon */}
                                <div className="relative w-20 md:w-24 flex-shrink-0 overflow-hidden bg-orange-500/10">
                                    {league.league_flyer ? (
                                        <Image
                                            src={league.league_flyer}
                                            alt={league.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Trophy size={36} className="text-orange-500" />
                                        </div>
                                    )}
                                </div>

                                {/* League Info */}
                                <div className="flex-1 min-w-0 py-3 pr-3">
                                    <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">
                                        {league.name}
                                    </h3>
                                    <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
                                        {league.season}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-3 h-3 text-orange-500/60" />
                                            <span className="text-[10px] font-bold text-orange-500">{league.prize_pool}</span>
                                        </div>
                                        <div className="w-px h-3 bg-white/10" />
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-gray-500" />
                                            <span className="text-[9px] font-bold text-gray-400">{league.start_date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow Icon */}
                                <div className="flex items-center pr-3">
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (detailsLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse">Fetching Details</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-24">
            {/* --- Back Button --- */}
            <div className="fixed top-24 left-4 z-[60] md:left-8">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 w-9 h-9 rounded-full text-white hover:bg-white/10 transition-all shadow-xl"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* --- Compact Hero Section --- */}
            <div className="flex-none pt-20 pb-4 md:pb-8 bg-gradient-to-b from-orange-500/10 to-transparent border-b border-white/5 relative z-10">
                <div className="px-4 md:px-8 max-w-full">
                    <div className="flex items-center gap-6 md:gap-16">
                        {/* Compact Poster Left */}
                        <div className="relative w-20 h-28 md:w-40 md:h-52 flex-shrink-0">
                            <div className="absolute inset-0 bg-orange-500/40 blur-2xl rounded-xl" />
                            <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,140,0,0.15)]">
                                <Image
                                    src={leagueInfo?.league_flyer || "/assets/league-banner.png"}
                                    alt="League Banner"
                                    fill
                                    className="object-cover scale-105"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Top Identity Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col justify-center min-w-0 mb-4 md:mb-6">
                                <h1 className="text-xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none truncate">
                                    {leagueInfo?.name || "League"}
                                </h1>
                                <div className="flex items-center gap-1.5 mt-2 text-orange-500 font-black text-[10px] md:text-sm uppercase tracking-widest italic">
                                    <Calendar size={12} />
                                    <span>{leagueInfo?.season || "2026"}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 md:gap-8 border-t border-white/5 pt-3 md:pt-6">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Trophy className="w-3 h-3 text-orange-500" />
                                    <span className="text-[9px] md:text-base uppercase tracking-widest font-black">{leagueInfo?.prize_pool}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Users className="w-3 h-3 text-orange-500" />
                                    <span className="text-[9px] md:text-base uppercase tracking-widest font-black">{leagueInfo?.team_count} Teams</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Navigation Tabs --- */}
            <div className="sticky top-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-50">
                <div className="w-full px-2">
                    <div className="grid grid-cols-4 gap-1 py-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center justify-center px-1 py-2.5 rounded-full transition-all duration-300 font-black text-[9px] uppercase tracking-tighter
                                    ${activeTab === tab.id
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
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
            <div className="md:container-mobile pb-8 pt-4">

                {/* 1. STANDINGS VIEW */}
                {activeTab === 'standing' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
                            <table className="w-full text-left table-fixed">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="px-1 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[20px]">#</th>
                                        <th className="px-1 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter">Team</th>
                                        <th className="px-1 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[20px]">P</th>
                                        <th className="px-0.5 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[15px]">W</th>
                                        <th className="px-0.5 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[15px]">D</th>
                                        <th className="px-0.5 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[15px]">L</th>
                                        <th className="px-0.5 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[15px]">GF</th>
                                        <th className="px-0.5 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[15px]">GA</th>
                                        <th className="px-1 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[20px]">GD</th>
                                        <th className="px-1 py-3 text-[8px] font-black text-orange-500 uppercase tracking-tighter text-center w-[25px]">Pts</th>
                                        <th className="px-1 py-3 text-[8px] font-black text-gray-500 uppercase tracking-tighter text-center w-[90px]">Form</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {standings.map((team, idx) => (
                                        <tr key={team.id || idx} className="active:bg-white/10 transition-colors">
                                            <td className="py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className={`w-0.5 h-3 rounded-full mr-1 ${idx < 4 ? 'bg-orange-500' : standings.length > 6 && idx >= standings.length - 2 ? 'bg-red-500' : 'bg-transparent'}`} />
                                                    <span className={`text-[10px] font-black ${idx < 4 ? 'text-orange-500' : standings.length > 6 && idx >= standings.length - 2 ? 'text-red-400' : 'text-gray-500'}`}>{idx + 1}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 min-w-0 pr-4 align-middle">
                                                <div className="flex items-start gap-1 min-w-0">
                                                    <FlagEmoji countryCode={team.country} />
                                                    <span className="font-bold text-white text-[11px] tracking-tight uppercase whitespace-normal leading-tight">{team.team}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center font-bold text-gray-400 text-[10px]">{team.p}</td>
                                            <td className="py-4 text-center text-[10px] font-semibold text-gray-500">{team.w}</td>
                                            <td className="py-4 text-center text-[10px] font-semibold text-gray-500">{team.d}</td>
                                            <td className="py-4 text-center text-[10px] font-semibold text-gray-500">{team.l}</td>
                                            <td className="py-4 text-center text-[10px] font-semibold text-gray-500">{team.gf || 0}</td>
                                            <td className="py-4 text-center text-[10px] font-semibold text-gray-500">{team.ga || 0}</td>
                                            <td className="py-4 text-center text-[10px] font-bold text-gray-500">{team.gd}</td>
                                            <td className="py-4 text-center font-black text-white text-[10px] bg-orange-500/[0.02]">{team.pts}</td>
                                            <td className="py-4">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    {team.form && team.form.length > 0 ? (
                                                        team.form.map((res, i) => <FormBadge key={i} result={res} />)
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-700">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Seeds 1-4: Championship Qualifier</span>
                            </div>
                            {standings.length > 6 && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Seeds {standings.length - 1}-{standings.length}: Relegation Zone</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. FIXTURES & RESULTS VIEW */}
                {activeTab === 'matches' && (
                    <div className="animate-in fade-in duration-500 space-y-10">
                        {rounds.map((round) => {
                            const roundMatches = matches.filter(m => m.round === round);
                            if (roundMatches.length === 0) return null;

                            return (
                                <div key={round} className="space-y-4">
                                    {/* Round Header */}
                                    <div className="px-5 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">{round}</h3>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>

                                    <div className="bg-[#0a0a0a] border-y border-white/5 divide-y divide-white/[0.03]">
                                        {roundMatches.map(match => {
                                            let displayTime = 'TBD';
                                            let displayDay = 'TBD';

                                            if (match.time && match.time !== 'TBD') {
                                                if (match.time.includes('T') && !match.time.includes(',') && !match.time.includes(' ')) {
                                                    try {
                                                        const date = new Date(match.time);
                                                        if (!isNaN(date.getTime())) {
                                                            displayTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }) + ' GMT';
                                                            displayDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
                                                        }
                                                    } catch (e) { }
                                                } else {
                                                    const parts = match.time.split(',');
                                                    if (parts.length > 1) {
                                                        displayTime = parts[1]?.trim();
                                                        displayDay = parts[0]?.slice(0, 3).toUpperCase();
                                                    }
                                                }
                                            }

                                            return (
                                                <div key={match.id} className="p-4 flex items-center gap-3 active:bg-white/5 transition-all group">
                                                    <div className="w-10 flex flex-col items-center justify-center flex-shrink-0 text-center gap-0.5">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{displayDay}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${match.completed ? 'text-gray-500' : 'text-orange-500'}`}>{match.completed ? 'FT' : displayTime}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 border-l border-white/5 pl-4 space-y-2">
                                                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                            <span className="text-xs font-bold text-gray-300 uppercase truncate tracking-tight group-hover:text-white transition-colors">{match.team1}</span>
                                                            {match.completed && <span className="text-xs font-black text-white bg-white/5 px-2 py-0.5 rounded">{match.score1}</span>}
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                            <span className="text-xs font-bold text-gray-300 uppercase truncate tracking-tight group-hover:text-white transition-colors">{match.team2}</span>
                                                            {match.completed && <span className="text-xs font-black text-white bg-white/5 px-2 py-0.5 rounded">{match.score2}</span>}
                                                        </div>
                                                    </div>
                                                    {!match.completed && (
                                                        <div className="flex-shrink-0 pl-2">
                                                            <div className="w-8 h-8 rounded-full bg-orange-500/5 group-hover:bg-orange-500/10 border border-orange-500/10 group-hover:border-orange-500/30 flex items-center justify-center transition-all">
                                                                <span className="text-[9px] font-black text-orange-500 group-hover:scale-110 transition-transform">VS</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {matches.length === 0 && (
                            <div className="py-24 flex flex-col items-center justify-center text-white/10 gap-4">
                                <Clock size={48} />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">No Schedule Available</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. OVERVIEW VIEW */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-700 space-y-12 pb-12">
                        {/* League Identity & Description */}
                        <div className="px-5 space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                                    THE <span className="text-orange-500">MISSION</span>
                                </h1>
                                <p className="text-sm md:text-lg text-gray-400 leading-relaxed font-medium max-w-3xl">
                                    {leagueInfo?.description || "The premier continental showdown where Africa's talent competes for professional dominance. Join the elite ranks and prove your worth in the ARENA."}
                                </p>
                            </div>

                            {/* Detailed Specs Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Platform</p>
                                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">{leagueInfo?.game || "Mobile"}</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Region</p>
                                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">Africa</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Format</p>
                                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">League</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Status</p>
                                    <p className="text-lg font-black text-green-500 uppercase italic tracking-tighter">In Progress</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Latest Results Summary */}
                            {matches.some(m => m.completed) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-5">
                                        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <History size={14} className="text-orange-500" /> Latest
                                        </h3>
                                        <button onClick={() => setActiveTab('matches')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">All <ChevronRight size={14} /></button>
                                    </div>
                                    <div className="bg-[#0a0a0a] border-y border-white/5 divide-y divide-white/5">
                                        {matches.filter(m => m.completed).slice(0, 3).map(match => (
                                            <div key={match.id} className="p-4 flex items-center gap-4 active:bg-white/[0.02]">
                                                <div className="w-8 text-[10px] font-black text-gray-500 uppercase leading-none">FT</div>
                                                <div className="flex-1 space-y-1.5 border-l border-white/5 pl-4">
                                                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{match.team1}</span><span className="text-xs font-black text-white">{match.score1}</span></div>
                                                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{match.team2}</span><span className="text-xs font-black text-white">{match.score2}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Fixtures Summary */}
                            {matches.some(m => !m.completed) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-5">
                                        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-orange-500" /> Upcoming
                                        </h3>
                                        <button onClick={() => setActiveTab('matches')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">All <ChevronRight size={14} /></button>
                                    </div>
                                    <div className="bg-[#0a0a0a] border-y border-white/5 divide-y divide-white/5">
                                        {matches.filter(m => !m.completed).slice(0, 3).map(match => {
                                            let displayTime = 'TBD';
                                            let displayDay = 'TBD';

                                            if (match.time && match.time !== 'TBD') {
                                                if (match.time.includes('T') && !match.time.includes(',') && !match.time.includes(' ')) {
                                                    try {
                                                        const date = new Date(match.time);
                                                        if (!isNaN(date.getTime())) {
                                                            displayTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }) + ' GMT';
                                                            displayDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
                                                        }
                                                    } catch (e) { }
                                                } else {
                                                    const parts = match.time.split(',');
                                                    if (parts.length > 1) {
                                                        displayTime = parts[1]?.trim();
                                                        displayDay = parts[0]?.slice(0, 3).toUpperCase();
                                                    }
                                                }
                                            }

                                            return (
                                                <div key={match.id} className="p-4 flex items-center gap-4 active:bg-white/[0.02] group transition-colors">
                                                    <div className="w-10 flex flex-col items-center justify-center flex-shrink-0 text-center gap-1">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{displayDay}</span>
                                                        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide leading-none">{displayTime}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 border-l border-white/5 pl-4 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase truncate tracking-tight group-hover:text-white transition-colors">{match.team1}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase truncate tracking-tight group-hover:text-white transition-colors">{match.team2}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 pl-2">
                                                        <div className="w-6 h-6 rounded-full bg-orange-500/5 group-hover:bg-orange-500/10 border border-orange-500/10 group-hover:border-orange-500/30 flex items-center justify-center transition-all">
                                                            <span className="text-[8px] font-black text-orange-500 group-hover:scale-110 transition-transform">VS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Standings Summary */}
                            {standings.length > 0 && (
                                <div className="space-y-4 lg:col-span-2">
                                    <div className="flex items-center justify-between px-5">
                                        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <ListOrdered size={14} className="text-orange-500" /> Standings
                                        </h3>
                                        <button onClick={() => setActiveTab('standing')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">Full <ChevronRight size={14} /></button>
                                    </div>
                                    <div className="bg-[#0a0a0a] border-y border-white/5">
                                        <table className="w-full text-left table-fixed">
                                            <thead>
                                                <tr className="bg-white/5 text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                                                    <th className="px-2 py-3 w-[20px] text-center">#</th>
                                                    <th className="px-2 py-3">Team</th>
                                                    <th className="px-1 py-3 text-center w-[20px]">P</th>
                                                    <th className="px-1 py-3 text-center w-[15px]">W</th>
                                                    <th className="px-1 py-3 text-center w-[15px]">D</th>
                                                    <th className="px-1 py-3 text-center w-[15px]">L</th>
                                                    <th className="px-1 py-3 text-center w-[15px]">GF</th>
                                                    <th className="px-1 py-3 text-center w-[15px]">GA</th>
                                                    <th className="px-1 py-3 text-center w-[20px]">GD</th>
                                                    <th className="px-2 py-3 text-center w-[30px] text-orange-500">Pts</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {standings.slice(0, 4).map((team, idx) => (
                                                    <tr key={team.id} className="active:bg-white/[0.02] transition-colors">
                                                        <td className="text-center">
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-0.5 h-3 rounded-full mr-1 bg-orange-500" />
                                                                <span className="text-[10px] font-black text-orange-500">{idx + 1}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 align-middle pr-4">
                                                            <div className="flex items-start gap-1 min-w-0">
                                                                <FlagEmoji countryCode={team.country} />
                                                                <span className="text-[11px] font-bold text-white uppercase tracking-tight whitespace-normal leading-tight">{team.team}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center text-[10px] font-bold text-gray-400">{team.p}</td>
                                                        <td className="text-center text-[10px] font-semibold text-gray-500">{team.w}</td>
                                                        <td className="text-center text-[10px] font-semibold text-gray-500">{team.d}</td>
                                                        <td className="text-center text-[10px] font-semibold text-gray-500">{team.l}</td>
                                                        <td className="text-center text-[10px] font-semibold text-gray-500">{team.gf || 0}</td>
                                                        <td className="text-center text-[10px] font-semibold text-gray-500">{team.ga || 0}</td>
                                                        <td className="text-center text-[10px] font-bold text-gray-500">{team.gd}</td>
                                                        <td className="text-center text-[10px] font-black text-white bg-orange-500/5">{team.pts}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between px-5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                            <span className="text-[8px] font-bold text-gray-500 uppercase">Qualification Zone</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-gray-600 uppercase italic">Partial Table • Top 4</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
