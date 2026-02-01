'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, Plus, X, Search, Loader2, CheckCircle2, Trash2, Users, Shuffle } from 'lucide-react';
import { getTeams } from '@/services/teamService';
import { tournamentService } from '@/services/tournamentService';

export default function TournamentTeams({ tournamentId, onClose }) {
    const [enrolledTeams, setEnrolledTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [message, setMessage] = useState("");
    const [tournament, setTournament] = useState(null);
    const [pairingLoading, setPairingLoading] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState("available"); // "available" or "enrolled"

    useEffect(() => {
        if (tournamentId) {
            loadTournamentData();
        }
    }, [tournamentId]);

    const loadTournamentData = async () => {
        try {
            setLoading(true);
            const tournDoc = await getDoc(doc(db, 'tournaments', tournamentId));
            if (tournDoc.exists()) {
                const data = tournDoc.data();
                setTournament({ id: tournDoc.id, ...data });

                // Load enrolled teams details
                const teamIds = data.teams || [];
                const enrolledData = await Promise.all(
                    teamIds.map(async (id) => {
                        const teamDoc = await getDoc(doc(db, 'teams', id));
                        return teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } : null;
                    })
                );
                setEnrolledTeams(enrolledData.filter(Boolean));
            }

            // Load all available teams for selection
            const allTeamsData = await getTeams();
            setAllTeams(allTeamsData);
        } catch (err) {
            console.error('Error loading tournament teams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeam = async (teamId) => {
        try {
            const tournRef = doc(db, 'tournaments', tournamentId);
            await updateDoc(tournRef, {
                teams: arrayUnion(teamId),
                current_participants: increment(1)
            });

            // Auto-generate pairings if tournament is now full
            if (tournament && (enrolledTeams.length + 1) >= (tournament.max_participant || 0)) {
                await tournamentService.generateMemberPairings(tournamentId);
                setMessage("Squad deployed & Pairings auto-generated (Full)!");
            } else {
                setMessage("Team deployed successfully!");
            }

            loadTournamentData(); // Refresh to get updated pairing status if any
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error('Error adding team:', err);
        }
    };

    const handleRemoveTeam = async (teamId) => {
        if (!confirm("Remove this squad from the tournament?")) return;
        try {
            const tournRef = doc(db, 'tournaments', tournamentId);
            await updateDoc(tournRef, {
                teams: arrayRemove(teamId),
                current_participants: increment(-1)
            });

            setEnrolledTeams(prev => prev.filter(t => t.id !== teamId));
            setMessage("Team withdrawn.");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error('Error removing team:', err);
        }
    };

    const handleGeneratePairings = async () => {
        if (!confirm("Generate random member pairings across all enrolled squads? This will overwrite any existing pairings.")) return;

        try {
            setPairingLoading(true);
            await tournamentService.generateMemberPairings(tournamentId);
            setMessage("Random member pairings generated!");
            setTimeout(() => setMessage(""), 3000);
            loadTournamentData();
        } catch (err) {
            console.error('Error generating pairings:', err);
            setMessage("Error: " + err.message);
        } finally {
            setPairingLoading(false);
        }
    };

    const filteredTeams = allTeams.filter(t =>
        t.name.toLowerCase().includes(teamSearch.toLowerCase()) &&
        !enrolledTeams.some(et => et.id === t.id)
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border-t sm:border border-gray-800 flex flex-col animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-white truncate">Squad Deployment</h3>
                            <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 truncate">
                                {tournament?.tournament_name} • {enrolledTeams.length} Squads
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-3 hover:bg-gray-800 rounded-xl sm:rounded-2xl transition-all text-gray-500 hover:text-white"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="flex md:hidden bg-gray-950 border-b border-gray-800 p-2 gap-2">
                    <button
                        onClick={() => setActiveMobileTab("available")}
                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeMobileTab === "available"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-500 bg-gray-900/50"
                            }`}
                    >
                        Available ({filteredTeams.length})
                    </button>
                    <button
                        onClick={() => setActiveMobileTab("enrolled")}
                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeMobileTab === "enrolled"
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                            : "text-gray-500 bg-gray-900/50"
                            }`}
                    >
                        Enrolled ({enrolledTeams.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Deployment List (Selection) */}
                    <div className={`w-full md:w-1/2 p-4 sm:p-6 border-r border-gray-800 flex flex-col bg-black/20 ${activeMobileTab === "available" ? "flex" : "hidden md:flex"}`}>
                        <div className="mb-4 sm:mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 sm:mb-3 block px-1">Available Squads</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="SEARCH SQUADS..."
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500/50 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-12 pr-4 outline-none text-xs sm:text-sm font-bold tracking-tight transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="animate-spin text-blue-500" />
                                </div>
                            ) : filteredTeams.length === 0 ? (
                                <div className="text-center py-10 opacity-30 italic text-sm">No squads available</div>
                            ) : (
                                filteredTeams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/40 border border-gray-800/50 rounded-xl sm:rounded-2xl hover:border-blue-500/30 transition-all group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-800 flex items-center justify-center font-black text-gray-400 overflow-hidden border border-gray-700 shrink-0">
                                                {team.avatarUrl ? <img src={team.avatarUrl} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-200 text-sm truncate">{team.name}</p>
                                                <p className="text-[9px] text-gray-500 uppercase font-black truncate">{(team.members || []).length} Members • {team.manager?.split('@')[0]}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddTeam(team.id)}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg sm:rounded-xl transition-all shrink-0"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Enrolled Squads */}
                    <div className={`w-full md:w-1/2 p-4 sm:p-6 flex flex-col ${activeMobileTab === "enrolled" ? "flex" : "hidden md:flex"}`}>
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4 sm:mb-6 block px-1">Enrolled Payloads ({enrolledTeams.length})</label>

                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 custom-scrollbar">
                            {enrolledTeams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20">
                                    <Shield size={40} className="mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-[10px] sm:text-sm">No squads mobilized</p>
                                </div>
                            ) : (
                                enrolledTeams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl sm:rounded-[1.5rem] shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden shadow-2xl shrink-0">
                                                {team.avatarUrl ? <img src={team.avatarUrl} className="w-full h-full object-cover" /> : <Trophy size={18} className="text-gray-600" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm sm:text-lg text-white tracking-tight truncate">{team.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded border border-green-500/20">Verified</span>
                                                    <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase truncate">ID: {team.id.slice(0, 6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTeam(team.id)}
                                            className="p-2 flex md:opacity-0 md:group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg sm:rounded-xl transition-all shadow-lg shrink-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-8 border-t border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        {enrolledTeams.length >= 2 && (
                            <button
                                onClick={handleGeneratePairings}
                                disabled={pairingLoading}
                                title="Click to manually reshuffle or generate member duels"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] sm:text-xs rounded-xl sm:rounded-2xl transition-all shadow-xl disabled:opacity-50"
                            >
                                {pairingLoading ? <Loader2 size={12} className="animate-spin" /> : <Shuffle size={12} />}
                                {tournament?.memberPairings ? "Shuffle" : "Pair Members"}
                            </button>
                        )}
                        {message && (
                            <p className="text-green-400 text-[9px] font-black uppercase tracking-widest animate-fade-in flex items-center gap-2">
                                <CheckCircle2 size={12} /> {message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={async () => {
                            if (tournament?.participant_type === 'Team' && enrolledTeams.length >= 2 && !tournament?.memberPairings) {
                                try {
                                    setPairingLoading(true);
                                    await tournamentService.generateMemberPairings(tournamentId);
                                } catch (e) {
                                    console.error("Auto-pairing on finalize failed:", e);
                                } finally {
                                    setPairingLoading(false);
                                }
                            }
                            onClose();
                        }}
                        className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase tracking-widest text-[9px] sm:text-xs rounded-xl sm:rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95"
                    >
                        Finalize & Close
                    </button>
                </div>
            </div>
        </div>
    );
}
