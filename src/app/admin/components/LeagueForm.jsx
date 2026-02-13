'use client';

import { useState, useRef } from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Save, Trophy, Calendar, Info, Upload, Image as ImageIcon } from "lucide-react";

export default function LeagueForm({ league, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(league?.league_flyer || null);
    const [leagueFlyer, setLeagueFlyer] = useState(null);
    const [existingFlyerUrl, setExistingFlyerUrl] = useState(league?.league_flyer || null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: league?.name || "Elite African Series",
        season: league?.season || "Season 1 • 2026",
        prize_pool: league?.prize_pool || "₵50,000",
        description: league?.description || "The premier continental showdown where Africa's talent competes for professional dominance.",
        start_date: league?.start_date || "2026-02-10",
        end_date: league?.end_date || "2026-03-25",
        team_count: league?.team_count || 8,
    });

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setLeagueFlyer(file);
        setExistingFlyerUrl(null);
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'raid_tournaments'); // Reusing the same preset as requested
        formData.append('folder', 'leagues');

        const cloudName = 'drgz6qqo5';

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let flyerUrl = existingFlyerUrl;

            if (leagueFlyer) {
                setUploadingImage(true);
                flyerUrl = await uploadImageToCloudinary(leagueFlyer);
                setUploadingImage(false);
            }

            const data = {
                ...formData,
                league_flyer: flyerUrl,
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
            setUploadingImage(false);
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
                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">League Flyer / Banner</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 hover:border-orange-500 transition-colors cursor-pointer group"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="League flyer preview"
                                        className="w-full h-40 sm:h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        <span className="ml-2 text-white font-medium text-sm sm:text-base">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mb-2" />
                                    <p className="text-sm font-medium">Click to upload league banner</p>
                                    <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

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
                            {uploadingImage ? "Uploading..." : loading ? "Saving..." : "Save "}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
