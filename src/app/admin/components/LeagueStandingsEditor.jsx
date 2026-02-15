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
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            if (data.length === 0) {
                // Initialize with empty teams if needed
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
                gd: 0,
                pts: 0,
                form: [],
                league_id: leagueId
            }
        ]);
    };

    const updateTeam = (index, field, value) => {
        const newStandings = [...standings];

        newStandings[index][field] = value;

        // Auto-calculate points
        if (field === 'w' || field === 'd' || field === 'l') {
            const w = parseInt(newStandings[index].w) || 0;
            const d = parseInt(newStandings[index].d) || 0;
            newStandings[index].pts = (w * 3) + (d * 1);
            newStandings[index].p = w + d + (parseInt(newStandings[index].l) || 0);
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
        <div className="space-y-4 md:space-y-6">
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

            {/* --- Mobile Card View --- */}
            <div className="md:hidden space-y-4 px-2 pb-20">
                {standings.map((team, idx) => (
                    <div key={team.id || idx} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-xl">
                                    {COUNTRIES.find(c => c.code === team.country)?.flag || "🏳️"}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        placeholder="Team Name"
                                        value={team.team}
                                        onChange={(e) => updateTeam(idx, 'team', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white font-bold"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeTeam(team.id, idx)}
                                className="p-2 text-red-500/40 hover:text-red-500 transition-colors bg-white/5 rounded-lg"
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
                                    {[0, 1, 2, 3, 4].map(fIdx => {
                                        const status = team.form?.[fIdx];
                                        return (
                                            <button
                                                key={fIdx}
                                                type="button"
                                                onClick={() => {
                                                    const newForm = [...(team.form || [])];
                                                    if (!status) newForm[fIdx] = 'W';
                                                    else if (status === 'W') newForm[fIdx] = 'D';
                                                    else if (status === 'D') newForm[fIdx] = 'L';
                                                    else delete newForm[fIdx];
                                                    updateTeam(idx, 'form', newForm.filter(f => f));
                                                }}
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border ${status === 'W' ? 'bg-green-500/20 border-green-500/40 text-green-500' :
                                                    status === 'D' ? 'bg-gray-500/20 border-gray-500/40 text-gray-400' :
                                                        status === 'L' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                                                            'bg-gray-800 border-white/5 text-gray-600 hover:border-white/10'
                                                    }`}
                                            >
                                                {status || "-"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 items-end pt-2 border-t border-white/[0.03]">
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
                                <span className="text-orange-500 font-black text-[10px]">{team.pts}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                            <th className="p-3 md:p-4 min-w-[150px] md:min-w-0">Team Details</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20">P</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20">W</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20">D</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20">L</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20">GD</th>
                            <th className="p-3 md:p-4 text-center w-14 md:w-20 text-orange-500">Pts</th>
                            <th className="p-3 md:p-4 text-right w-14 md:w-20">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {standings.map((team, idx) => (
                            <tr key={team.id || idx} className="hover:bg-white/[0.01]">
                                <td className="p-3 md:p-4">
                                    <div className="flex gap-2 md:gap-3">
                                        <div className="w-14 md:w-20">
                                            <select
                                                value={team.country}
                                                onChange={(e) => updateTeam(idx, 'country', e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-1 py-1 text-[10px] md:text-xs text-white"
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
                                        <div className="flex-1 space-y-1">
                                            <input
                                                placeholder="Team Name"
                                                value={team.team}
                                                onChange={(e) => updateTeam(idx, 'team', e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 md:px-3 py-1 text-xs md:text-sm text-white font-bold"
                                            />
                                            <div className="flex gap-1 pt-1">
                                                {[0, 1, 2, 3, 4].map(fIdx => {
                                                    const status = team.form?.[fIdx];
                                                    return (
                                                        <button
                                                            key={fIdx}
                                                            type="button"
                                                            onClick={() => {
                                                                const newForm = [...(team.form || [])];
                                                                if (!status) newForm[fIdx] = 'W';
                                                                else if (status === 'W') newForm[fIdx] = 'D';
                                                                else if (status === 'D') newForm[fIdx] = 'L';
                                                                else delete newForm[fIdx];
                                                                updateTeam(idx, 'form', newForm.filter(f => f));
                                                            }}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all border ${status === 'W' ? 'bg-green-500/20 border-green-500/40 text-green-500' :
                                                                status === 'D' ? 'bg-gray-500/20 border-gray-500/40 text-gray-400' :
                                                                    status === 'L' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                                                                        'bg-gray-800 border-white/5 text-gray-600 hover:border-white/10'
                                                                }`}
                                                        >
                                                            {status || "-"}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 md:p-4">
                                    <input
                                        type="number"
                                        value={team.p}
                                        disabled
                                        className="w-full bg-transparent text-center text-gray-500 font-bold text-xs"
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <input
                                        type="number"
                                        value={team.w}
                                        onChange={(e) => updateTeam(idx, 'w', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-xs"
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <input
                                        type="number"
                                        value={team.d}
                                        onChange={(e) => updateTeam(idx, 'd', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-xs"
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <input
                                        type="number"
                                        value={team.l}
                                        onChange={(e) => updateTeam(idx, 'l', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-xs"
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <input
                                        type="number"
                                        value={team.gd}
                                        onChange={(e) => updateTeam(idx, 'gd', e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1 text-center text-white text-xs"
                                    />
                                </td>
                                <td className="p-3 md:p-4">
                                    <div className="w-full text-center text-orange-500 font-black text-sm md:text-lg">
                                        {team.pts}
                                    </div>
                                </td>
                                <td className="p-3 md:p-4 text-right">
                                    <button
                                        onClick={() => removeTeam(team.id, idx)}
                                        className="p-1 md:p-2 text-red-500/40 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
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
        </div >
    );
}
