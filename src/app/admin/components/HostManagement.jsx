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
import { toast } from "react-hot-toast";
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
    ChevronUp,
    DollarSign,
    Zap,
    Trash2,
    RotateCcw
} from "lucide-react";

const calculateItemCommission = (item) => {
    // Handle both tournament and league participants naming
    const participants = parseInt(item.current_participants || item.participantsCount || 0);
    const fee = parseFloat(item.entry_fee || 0);
    return (fee * participants) * 0.20;
};

const HostActivityModal = ({ isOpen, onClose, host, stats, onStatusUpdate }) => {
    if (!isOpen || !host) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-gray-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-gray-950 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xl italic border border-orange-500/20">
                            {host.hostName?.[0] || host.fullName?.[0]}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                                {host.hostName}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Host Details & Performance</p>
                                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-orange-500/10 text-orange-500 border-orange-500/20">
                                    Commission Based
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {host.status === 'terminated' && (
                            <button
                                onClick={() => onStatusUpdate(host.id, 'approved')}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-orange-500/20"
                            >
                                <RotateCcw size={16} />
                                Undo Termination
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl border border-white/5 transition-all"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Contact Information</p>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Email Address</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{host.email}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Phone Number</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{host.phoneNumber}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Organization Head</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{host.fullName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 col-span-1 lg:col-span-2">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Platform Operational Model</p>
                            <div className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl border border-white/5">
                                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">20% Revenue Share</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black mt-1 leading-snug">
                                        Applied to all entry fees. No upfront or monthly costs for hosts.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Platform Revenue Summary</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total Estimated Earnings</p>
                                        <p className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                            ₵{(stats?.tournamentData.reduce((acc, t) => acc + calculateItemCommission(t), 0) +
                                                stats?.leagueData.reduce((acc, l) => acc + calculateItemCommission(l), 0)).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-orange-500 mb-1 justify-end">
                                            <Zap size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Flow</span>
                                        </div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.1em]">Updated real-time</p>
                                    </div>
                                </div>
                                <div className="h-px bg-orange-500/10 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">From Tournaments</p>
                                        <p className="text-sm font-black text-white uppercase italic">₵{stats?.tournamentData.reduce((acc, t) => acc + calculateItemCommission(t), 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">From Leagues</p>
                                        <p className="text-sm font-black text-white uppercase italic">₵{stats?.leagueData.reduce((acc, l) => acc + calculateItemCommission(l), 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tournament List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                <Trophy size={18} className="text-orange-500" /> Hosted Tournaments
                            </h4>
                            <span className="px-3 py-1 bg-orange-500/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                {stats?.tournaments || 0} Total
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats?.tournamentData.length > 0 ? (
                                stats.tournamentData.map(t => (
                                    <div key={t.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">{t.tournament_name || t.title}</p>
                                                <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                    +₵{calculateItemCommission(t).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                                20% Commission • {t.current_participants || 0}/{t.max_participant || '∞'} Players
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase mb-1 ${t.status === 'completed' ? 'bg-gray-500/20 text-gray-500' : 'bg-green-500/20 text-green-500'
                                                }`}>
                                                {t.status}
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                {t.created_at?.seconds ? new Date(t.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
                                    <p className="text-gray-600 text-[10px] uppercase font-black italic">No tournaments found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* League List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                <Award size={18} className="text-orange-500" /> Hosted Leagues
                            </h4>
                            <span className="px-3 py-1 bg-orange-500/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                {stats?.leagues || 0} Total
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats?.leagueData.length > 0 ? (
                                stats.leagueData.map(l => (
                                    <div key={l.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">{l.name}</p>
                                                <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                    +₵{calculateItemCommission(l).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                                20% Commission Rate • Season {l.season}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded-full text-[8px] font-black uppercase mb-1">
                                                {l.season}
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                Active Season
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
                                    <p className="text-gray-600 text-[10px] uppercase font-black italic">No leagues found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function HostManagement() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHostId, setSelectedHostId] = useState(null);
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
        const host = hosts.find(h => h.id === hostId);
        const confirmMessage = newStatus === 'terminated'
            ? "WARNING: Are you sure you want to terminate this host? They will lose access to their portal immediately."
            : (newStatus === 'approved' && host?.status === 'terminated')
                ? "Are you sure you want to undo the termination of this host?"
                : `Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this host?`;

        if (!confirm(confirmMessage)) return;

        try {
            await updateDoc(doc(db, "users", hostId), {
                status: newStatus,
                updatedAt: new Date()
            });
            setHosts(hosts.map(h => h.id === hostId ? { ...h, status: newStatus } : h));
            toast.success(`Host ${newStatus} successfully!`);
        } catch (error) {
            console.error("Error updating host status:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredHosts = hosts.filter(h =>
        (h.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.hostName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedHost = hosts.find(h => h.id === selectedHostId);

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
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium shadow-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 pb-20">
                    {filteredHosts.map(host => (
                        <div key={host.id} className="bg-gray-900/40 border border-white/5 rounded-[2rem] p-4 sm:p-5 transition-all hover:border-orange-500/20 shadow-2xl backdrop-blur-md group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xl italic border border-orange-500/20 shadow-xl shadow-orange-500/5 group-hover:rotate-6 transition-transform shrink-0">
                                        {host.hostName?.[0] || host.fullName?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-white italic truncate uppercase tracking-tighter leading-none">
                                                {host.hostName}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border shrink-0 ${host.status === 'approved'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : host.status === 'terminated'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : host.status === 'rejected'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 opacity-50'
                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {host.status?.replace('_', ' ') || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest truncate">{host.fullName}</p>
                                            <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                            <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest truncate">{host.country || 'Global'}</p>
                                            <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-500">
                                                Commission Model
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 px-5 py-2.5 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-white italic leading-none">{hostStats[host.id]?.tournaments || 0}</div>
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Events</div>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="text-center">
                                        <div className="text-lg font-black text-white italic leading-none">
                                            ₵{(hostStats[host.id]?.tournamentData?.reduce((acc, t) => acc + calculateItemCommission(t), 0) +
                                                hostStats[host.id]?.leagueData?.reduce((acc, l) => acc + calculateItemCommission(l), 0) || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">Our Share</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {(host.status === 'pending_approval' || host.status === 'approved' || host.status === 'terminated') && (
                                        <div className="flex gap-1.5">
                                            {host.status === 'pending_approval' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(host.id, 'approved')}
                                                    className="p-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl border border-green-500/20 transition-all active:scale-95 shadow-lg shadow-green-500/5 focus:outline-none"
                                                    title="Approve Host"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {host.status === 'pending_approval' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(host.id, 'rejected')}
                                                    className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-95 shadow-lg shadow-red-500/5 focus:outline-none"
                                                    title="Reject Host"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                            {host.status === 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(host.id, 'terminated')}
                                                    className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-95 shadow-lg shadow-red-500/5 focus:outline-none group/term"
                                                    title="Terminate Host"
                                                >
                                                    <Trash2 size={18} className="group-hover/term:scale-110 transition-transform" />
                                                </button>
                                            )}
                                            {host.status === 'terminated' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(host.id, 'approved')}
                                                    className="p-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl border border-orange-500/20 transition-all active:scale-95 shadow-lg shadow-orange-500/5 focus:outline-none"
                                                    title="Undo Termination"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedHostId(host.id)}
                                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/20 focus:outline-none group/btn"
                                    >
                                        View Host Details
                                        <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
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

            {/* Activity Modal */}
            <HostActivityModal
                isOpen={!!selectedHostId}
                onClose={() => setSelectedHostId(null)}
                host={selectedHost}
                stats={hostStats[selectedHostId]}
            />
        </div>
    );
}
