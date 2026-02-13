'use client';

import { useState } from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Save, Trophy, Calendar, Info } from "lucide-react";

export default function LeagueForm({ league, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: league?.name || "Elite African Series",
        season: league?.season || "Season 1 • 2026",
        prize_pool: league?.prize_pool || "₵50,000",
        description: league?.description || "The premier continental showdown where Africa's talent competes for professional dominance.",
        start_date: league?.start_date || "2026-02-10",
        end_date: league?.end_date || "2026-03-25",
        team_count: league?.team_count || 8,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                updated_at: serverTimestamp(),
            };

            if (league?.id) {
                await updateDoc(doc(db, "league_seasons", league.id), data);
            } else {
                await addDoc(collection(db, "league_seasons"), {
                    ...data,
                    created_at: serverTimestamp(),
                });
            }

            onSuccess();
        } catch (error) {
            alert("Error saving: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl md:rounded-3xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden mb-8 md:mb-0">
                <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-orange-500" />
                        <h3 className="text-xl font-bold text-white">
                            {league ? "Edit League " : "Create New Season"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">League Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Season Label</label>
                            <input
                                required
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Prize Pool</label>
                            <input
                                required
                                value={formData.prize_pool}
                                onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Teams</label>
                            <input
                                type="number"
                                required
                                value={formData.team_count}
                                onChange={(e) => setFormData({ ...formData, team_count: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">End Date</label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Description</label>
                        <textarea
                            rows={3}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition resize-none"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 md:py-4 px-4 md:px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl md:rounded-2xl transition shadow-lg text-sm md:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] md:flex-3 py-3 md:py-4 px-6 md:px-10 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 text-white font-bold rounded-xl md:rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <Save size={18} className="md:w-5 md:h-5" />
                            {loading ? "Saving..." : "Save "}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
