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
    query,
    where
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
    Users,
    ChevronRight
} from "lucide-react";
import LeagueForm from "./LeagueForm";
import LeagueStandingsEditor from "./LeagueStandingsEditor";
import LeagueMatchesEditor from "./LeagueMatchesEditor";
import LeagueTeamsEditor from "./LeagueTeamsEditor";

export default function LeagueManagement({ hostId }) {
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
            let q;
            if (hostId) {
                q = query(
                    collection(db, "league_seasons"),
                    where("hostId", "==", hostId),
                    orderBy("created_at", "desc")
                );
            } else {
                q = query(collection(db, "league_seasons"), orderBy("created_at", "desc"));
            }
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

            <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search seasons, years, or games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-orange-500/50 transition-all font-medium placeholder:text-gray-600"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {leagues
                    .filter(l => l.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((league) => (
                        <div key={league.id} className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col hover:border-orange-500/30 transition-all duration-300 shadow-2xl">
                            {/* Card Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />

                            <div className="p-6 md:p-8 space-y-6 flex-1 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-tight">{league.name}</h3>
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">{league.season}</p>
                                    </div>
                                    <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/5">
                                        <Trophy className="text-orange-500" size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5"><Trophy size={10} className="text-orange-500" /> Prize Pool</p>
                                        <p className="text-white font-black text-sm tracking-tight">{league.prize_pool}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5"><Users size={10} className="text-orange-500" /> Teams</p>
                                        <p className="text-white font-black text-sm tracking-tight">{league.team_count || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <button
                                        onClick={() => openTeams(league)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                                    >
                                        <span className="flex items-center gap-2.5"><Users size={16} className="text-orange-500" /> Manage Teams</span>
                                        <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all font-bold" />
                                    </button>
                                    <button
                                        onClick={() => openStandings(league)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                                    >
                                        <span className="flex items-center gap-2.5"><ListOrdered size={16} className="text-orange-500" /> Manage Standings</span>
                                        <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all font-bold" />
                                    </button>
                                    <button
                                        onClick={() => openMatches(league)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                                    >
                                        <span className="flex items-center gap-2.5"><Calendar size={16} className="text-orange-500" /> Manage Matches</span>
                                        <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all font-bold" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-4">
                                <button
                                    onClick={() => {
                                        setSelectedLeague(league);
                                        setShowForm(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2.5 py-3 text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.2em]"
                                >
                                    <Edit size={14} className="text-gray-600" /> Edit
                                </button>
                                <div className="w-px h-4 bg-white/10" />
                                <button
                                    onClick={() => handleDelete(league.id)}
                                    className="flex-1 flex items-center justify-center gap-2.5 py-3 text-[10px] font-black text-red-500/40 hover:text-red-500 transition-all uppercase tracking-[0.2em]"
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
                    hostId={hostId}
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
