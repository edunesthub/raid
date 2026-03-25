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
        <div className="container-mobile min-h-screen py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <Users className="w-10 h-10 text-orange-500" />
                            PLAYERS
                        </h1>
                        <p className="text-gray-400 font-medium tracking-wide">
                            Connect and compete with the RAID Arena community
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-orange-500' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search by username or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>

                {/* Players Grid */}
                {loading && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-500 mt-4 font-black uppercase text-[10px] tracking-[0.2em]">Discovering Players...</p>
                    </div>
                ) : error ? (
                    <div className="bg-[#16161a] p-12 text-center border border-red-500/20 rounded-3xl">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={loadInitialPlayers} className="bg-primary text-black px-8 py-3 rounded-xl font-bold">Retry</button>
                    </div>
                ) : players.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {players.map((player) => (
                            <Link
                                key={player.id}
                                href={`/users/${player.id}`}
                                className="group relative bg-[#16161a] border border-white/5 rounded-3xl p-5 hover:bg-gray-800/60 hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">
                                        {player.country ? getCountryFlag(player.country) : '🏳️'}
                                    </div>
                                </div>

                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                    <UserAvatar
                                        user={player}
                                        size="xl"
                                        className="relative border-2 border-white/5 group-hover:border-orange-500/50 transition-all duration-300"
                                    />
                                </div>

                                <h3 className="text-white font-black text-lg mb-1 truncate w-full group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                                    {player.username || "Anonymous"}
                                </h3>

                                <div className="flex items-center gap-1 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <UserIcon className="w-3 h-3" />
                                    <span className="truncate max-w-[120px]">
                                        {player.firstName && player.lastName
                                            ? `${player.firstName} ${player.lastName}`
                                            : player.firstName || player.lastName || "RAID PLAYER"}
                                    </span>
                                </div>

                                <div className="w-full mt-auto space-y-3">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendRequest(player.id, player.username);
                                        }}
                                        disabled={!!sendingRequest || !!(user && user.id === player.id)}
                                        className="w-full py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        {sendingRequest === player.id ? 'Sending...' : 'Add Friend'}
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                                        <MapPin className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                            {player.country || "GLOBAL"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-white/5">
                        <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Players Found</h3>
                        <p className="text-gray-500 font-medium">Try searching with a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
