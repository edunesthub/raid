"use client";

import React from 'react';
import { Trophy, Info, Gamepad2, ChevronRight, Play } from 'lucide-react';

const mockLeagueData = [
    { id: 1, team: "Super Strikers", country: "GH", p: 12, w: 9, d: 0, l: 3, gd: 15, gf: 32, ga: 17, pts: 27 },
    { id: 2, team: "Cyber Warriors", country: "NG", p: 12, w: 8, d: 0, l: 4, gd: 12, gf: 28, ga: 16, pts: 24 },
    { id: 3, team: "Elite Gamers", country: "KE", p: 12, w: 8, d: 0, l: 4, gd: 8, gf: 25, ga: 17, pts: 24 },
    { id: 4, team: "Raid Masters", country: "GH", p: 12, w: 7, d: 0, l: 5, gd: 5, gf: 22, ga: 17, pts: 21 },
    { id: 5, team: "Alpha Squad", country: "NG", p: 12, w: 6, d: 0, l: 6, gd: 0, gf: 19, ga: 19, pts: 18 },
    { id: 6, team: "Delta Force", country: "GH", p: 12, w: 5, d: 0, l: 7, gd: -3, gf: 16, ga: 19, pts: 15 },
    { id: 7, team: "Titan Kings", country: "ZA", p: 12, w: 4, d: 0, l: 8, gd: -7, gf: 14, ga: 21, pts: 12 },
    { id: 8, team: "Shadow Ninjas", country: "NG", p: 12, w: 3, d: 0, l: 9, gd: -12, gf: 11, ga: 23, pts: 9 },
];

const FlagEmoji = ({ countryCode }) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return <span className="mr-2 text-sm">{String.fromCodePoint(...codePoints)}</span>;
};

const LeagueSection = ({ compact = false }) => {
    return (
        <section className={`${compact ? 'mb-0' : 'mb-12'}`}>
            {!compact && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Trophy className="w-6 h-6 mr-2 text-orange-500" />
                        Pro League Standings
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700 font-mono">Season 1</span>
                    </div>
                </div>
            )}

            {/* League Table Card */}
            <div className={`bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative ${compact ? 'border-none bg-transparent shadow-none' : ''}`}>
                {!compact && (
                    <>
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-white">
                            <Trophy className="w-32 h-32" />
                        </div>

                        <div className="p-4 flex items-center border-b border-gray-800 bg-gray-800/20">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                                <Gamepad2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">Elite African League</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Division One</p>
                            </div>
                        </div>
                    </>
                )}

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`${compact ? 'bg-transparent' : 'bg-gray-800/50'} border-b border-gray-800`}>
                                <th className="px-3 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider">#</th>
                                <th className="px-3 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Team</th>
                                <th className="px-1 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">P</th>
                                <th className="px-1 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">W</th>
                                <th className="px-1 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">D</th>
                                <th className="px-1 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">L</th>
                                <th className="px-1 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-wider text-center">GD</th>
                                <th className="px-3 py-3 font-bold text-orange-500 text-[10px] uppercase tracking-wider text-center">Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {mockLeagueData.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`
                                        hover:bg-white/5 transition-colors group
                                        ${index < 4 && !compact ? 'bg-orange-500/5' : ''}
                                    `}
                                >
                                    <td className="px-3 py-3 text-xs">
                                        <span className={`
                                            inline-flex items-center justify-center w-5 h-5 rounded-md font-bold
                                            ${index < 4 ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800/50 text-gray-500'}
                                        `}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 overflow-hidden">
                                        <div className="flex items-center max-w-[140px]">
                                            <FlagEmoji countryCode={item.country} />
                                            <span className="font-semibold text-gray-100 group-hover:text-white transition-colors text-xs truncate">
                                                {item.team}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-1 py-3 text-center text-xs text-gray-400">{item.p}</td>
                                    <td className="px-1 py-3 text-center text-green-500 font-medium text-xs">{item.w}</td>
                                    <td className="px-1 py-3 text-center text-orange-500 font-medium text-xs">{item.d}</td>
                                    <td className="px-1 py-3 text-center text-red-500 font-medium text-xs">{item.l}</td>
                                    <td className={`px-1 py-3 text-center font-medium text-xs ${item.gd >= 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {item.gd > 0 ? `+${item.gd}` : item.gd}
                                    </td>
                                    <td className="px-3 py-3 text-center font-bold text-white text-xs">
                                        {item.pts}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer info matching notes */}
                {!compact && (
                    <div className="p-6 bg-black/40 border-t border-gray-800 space-y-4 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-orange-500 uppercase flex items-center">
                                    <Play className="w-4 h-4 mr-2" />
                                    Playoffs Progression
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex items-start">
                                        <span className="w-5 h-5 bg-orange-500/20 text-orange-500 rounded flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 shrink-0">1-4</span>
                                        <span>Qualified directly for <b className="text-gray-200">Quarter Finals</b></span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-5 h-5 bg-gray-700 text-gray-300 rounded flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 shrink-0">5-12</span>
                                        <span>Advance to <b className="text-gray-200">Play-in Phase</b></span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-3 text-white">
                                <h4 className="text-sm font-bold text-gray-300 uppercase flex items-center">
                                    <Info className="w-4 h-4 mr-2 text-blue-400" />
                                    Matchup Logic
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Play-in Phase: <span className="text-gray-300">5th vs 12th</span> • <span className="text-gray-300">6th vs 11th</span> • <span className="text-gray-300">7th vs 10th</span> • <span className="text-gray-300">8th vs 9th</span>.
                                    Knockout rounds proceed until the Grand Final, which is a <b className="text-orange-500">Best of 5 (BO5)</b> series.
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-600 text-center pt-2">
                            * All fixtures are scheduled from Match Day 1 to 12. Ranking is randomized at league start.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LeagueSection;
