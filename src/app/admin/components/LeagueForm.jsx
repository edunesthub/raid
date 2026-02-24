'use client';

import { useState, useRef } from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Save, Trophy, Calendar, Info, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export default function LeagueForm({ league, onClose, onSuccess, hostId }) {
    const { user } = useAuth();
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
        operational_model: league?.operational_model || (hostId ? (user?.paymentModel === 'subscription' ? 'fixed' : 'percentage') : "percentage"),
    });

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
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
                    hostId: hostId || null,
                });
            }

            onSuccess();
        } catch (error) {
            toast.error("Error saving: " + error.message);
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Trophy className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                {league ? "Edit Season" : "New League Season"}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">League Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[75vh] scrollbar-hide">
                    {/* Image Upload Section */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">League Banner</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative border-2 border-dashed border-white/10 rounded-[2rem] p-8 hover:border-orange-500/50 transition-all cursor-pointer group bg-white/[0.02]"
                        >
                            {imagePreview ? (
                                <div className="relative h-48 w-full group">
                                    <img
                                        src={imagePreview}
                                        alt="League flyer preview"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
                                        <Upload className="w-10 h-10 text-white mb-2" />
                                        <span className="text-white font-black text-xs uppercase tracking-widest">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500 py-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-8 h-8 text-orange-500/40" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest">Upload Season Banner</p>
                                    <p className="text-[9px] mt-2 opacity-50 uppercase tracking-widest font-bold">Optimized for UHD displays</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">League Name</label>
                            <input
                                required
                                placeholder="e.g. ELITE AFRICAN SERIES"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Season Name</label>
                            <input
                                required
                                placeholder="e.g. S1 • 2026"
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Prize Pool</label>
                            <input
                                required
                                placeholder="e.g. ₵50,000"
                                value={formData.prize_pool}
                                onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Teams</label>
                            <input
                                type="number"
                                required
                                value={formData.team_count}
                                onChange={(e) => setFormData({ ...formData, team_count: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">End Date</label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-6 py-5 text-white font-medium outline-none focus:border-orange-500/50 transition-all resize-none leading-relaxed"
                        />
                    </div>

                    {/* Branding / Info Tag */}
                    {(hostId || league?.hostId) && (
                        <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                                    <Info size={16} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-orange-500 opacity-70">
                                        Settlement Strategy
                                    </label>
                                    <p className="text-xs font-black text-white italic uppercase tracking-tighter">
                                        {formData.operational_model === 'fixed' ? '₵200 Monthly Subscription' : '20% Revenue Commission'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[8px] text-orange-500/40 uppercase font-black tracking-widest text-right max-w-[100px]">
                                Configured in Host Payments
                            </p>
                        </div>
                    )}

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] py-5 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3"
                        >
                            <Save size={20} />
                            {uploadingImage ? "Uploading..." : loading ? "Saving..." : "Create League"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
