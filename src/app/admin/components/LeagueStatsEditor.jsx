'use client';

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    where,
    deleteDoc,
    addDoc,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    ChevronLeft,
    Plus,
    Trash2,
    Save,
    User,
    Trophy,
    Star
} from "lucide-react";

export default function LeagueStatsEditor({ leagueId, onBack }) {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [leagueId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load Teams for the dropdown
            const teamsQuery = query(
                collection(db, "league_standings"),
                where("league_id", "==", leagueId)
            );
            const teamsSnapshot = await getDocs(teamsQuery);
            const teamsData = teamsSnapshot.docs.map(d => ({
                id: d.id,
                name: d.data().team
            })).sort((a, b) => a.name.localeCompare(b.name));
            setTeams(teamsData);

            // Load Players Stats
            const q = query(
                collection(db, "league_player_stats"),
                where("league_id", "==", leagueId),
                orderBy("goals", "desc")
            );
            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            setPlayers(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = () => {
        setPlayers([
            ...players,
            {
                name: "New Player",
                team: teams[0]?.name || "",
                goals: 0,
                assists: 0,
                league_id: leagueId
            }
        ]);
    };

    const updatePlayer = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = field === 'name' || field === 'team' ? value : (parseInt(value) || 0);
        setPlayers(newPlayers);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const player of players) {
                if (player.id) {
                    await setDoc(doc(db, "league_player_stats", player.id), player);
                } else {
                    await addDoc(collection(db, "league_player_stats"), player);
                }
            }
            alert("Stats saved successfully!");
            loadData();
        } catch (error) {
            alert("Error saving: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const removePlayer = async (id, index) => {
        if (!confirm("Are you sure?")) return;
        if (id) {
            await deleteDoc(doc(db, "league_player_stats", id));
        }
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Loading Player Stats...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] -mt-4">
            <div className="flex-shrink-0 sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-black uppercase text-[10px] md:text-xs tracking-widest w-fit"
                    >
                        <ChevronLeft size={18} /> Back to Seasons
                    </button>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <button
                            onClick={addPlayer}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 md:px-4 py-2.5 md:py-2 rounded-xl border border-white/5 text-xs md:text-sm font-bold transition-all"
                        >
                            <Plus size={16} /> Add Player
                        </button>
                        <button
                            disabled={saving}
                            onClick={saveAll}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 md:px-6 py-2.5 md:py-2 rounded-xl shadow-lg shadow-orange-600/20 text-xs md:text-sm font-bold disabled:opacity-50 transition-all"
                        >
                            <Save size={16} /> {saving ? "Saving..." : "Save All"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-1 md:p-2">
                {/* Mobile View */}
                <div className="lg:hidden space-y-3 pb-24 px-2">
                    {players.map((player, idx) => (
                        <div key={player.id || idx} className="bg-gray-900/50 border border-white/5 rounded-xl p-3 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                                        <User size={20} className="text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            placeholder="Player Name"
                                            value={player.name}
                                            onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white font-bold"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removePlayer(player.id, idx)}
                                    className="p-2 text-red-500/40 hover:text-red-500 transition-colors bg-white/5 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Team</label>
                                    <select
                                        value={player.team}
                                        onChange={(e) => updatePlayer(idx, 'team', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-[10px] text-white font-bold"
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-center text-[8px] font-black text-orange-500 uppercase mb-1 flex items-center justify-center gap-1">
                                            <Trophy size={8} /> Goals
                                        </label>
                                        <input
                                            type="number"
                                            value={player.goals}
                                            onChange={(e) => updatePlayer(idx, 'goals', e.target.value)}
                                            className="w-full bg-gray-800 border border-orange-500/20 rounded-lg py-1.5 text-center text-white text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-center text-[8px] font-black text-blue-500 uppercase mb-1 flex items-center justify-center gap-1">
                                            <Star size={8} /> Assists
                                        </label>
                                        <input
                                            type="number"
                                            value={player.assists}
                                            onChange={(e) => updatePlayer(idx, 'assists', e.target.value)}
                                            className="w-full bg-gray-800 border border-blue-500/20 rounded-lg py-1.5 text-center text-white text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="sticky top-0 z-10 bg-[#0a0a0a] text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5 shadow-md">
                                <th className="py-3 pl-6 text-left w-auto min-w-[200px]">Player Name</th>
                                <th className="py-3 px-4 text-left w-[200px]">Team</th>
                                <th className="py-3 text-center w-24 text-orange-500">Goals</th>
                                <th className="py-3 text-center w-24 text-blue-500">Assists</th>
                                <th className="py-3 pr-6 text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {players.map((player, idx) => (
                                <tr key={player.id || idx} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="py-3 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                                                <User size={16} />
                                            </div>
                                            <input
                                                placeholder="Player Name"
                                                value={player.name}
                                                onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                                                className="bg-transparent border-none p-0 text-sm text-white font-bold focus:ring-0 w-full"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <select
                                            value={player.team}
                                            onChange={(e) => updatePlayer(idx, 'team', e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500/50 w-full"
                                        >
                                            <option value="">Select Team</option>
                                            {teams.map(t => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 text-center">
                                        <input
                                            type="number"
                                            value={player.goals}
                                            onChange={(e) => updatePlayer(idx, 'goals', e.target.value)}
                                            className="w-16 bg-orange-500/10 border border-orange-500/20 rounded-lg py-1 text-center text-orange-500 font-black text-sm focus:outline-none focus:border-orange-500 mx-auto"
                                        />
                                    </td>
                                    <td className="py-3 text-center">
                                        <input
                                            type="number"
                                            value={player.assists}
                                            onChange={(e) => updatePlayer(idx, 'assists', e.target.value)}
                                            className="w-16 bg-blue-500/10 border border-blue-500/20 rounded-lg py-1 text-center text-blue-500 font-black text-sm focus:outline-none focus:border-blue-500 mx-auto"
                                        />
                                    </td>
                                    <td className="py-3 pr-6 text-right">
                                        <button
                                            onClick={() => removePlayer(player.id, idx)}
                                            className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {players.length === 0 && !loading && (
                        <div className="p-20 text-center">
                            <button onClick={addPlayer} className="text-orange-500 font-black uppercase text-sm flex items-center gap-2 mx-auto">
                                <Plus /> Add your first player
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
