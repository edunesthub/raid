'use client';

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    serverTimestamp,
    orderBy,
    query
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Trophy,
    History,
    Calendar,
    Settings,
    ListOrdered,
    Users
} from "lucide-react";
import LeagueForm from "./LeagueForm";
import LeagueStandingsEditor from "./LeagueStandingsEditor";
import LeagueMatchesEditor from "./LeagueMatchesEditor";
import LeagueTeamsEditor from "./LeagueTeamsEditor";

export default function LeagueManagement() {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [activeView, setActiveView] = useState("list"); // list, standings, matches, teams
    const [managedLeagueId, setManagedLeagueId] = useState(null);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "league_seasons"), orderBy("created_at", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setLeagues(data);
        } catch (error) {
            console.error("Error loading leagues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will delete the entire league data.")) return;
        try {
            await deleteDoc(doc(db, "league_seasons", id));
            setLeagues(leagues.filter((l) => l.id !== id));
            alert("League deleted!");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    const openStandings = (league) => {
        setManagedLeagueId(league.id);
        setSelectedLeague(league);
        setActiveView("standings");
    };

    const openMatches = (league) => {
        setManagedLeagueId(league.id);
        setSelectedLeague(league);
        setActiveView("matches");
    };

    const openTeams = (league) => {
        setManagedLeagueId(league.id);
        setSelectedLeague(league);
        setActiveView("teams");
    };

    if (activeView === "standings") {
        return (
            <LeagueStandingsEditor
                leagueId={managedLeagueId}
                onBack={() => setActiveView("list")}
            />
        );
    }

    if (activeView === "matches") {
        return (
            <LeagueMatchesEditor
                leagueId={managedLeagueId}
                onBack={() => setActiveView("list")}
            />
        );
    }

    if (activeView === "teams") {
        return (
            <LeagueTeamsEditor
                leagueId={managedLeagueId}
                onBack={() => setActiveView("list")}
            />
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                        <Trophy className="text-orange-500" /> League Management
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage seasons, standings, and match schedules
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedLeague(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all"
                >
                    <Plus size={18} />
                    Create New Season
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search seasons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-orange-500 transition"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leagues
                    .filter(l => l.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((league) => (
                        <div key={league.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{league.name}</h3>
                                        <p className="text-orange-500 text-xs font-black uppercase tracking-widest">{league.season}</p>
                                    </div>
                                    <div className="bg-orange-500/10 p-2 rounded-lg">
                                        <Trophy className="text-orange-500" size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Prize Pool</p>
                                        <p className="text-white font-bold">{league.prize_pool}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Teams</p>
                                        <p className="text-white font-bold">{league.team_count || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => openTeams(league)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><Users size={16} /> Manage Teams</span>
                                        <History size={14} className="opacity-50" />
                                    </button>
                                    <button
                                        onClick={() => openStandings(league)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><ListOrdered size={16} /> Manage Standings</span>
                                        <History size={14} className="opacity-50" />
                                    </button>
                                    <button
                                        onClick={() => openMatches(league)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><Calendar size={16} /> Manage Matches</span>
                                        <History size={14} className="opacity-50" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 md:p-4 bg-gray-800/50 border-t border-gray-800 flex items-center justify-between gap-1 md:gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedLeague(league);
                                        setShowForm(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 md:py-2 text-[10px] md:text-xs font-black text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    <Edit size={14} /> Identity
                                </button>
                                <div className="w-px h-4 bg-gray-700" />
                                <button
                                    onClick={() => handleDelete(league.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 md:py-2 text-[10px] md:text-xs font-black text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}

                {leagues.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <Trophy className="mx-auto text-gray-800" size={48} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No leagues created yet</p>
                    </div>
                )}
            </div>

            {showForm && (
                <LeagueForm
                    league={selectedLeague}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        loadLeagues();
                    }}
                />
            )}
        </div>
    );
}
