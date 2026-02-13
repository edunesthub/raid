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
    Calendar,
    Clock,
    CheckCircle2,
    Circle
} from "lucide-react";

export default function LeagueMatchesEditor({ leagueId, onBack }) {
    const [matches, setMatches] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [customRounds, setCustomRounds] = useState(["Round 1", "Round 2", "Round 3", "Round 4"]);
    const [batchInputs, setBatchInputs] = useState({});
    const [selectedRound, setSelectedRound] = useState(null);

    useEffect(() => {
        loadMatches();
        loadAvailableTeams();
    }, [leagueId]);

    const loadAvailableTeams = async () => {
        try {
            const q = query(collection(db, `league_seasons/${leagueId}/teams`), orderBy("name", "asc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAvailableTeams(data);
        } catch (error) {
            console.error("Error loading matches:", error);
        }
    };

    const loadMatches = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "league_matches"),
                where("league_id", "==", leagueId),
                orderBy("time", "asc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMatches(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addMatch = () => {
        setMatches([
            ...matches,
            {
                team1: "",
                team2: "",
                score1: null,
                score2: null,
                time: "",
                round: selectedRound || "Round 1",
                completed: false,
                league_id: leagueId
            }
        ]);
    };

    // Helper to ensure time value is compatible with datetime-local input
    const toInputDate = (val) => {
        if (!val || val === 'TBD') return "";
        // If it contains a comma (old format "Sat, 14:00"), return empty to force user to pick new date
        if (val.includes(',')) return "";
        return val;
    };

    const updateMatch = (index, field, value) => {
        const newMatches = [...matches];
        newMatches[index][field] = value;
        setMatches(newMatches);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            for (const match of matches) {
                if (match.id) {
                    await setDoc(doc(db, "league_matches", match.id), match);
                } else {
                    await addDoc(collection(db, "league_matches"), match);
                }
            }
            alert("Matches saved!");
            loadMatches();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const removeMatch = async (id, index) => {
        if (!confirm("Delete match?")) return;
        if (id) await deleteDoc(doc(db, "league_matches", id));
        const newMatches = [...matches];
        newMatches.splice(index, 1);
        setMatches(newMatches);
    };

    const applyRoundSetings = (roundName, timeValue) => {
        if (!timeValue) return;
        const newMatches = matches.map(m => {
            if (m.round === roundName) {
                return { ...m, time: timeValue };
            }
            return m;
        });
        setMatches(newMatches);
        alert(`Applied "${timeValue}" to all ${roundName} matches.`);
    };

    const groupedMatches = matches.reduce((acc, match) => {
        const round = match.round || "Unassigned";
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});

    const allRounds = Array.from(new Set([
        ...customRounds,
        ...matches.map(m => m.round)
    ])).filter(Boolean).sort();

    const addCustomRound = () => {
        const name = prompt("Enter Round Name (e.g. Semi Finals, Week 1):");
        if (name && !customRounds.includes(name)) {
            setCustomRounds([...customRounds, name]);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex border-b border-white/5 pb-4 mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-black uppercase text-[10px] md:text-xs tracking-widest"
                >
                    <ChevronLeft size={18} /> Exit Matches
                </button>
                {selectedRound && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 mx-2">/</span>
                        <button
                            onClick={() => setSelectedRound(null)}
                            className="text-orange-500 font-black uppercase text-[10px] md:text-xs tracking-widest hover:underline"
                        >
                            All Rounds
                        </button>
                        <span className="text-gray-600 mx-2">/</span>
                        <span className="text-white font-black uppercase text-[10px] md:text-xs tracking-widest">{selectedRound}</span>
                    </div>
                )}
            </div>

            {!selectedRound ? (
                /* --- Rounds List View --- */
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-orange-500" size={20} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Select Round to Manage</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={addCustomRound}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[10px] font-black text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 transition-all uppercase"
                            >
                                <Plus size={14} /> Add Round Tag
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {allRounds.map((round) => {
                            const roundMatches = matches.filter(m => m.round === round);
                            const completedCount = roundMatches.filter(m => m.completed).length;
                            const isFullyScheduled = roundMatches.length > 0 && roundMatches.every(m => m.time && m.time !== "TBD");

                            return (
                                <button
                                    key={round}
                                    onClick={() => setSelectedRound(round)}
                                    className="group relative bg-[#0a0a0a] border border-white/5 hover:border-orange-500/50 p-6 rounded-2xl text-left transition-all hover:translate-y-[-2px] shadow-xl"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-orange-500 transition-colors">{round}</span>
                                            {isFullyScheduled && <Clock size={14} className="text-green-500" />}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h4 className="text-2xl font-black text-white">{roundMatches.length}</h4>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">Total Matches</p>
                                            </div>
                                            <div className="text-right">
                                                <h4 className="text-lg font-black text-orange-500">{completedCount}</h4>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">Completed</p>
                                            </div>
                                        </div>
                                        {roundMatches.length > 0 && (
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 transition-all duration-500"
                                                    style={{ width: `${(completedCount / roundMatches.length) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* --- Single Round Management View --- */
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md p-4 -m-4 border-b border-white/5 mb-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedRound(null)}
                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-widest">{selectedRound}</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Managing {groupedMatches[selectedRound]?.length || 0} Matches</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={addMatch}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/5 text-xs font-black uppercase transition-all"
                            >
                                <Plus size={14} /> New Match
                            </button>
                            <button
                                disabled={saving}
                                onClick={saveAll}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-xl shadow-lg border border-orange-400/20 text-xs font-black uppercase disabled:opacity-50 transition-all"
                            >
                                <Save size={16} /> {saving ? "Saving..." : "Save Decisions"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 md:p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Clock className="text-orange-500" size={18} />
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Global Round Timing</h4>
                        </div>
                        <div className="flex flex-col md:flex-row items-end gap-4 max-w-2xl">
                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Set common time for all {selectedRound} matches</label>
                                <input
                                    type="datetime-local"
                                    value={batchInputs[selectedRound] || ""}
                                    onChange={(e) => setBatchInputs({ ...batchInputs, [selectedRound]: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500/50 transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={() => applyRoundSetings(selectedRound, batchInputs[selectedRound])}
                                className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase transition-all whitespace-nowrap disabled:opacity-20"
                                disabled={!batchInputs[selectedRound]}
                            >
                                Update All Matches
                            </button>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="p-4 w-40">Timing</th>
                                    <th className="p-4">Matchup</th>
                                    <th className="p-4 text-center w-32">Scores</th>
                                    <th className="p-4 text-center w-24">Status</th>
                                    <th className="p-4 text-right w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {matches.map((match, idx) => {
                                    if (match.round !== selectedRound) return null;
                                    return (
                                        <tr key={match.id || idx} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="p-4">
                                                <input
                                                    type="datetime-local"
                                                    value={toInputDate(match.time)}
                                                    onChange={(e) => updateMatch(idx, 'time', e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-orange-500/30"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <select
                                                        value={match.team1}
                                                        onChange={(e) => updateMatch(idx, 'team1', e.target.value)}
                                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:border-orange-500/30"
                                                    >
                                                        <option value="">Team 1</option>
                                                        {availableTeams.map(t => (
                                                            <option key={t.id} value={t.name}>{t.name}</option>
                                                        ))}
                                                        <option value="TBD">TBD</option>
                                                    </select>
                                                    <span className="text-[10px] font-black text-gray-600">VS</span>
                                                    <select
                                                        value={match.team2}
                                                        onChange={(e) => updateMatch(idx, 'team2', e.target.value)}
                                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none focus:border-orange-500/30"
                                                    >
                                                        <option value="">Team 2</option>
                                                        {availableTeams.map(t => (
                                                            <option key={t.id} value={t.name}>{t.name}</option>
                                                        ))}
                                                        <option value="TBD">TBD</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={match.score1 ?? ""}
                                                        onChange={(e) => updateMatch(idx, 'score1', e.target.value === "" ? null : parseInt(e.target.value))}
                                                        className="w-12 bg-gray-800 border border-gray-700 rounded-lg py-1.5 text-center text-white font-black text-sm outline-none focus:border-orange-500/30"
                                                    />
                                                    <span className="text-gray-600 font-bold">-</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={match.score2 ?? ""}
                                                        onChange={(e) => updateMatch(idx, 'score2', e.target.value === "" ? null : parseInt(e.target.value))}
                                                        className="w-12 bg-gray-800 border border-gray-700 rounded-lg py-1.5 text-center text-white font-black text-sm outline-none focus:border-orange-500/30"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => updateMatch(idx, 'completed', !match.completed)}
                                                    className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${match.completed ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}
                                                >
                                                    {match.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                                    {match.completed ? "FT" : "Live"}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => removeMatch(match.id, idx)}
                                                    className="p-2 text-red-500/40 hover:text-red-500 transition-colors bg-white/5 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {matches.map((match, idx) => {
                            if (match.round !== selectedRound) return null;
                            return (
                                <div key={match.id || idx} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 space-y-4 shadow-lg">
                                    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                                        <input
                                            type="datetime-local"
                                            value={toInputDate(match.time)}
                                            onChange={(e) => updateMatch(idx, 'time', e.target.value)}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none"
                                        />
                                        <button
                                            onClick={() => removeMatch(match.id, idx)}
                                            className="p-2 text-red-500/40 hover:text-red-500 transition-colors bg-white/5 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={match.team1}
                                                onChange={(e) => updateMatch(idx, 'team1', e.target.value)}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                                            >
                                                <option value="">Team 1</option>
                                                {availableTeams.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                                <option value="TBD">TBD</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={match.score1 ?? ""}
                                                onChange={(e) => updateMatch(idx, 'score1', e.target.value === "" ? null : parseInt(e.target.value))}
                                                className="w-12 bg-gray-800 border border-gray-700 rounded-xl py-2 text-center text-white font-black text-xs outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={match.team2}
                                                onChange={(e) => updateMatch(idx, 'team2', e.target.value)}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                                            >
                                                <option value="">Team 2</option>
                                                {availableTeams.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                                <option value="TBD">TBD</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={match.score2 ?? ""}
                                                onChange={(e) => updateMatch(idx, 'score2', e.target.value === "" ? null : parseInt(e.target.value))}
                                                className="w-12 bg-gray-800 border border-gray-700 rounded-xl py-2 text-center text-white font-black text-xs outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateMatch(idx, 'completed', !match.completed)}
                                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${match.completed ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}
                                    >
                                        {match.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                        {match.completed ? "Full Time" : "Set Live"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {groupedMatches[selectedRound]?.length === 0 && (
                        <div className="p-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
                            <Calendar className="mx-auto text-gray-800" size={48} />
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No matches in this round yet</p>
                            <button
                                onClick={() => {
                                    setMatches([...matches, { team1: "", team2: "", score1: null, score2: null, time: "TBD", round: selectedRound, completed: false, league_id: leagueId }]);
                                }}
                                className="text-orange-500 font-black uppercase text-xs flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                            >
                                <Plus size={16} /> Add First Match to {selectedRound}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
