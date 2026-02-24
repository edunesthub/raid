'use client';

import { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    orderBy,
    getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Users,
    Trophy,
    Award,
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Clock,
    ShieldCheck,
    CreditCard,
    ChevronDown,
    ChevronUp
} from "lucide-react";

export default function HostManagement() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHost, setSelectedHost] = useState(null);
    const [hostStats, setHostStats] = useState({}); // {hostId: {tournaments: 0, leagues: 0}}

    useEffect(() => {
        loadHosts();
    }, []);

    const loadHosts = async () => {
        try {
            setLoading(true);
            const hostsQuery = query(
                collection(db, "users"),
                where("role", "==", "host"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(hostsQuery);
            const hostsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHosts(hostsData);

            // Fetch stats for each host
            const stats = {};
            for (const host of hostsData) {
                const tournamentsQuery = query(
                    collection(db, "tournaments"),
                    where("hostId", "==", host.id)
                );
                const leaguesQuery = query(
                    collection(db, "league_seasons"),
                    where("hostId", "==", host.id)
                );

                const [tournSnap, leagueSnap] = await Promise.all([
                    getDocs(tournamentsQuery),
                    getDocs(leaguesQuery)
                ]);

                stats[host.id] = {
                    tournaments: tournSnap.size,
                    leagues: leagueSnap.size,
                    tournamentData: tournSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                    leagueData: leagueSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                };
            }
            setHostStats(stats);
        } catch (error) {
            console.error("Error loading hosts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (hostId, newStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this host?`)) return;

        try {
            await updateDoc(doc(db, "users", hostId), {
                status: newStatus,
                updatedAt: new Date()
            });
            setHosts(hosts.map(h => h.id === hostId ? { ...h, status: newStatus } : h));
            alert(`Host ${newStatus} successfully!`);
        } catch (error) {
            console.error("Error updating host status:", error);
            alert("Failed to update status");
        }
    };

    const filteredHosts = hosts.filter(h =>
        (h.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.hostName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Host Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Review and approve tournament organizers</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, organization or email..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredHosts.map(host => (
                        <div key={host.id} className="bg-gray-900/50 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6 transition-all hover:border-orange-500/20 shadow-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-2xl italic border border-orange-500/20 shadow-xl shadow-orange-500/5">
                                        {host.hostName?.[0] || host.fullName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic truncate uppercase tracking-tighter">
                                            {host.hostName}
                                        </h3>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{host.fullName}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5">
                                                {host.country}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${host.status === 'approved'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : host.status === 'rejected'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {host.status?.replace('_', ' ') || 'Pending Approval'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white italic">{hostStats[host.id]?.tournaments || 0}</div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tournaments</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/5" />
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white italic">{hostStats[host.id]?.leagues || 0}</div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Leagues</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {host.status === 'pending_approval' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(host.id, 'approved')}
                                                className="p-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl border border-green-500/20 transition-all active:scale-95"
                                                title="Approve Host"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(host.id, 'rejected')}
                                                className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all active:scale-95"
                                                title="Reject Host"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedHost(selectedHost === host.id ? null : host.id)}
                                        className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${selectedHost === host.id
                                                ? 'bg-white text-black'
                                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                                            }`}
                                    >
                                        {selectedHost === host.id ? 'Close Details' : 'View Activity'}
                                        {selectedHost === host.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedHost === host.id && (
                                <div className="pt-8 border-t border-white/5 mt-8 animate-fade-in space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Contact Information</p>
                                            <div className="space-y-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Email Address</span>
                                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{host.email}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Phone Number</span>
                                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{host.phoneNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 col-span-1 lg:col-span-2">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Event Payment Plans</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Commission Plan</p>
                                                        <p className="text-[9px] text-gray-500 uppercase font-black">
                                                            {hostStats[host.id]?.tournamentData.filter(t => t.operational_model === 'percentage').length || 0} Tournaments • {hostStats[host.id]?.leagueData.filter(t => t.operational_model === 'percentage').length || 0} Leagues
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Flat Fee Plan</p>
                                                        <p className="text-[9px] text-gray-500 uppercase font-black">
                                                            {hostStats[host.id]?.tournamentData.filter(t => t.operational_model === 'fixed').length || 0} Tournaments • {hostStats[host.id]?.leagueData.filter(t => t.operational_model === 'fixed').length || 0} Leagues
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tournament List */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                            <Trophy size={16} className="text-orange-500" /> Hosted Tournaments
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {hostStats[host.id]?.tournamentData.length > 0 ? (
                                                hostStats[host.id].tournamentData.map(t => (
                                                    <div key={t.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-white uppercase tracking-tight truncate">{t.tournament_name}</p>
                                                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">
                                                                {t.operational_model === 'fixed' ? '₵200 Flat Fee' : '20% Commission'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {t.created_at?.seconds ? new Date(t.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 text-[10px] uppercase font-black italic">No tournaments found.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* League List */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                            <Award size={16} className="text-orange-500" /> Hosted Leagues
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {hostStats[host.id]?.leagueData.length > 0 ? (
                                                hostStats[host.id].leagueData.map(l => (
                                                    <div key={l.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-white uppercase tracking-tight truncate">{l.name}</p>
                                                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-0.5">
                                                                {l.operational_model === 'fixed' ? 'Fixed Access' : 'Flex Commission'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {l.season}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 text-[10px] uppercase font-black italic">No leagues found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredHosts.length === 0 && (
                        <div className="text-center py-20 bg-gray-950/50 rounded-[3rem] border border-white/5">
                            <Users size={48} className="mx-auto text-gray-800 mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No hosts found matching your search</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
