'use client';

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Plus,
    Trash2,
    ChevronLeft,
    Save,
    Users,
    Flag,
    AlertCircle
} from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

export default function LeagueTeamsEditor({ leagueId, onBack }) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTeams();
    }, [leagueId]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, `league_seasons/${leagueId}/teams`), orderBy("name", "asc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setTeams(data);
        } catch (err) {
            console.error("Error loading teams:", err);
            setError("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const addTeam = () => {
        setTeams([...teams, {
            name: "",
            tag: "",
            country: "GH",
            id: Date.now().toString() // Temporary ID for new teams
        }]);
    };

    const updateTeam = (idx, field, value) => {
        const newTeams = [...teams];
        newTeams[idx][field] = value;
        setTeams(newTeams);
    };

    const removeTeam = async (id, idx) => {
        if (!confirm("Are you sure? Removing a team here won't automatically remove them from standings or matches, but they won't appear in the selectors.")) return;

        try {
            if (!id.startsWith('17')) { // Check if it's not a temporary ID
                await deleteDoc(doc(db, `league_seasons/${leagueId}/teams`, id));
            }
            const newTeams = [...teams];
            newTeams.splice(idx, 1);
            setTeams(newTeams);
        } catch (err) {
            console.error("Error deleting team:", err);
        }
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const team of teams) {
                if (!team.name.trim()) continue;

                const teamRef = doc(collection(db, `league_seasons/${leagueId}/teams`));
                const finalId = team.id.startsWith('17') ? teamRef.id : team.id;

                await setDoc(doc(db, `league_seasons/${leagueId}/teams`, finalId), {
                    name: team.name,
                    tag: team.tag.toUpperCase(),
                    country: team.country,
                    updated_at: serverTimestamp()
                }, { merge: true });
            }
            alert("Teams saved successfully!");
            loadTeams();
        } catch (err) {
            console.error("Error saving teams:", err);
            alert("Failed to save some teams");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Loading Teams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-[#050505] z-10 py-4 border-b border-white/5 px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic">Manage Teams</h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">League ID: {leagueId}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={addTeam}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl border border-white/10 text-xs md:text-sm font-bold transition-all"
                    >
                        <Plus size={16} /> Add Team
                    </button>
                    <button
                        onClick={saveAll}
                        disabled={saving}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/20 text-xs md:text-sm font-bold disabled:opacity-50 transition-all"
                    >
                        <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mx-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                {teams.map((team, idx) => (
                    <div key={team.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-xl">
                                    {COUNTRIES.find(c => c.code === team.country)?.flag || "🏳️"}
                                </div>
                                <div className="flex-1">
                                    <input
                                        placeholder="Team Name"
                                        value={team.name}
                                        onChange={(e) => updateTeam(idx, 'name', e.target.value)}
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
                                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Team Tag</label>
                                <input
                                    placeholder="TAG"
                                    value={team.tag}
                                    onChange={(e) => updateTeam(idx, 'tag', e.target.value.toUpperCase())}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-[10px] text-gray-400 font-black"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {teams.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-50">
                    <Users className="mx-auto text-gray-800" size={48} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No teams added to this league yet</p>
                    <button
                        onClick={addTeam}
                        className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] border border-orange-500/20 px-6 py-2 rounded-full"
                    >
                        Add Your First Team
                    </button>
                </div>
            )}
        </div>
    );
}
