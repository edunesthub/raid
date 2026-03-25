"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Users, User as UserIcon, MapPin } from "lucide-react";
import { collection, query, getDocs, limit, where, orderBy, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import UserAvatar from "@/components/UserAvatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getCountryFlag } from "@/utils/countryFlags";
import { useAuth } from "@/hooks/useAuth";
import { useFriend } from "@/hooks/useFriend";
import { toast } from "react-hot-toast";
import { UserProfile } from "@/types/auth";

export default function PlayersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [players, setPlayers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendingRequest, setSendingRequest] = useState<string | null>(null);

    const { user } = useAuth();
    const { sendRequest } = useFriend();

    const loadInitialPlayers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const playersRef = collection(db, "users");
            const q = query(playersRef, orderBy("createdAt", "desc"), limit(24));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            setPlayers(data);
        } catch (err) {
            console.error("Error loading players:", err);
            setError("Failed to load players. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const usersRef = collection(db, "users");
            const searchLower = searchTerm.toLowerCase();

            const snapshot = await getDocs(query(usersRef, limit(1000)));
            const results = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
                .filter(p => {
                    const username = (p.username || "").toLowerCase();
                    const firstName = (p.firstName || "").toLowerCase();
                    const lastName = (p.lastName || "").toLowerCase();
                    return (
                        username.includes(searchLower) ||
                        firstName.includes(searchLower) ||
                        lastName.includes(searchLower)
                    );
                });

            setPlayers(results.slice(0, 50));
        } catch (err) {
            console.error("Error searching players:", err);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (searchTerm.trim().length >= 2) {
            const delaySearch = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(delaySearch);
        } else if (searchTerm.trim() === "") {
            loadInitialPlayers();
        }
    }, [searchTerm, handleSearch, loadInitialPlayers]);

    const handleSendRequest = async (toUserId: string, toUsername: string) => {
        if (!user) {
            toast.error("Please login to send friend requests");
            return;
        }

        setSendingRequest(toUserId);
        try {
            await sendRequest(user.id, user.username, toUserId);
            toast.success(`Friend request sent to ${toUsername}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to send request");
        } finally {
            setSendingRequest(null);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16 flex flex-col">
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 lg:px-12">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-4">
                            <Users className="w-10 h-10 md:w-14 md:h-14 text-orange-500" />
                            PLAYERS
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest leading-relaxed">
                            Connect and compete with the <span className="text-white">RAID Arena</span> community
                        </p>
                    </div>

                    <div className="relative w-full xl:w-[450px]">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 z-10 ${isSearching ? 'text-orange-500' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search by username or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-12 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-sm uppercase tracking-wider"
                        />
                        {isSearching && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>

                {/* Players Grid */}
                {loading && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-32 grayscale opacity-50">
                        <LoadingSpinner size="lg" />
                        <p className="text-orange-500 mt-6 font-black uppercase text-[10px] tracking-[0.3em]">Discovering Players...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-16 text-center shadow-2xl max-w-2xl mx-auto">
                        <p className="text-red-400 font-bold mb-8 uppercase tracking-wider">{error}</p>
                        <button onClick={loadInitialPlayers} className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Retry Discovery</button>
                    </div>
                ) : players.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                        {players.map((player) => (
                            <Link
                                key={player.id}
                                href={`/users/${player.id}`}
                                className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.06] hover:border-orange-500/40 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center overflow-hidden shadow-lg hover:shadow-orange-500/10"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="text-2xl drop-shadow-lg opacity-80 group-hover:scale-125 transition-transform duration-300">
                                        {player.country ? getCountryFlag(player.country) : '🏳️'}
                                    </div>
                                </div>

                                <div className="relative mb-5">
                                    <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"></div>
                                    <UserAvatar
                                        user={player}
                                        size="xl"
                                        className="relative border-4 border-white/5 group-hover:border-orange-500/50 group-hover:scale-105 transition-all duration-500 shadow-2xl"
                                    />
                                </div>

                                <h3 className="text-white font-black text-lg mb-1 truncate w-full group-hover:text-orange-500 transition-colors uppercase tracking-tight italic">
                                    {player.username || "Anonymous"}
                                </h3>

                                <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-black uppercase tracking-[0.1em] mb-6">
                                    <span className="truncate max-w-[140px]">
                                        {player.firstName && player.lastName
                                            ? `${player.firstName} ${player.lastName}`
                                            : player.firstName || player.lastName || "RAID PLAYER"}
                                    </span>
                                </div>

                                <div className="w-full mt-auto space-y-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendRequest(player.id, player.username);
                                        }}
                                        disabled={!!sendingRequest || !!(user && user.id === player.id)}
                                        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-400 text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {sendingRequest === player.id ? 'Sending...' : 'Add Friend'}
                                    </button>
 
                                    <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                        <MapPin className="w-3 h-3 text-gray-500" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                            {player.country || "GLOBAL"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10 max-w-2xl mx-auto shadow-2xl">
                        <Users className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-widest">No Players Found</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Try searching with a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
