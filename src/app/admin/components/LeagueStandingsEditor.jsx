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
    Save
} from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

export default function LeagueStandingsEditor({ leagueId, onBack }) {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        loadStandings();
    }, [leagueId]);

    const loadStandings = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "league_standings"),
                where("league_id", "==", leagueId),
                orderBy("pts", "desc")
            );
            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Sort by manual position if any exists, otherwise pts desc
            data.sort((a, b) => {
                const posA = parseInt(a.pos) || 999;
                const posB = parseInt(b.pos) || 999;
                if (posA !== posB) return posA - posB;
                return (parseInt(b.pts) || 0) - (parseInt(a.pts) || 0);
            });

            if (data.length === 0) {
                setStandings([]);
            } else {
                setStandings(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTeam = () => {
        setStandings([
            ...standings,
            {
                team: "New Team",
                tag: "TAG",
                country: "GH",
                p: 0,
                w: 0,
                d: 0,
                l: 0,
                gf: 0,
                ga: 0,
                gd: 0,
                pts: 0,
                pos: standings.length + 1,
                form: [],
                league_id: leagueId
            }
        ]);
    };

    const updateTeam = (index, field, value) => {
        const newStandings = [...standings];

        newStandings[index][field] = value;

        // Auto-calculate points and goal difference
        if (field === 'w' || field === 'd' || field === 'l' || field === 'gf' || field === 'ga') {
            const w = parseInt(newStandings[index].w) || 0;
            const d = parseInt(newStandings[index].d) || 0;
            const gf = parseInt(newStandings[index].gf) || 0;
            const ga = parseInt(newStandings[index].ga) || 0;

            newStandings[index].pts = (w * 3) + (d * 1);
            newStandings[index].p = w + d + (parseInt(newStandings[index].l) || 0);
            newStandings[index].gd = gf - ga;
        }

        setStandings(newStandings);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const team of standings) {
                if (team.id) {
                    await setDoc(doc(db, "league_standings", team.id), team);
                } else {
                    await addDoc(collection(db, "league_standings"), team);
                }
            }
            alert("Standings saved successfully!");
            loadStandings();
        } catch (error) {
            alert("Error saving: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const removeTeam = async (id, index) => {
        if (!confirm("Are you sure?")) return;
        if (id) {
            await deleteDoc(doc(db, "league_standings", id));
        }
        const newStandings = [...standings];
        newStandings.splice(index, 1);
        setStandings(newStandings);
    };

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
                            onClick={addTeam}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 md:px-4 py-2.5 md:py-2 rounded-xl border border-white/5 text-xs md:text-sm font-bold transition-all"
                        >
                            <Plus size={16} /> Add Team
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

                {/* --- Mobile Card View --- */}
                <div className="lg:hidden space-y-3 pb-24">
                    {standings.map((team, idx) => (
                        <div key={team.id || idx} className="bg-gray-900/50 border border-white/5 rounded-xl p-3 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">
                                        {COUNTRIES.find(c => c.code === team.country)?.flag || "🏳️"}
                                    </div>
                                    <input
                                        placeholder="Team Name"
                                        value={team.team}
                                        onChange={(e) => updateTeam(idx, 'team', e.target.value)}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                                    />
                                </div>
                                <button
                                    onClick={() => removeTeam(team.id, idx)}
                                    className="p-2 text-red-500/40 hover:text-red-500 transition-colors bg-white/5 rounded-lg flex-shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Representing</label>
                                    <select
                                        value={team.country}
                                        onChange={(e) => updateTeam(idx, 'country', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-1 py-1.5 text-[10px] text-white font-bold"
                                    >
                                        <option value="">Select Flag</option>
                                        {COUNTRIES.sort((a, b) => {
                                            if (a.code === 'GH' || a.code === 'NG') return -1;
                                            if (b.code === 'GH' || b.code === 'NG') return 1;
                                            return a.name.localeCompare(b.name);
                                        }).map(c => (
                                            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Form (Last 5)</label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            maxLength={5}
                                            placeholder="WWDLW"
                                            value={team.form?.join('') || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase().replace(/[^WDL]/g, '');
                                                updateTeam(idx, 'form', val.split(''));
                                            }}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold tracking-widest uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-9 gap-1 items-end pt-2 border-t border-white/[0.03]">
                                <div>
                                    <label className="block text-center text-[8px] font-black text-orange-500 uppercase mb-1">Pos</label>
                                    <input
                                        type="number"
                                        value={team.pos || ""}
                                        onChange={(e) => updateTeam(idx, 'pos', e.target.value)}
                                        className="w-full bg-gray-800 border border-orange-500/20 rounded-lg py-1 text-center text-orange-500 text-[10px] font-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">P</label>
                                    <input
                                        type="number"
                                        value={team.p}
                                        onChange={(e) => updateTeam(idx, 'p', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">W</label>
                                    <input
                                        type="number"
                                        value={team.w}
                                        onChange={(e) => updateTeam(idx, 'w', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">D</label>
                                    <input
                                        type="number"
                                        value={team.d}
                                        onChange={(e) => updateTeam(idx, 'd', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">L</label>
                                    <input
                                        type="number"
                                        value={team.l}
                                        onChange={(e) => updateTeam(idx, 'l', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">GF</label>
                                    <input
                                        type="number"
                                        value={team.gf}
                                        onChange={(e) => updateTeam(idx, 'gf', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">GA</label>
                                    <input
                                        type="number"
                                        value={team.ga}
                                        onChange={(e) => updateTeam(idx, 'ga', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-center text-[8px] font-black text-gray-500 uppercase mb-1">GD</label>
                                    <input
                                        type="number"
                                        value={team.gd}
                                        onChange={(e) => updateTeam(idx, 'gd', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-[10px]"
                                    />
                                </div>
                                <div className="bg-orange-500/10 rounded-lg border border-orange-500/20 py-1 flex flex-col items-center justify-center">
                                    <label className="block text-center text-[8px] font-black text-orange-500 uppercase">Pts</label>
                                    <input
                                        type="number"
                                        value={team.pts}
                                        onChange={(e) => updateTeam(idx, 'pts', e.target.value)}
                                        className="w-full bg-transparent text-center text-orange-500 font-black text-[10px] focus:outline-none p-0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden lg:block bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="sticky top-0 z-10 bg-[#0a0a0a] text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5 shadow-md">
                                <th className="py-2 text-center w-8 text-orange-500">POS</th>
                                <th className="py-2 pl-3 text-left w-auto min-w-[150px]">Team Details</th>
                                <th className="py-2 text-center w-10">P</th>
                                <th className="py-2 text-center w-10">W</th>
                                <th className="py-2 text-center w-10">D</th>
                                <th className="py-2 text-center w-10">L</th>
                                <th className="py-2 text-center w-10">GF</th>
                                <th className="py-2 text-center w-10">GA</th>
                                <th className="py-2 text-center w-10">GD</th>
                                <th className="py-2 text-center w-12 text-orange-500">Pts</th>
                                <th className="py-2 pr-3 text-right w-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {standings.map((team, idx) => (
                                <tr key={team.id || idx} className="hover:bg-white/[0.01] border-b border-white/[0.02] last:border-0 transition-colors">
                                    <td className="p-0.5">
                                        <input
                                            type="number"
                                            value={team.pos || ""}
                                            onChange={(e) => updateTeam(idx, 'pos', e.target.value)}
                                            className="w-full bg-transparent border-none py-1.5 text-center text-orange-500 font-black text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500/20 rounded-lg"
                                        />
                                    </td>
                                    <td className="p-0.5 pl-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-9 flex-shrink-0">
                                                <select
                                                    value={team.country}
                                                    onChange={(e) => updateTeam(idx, 'country', e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-1 py-1 text-[10px] text-white focus:border-orange-500 outline-none"
                                                >
                                                    <option value="">🏳️</option>
                                                    {COUNTRIES.sort((a, b) => {
                                                        if (a.code === 'GH' || a.code === 'NG') return -1;
                                                        if (b.code === 'GH' || b.code === 'NG') return 1;
                                                        return a.name.localeCompare(b.name);
                                                    }).map(c => (
                                                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                <input
                                                    placeholder="Team"
                                                    value={team.team}
                                                    onChange={(e) => updateTeam(idx, 'team', e.target.value)}
                                                    className="flex-1 bg-transparent border-none px-1 py-1 text-[11px] text-white font-bold truncate focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                                />
                                                <input
                                                    type="text"
                                                    maxLength={5}
                                                    placeholder="FORM"
                                                    value={team.form?.join('') || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toUpperCase().replace(/[^WDL]/g, '');
                                                        updateTeam(idx, 'form', val.split(''));
                                                    }}
                                                    className="w-10 bg-white/5 border border-dashed border-white/10 rounded px-0.5 py-0.5 text-[8px] text-gray-500 font-black tracking-tighter uppercase text-center focus:border-orange-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.p}
                                            onChange={(e) => updateTeam(idx, 'p', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.w}
                                            onChange={(e) => updateTeam(idx, 'w', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.d}
                                            onChange={(e) => updateTeam(idx, 'd', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.l}
                                            onChange={(e) => updateTeam(idx, 'l', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.gf}
                                            onChange={(e) => updateTeam(idx, 'gf', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.ga}
                                            onChange={(e) => updateTeam(idx, 'ga', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.gd}
                                            onChange={(e) => updateTeam(idx, 'gd', e.target.value)}
                                            className="w-full bg-transparent border-none py-1 text-center text-white text-[10px] focus:outline-none focus:ring-1 focus:ring-white/10 rounded"
                                        />
                                    </td>
                                    <td className="p-0.5 text-center">
                                        <input
                                            type="number"
                                            value={team.pts}
                                            onChange={(e) => updateTeam(idx, 'pts', e.target.value)}
                                            className="w-full bg-orange-500/10 border border-orange-500/20 rounded-lg py-1 text-center text-orange-500 font-black text-[11px] focus:outline-none focus:border-orange-500"
                                        />
                                    </td>
                                    <td className="p-0.5 pr-4 text-right">
                                        <button
                                            onClick={() => removeTeam(team.id, idx)}
                                            className="p-1 text-red-500/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {standings.length === 0 && !loading && (
                        <div className="p-20 text-center">
                            <button onClick={addTeam} className="text-orange-500 font-black uppercase text-sm flex items-center gap-2 mx-auto">
                                <Plus /> Add your first team
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
