// src/app/admin/components/TournamentForm.jsx - MOBILE OPTIMIZED
"use client";

import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Upload, Image as ImageIcon, Save, Plus, Shield, Users } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { logAdminAction } from '@/services/adminAuditService';

export default function TournamentForm({ tournament, onClose, onCreated }) {
  const isEditing = !!tournament;
  const { user } = useAuth();

  // Resolve current admin info (id, name, role)
  const getAdminMeta = async () => {
    if (!user?.id) return { id: null, name: null, role: null };
    try {
      const snap = await getDoc(doc(db, 'users', user.id));
      const data = snap.exists() ? snap.data() : user;
      return {
        id: user.id,
        name: data?.username || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || user.email || null,
        role: data?.adminRole || null,
      };
    } catch {
      return { id: user.id, name: user?.username || null, role: user?.adminRole || null };
    }
  };

  const [form, setForm] = useState({
    tournament_name: "",
    game: "",
    entry_fee: "",
    max_participant: "",
    first_place: "",
    description: "",
    format: "Battle Royale",
    country: "Ghana",
    participant_type: "Individual", // "Individual" or "Team"
    squad_size: "5", // Default to 5 for teams
    rules: [],
    twitch_link: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tournamentFlyer, setTournamentFlyer] = useState(null);
  const [existingFlyerUrl, setExistingFlyerUrl] = useState(null);
  const fileInputRef = useRef(null);

  const tournamentFormats = [
    { value: "Battle Royale", label: "Battle Royale", description: "Free-for-all, winner selected manually" },
    { value: "Bracket", label: "Bracket/Knockout", description: "1v1 elimination bracket" },
    { value: "Round Robin", label: "Round Robin", description: "Everyone plays everyone" },
    { value: "Swiss", label: "Swiss System", description: "Paired based on performance" },
  ];

  useEffect(() => {
    if (tournament) {
      setForm({
        tournament_name: tournament.tournament_name || "",
        game: tournament.game || "",
        entry_fee: tournament.entry_fee?.toString() || "",
        max_participant: tournament.max_participant?.toString() || "",
        first_place: tournament.first_place?.toString() || "",
        description: tournament.description || "",
        format: tournament.format || "Battle Royale",
        country: tournament.country || tournament.region || "Ghana",
        participant_type: tournament.participant_type || "Individual",
        squad_size: tournament.squad_size?.toString() || "5",
        rules: Array.isArray(tournament.rules) ? tournament.rules : [],
        twitch_link: tournament.twitch_link || "",
      });

      if (tournament.tournament_flyer) {
        setExistingFlyerUrl(tournament.tournament_flyer);
        setImagePreview(tournament.tournament_flyer);
      }
    }
  }, [tournament]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRule = () => {
    setForm(prev => ({
      ...prev,
      rules: Array.isArray(prev.rules) ? [...prev.rules, ""] : [""]
    }));
  };

  const handleRemoveRule = (index) => {
    setForm(prev => ({
      ...prev,
      rules: Array.isArray(prev.rules) ? prev.rules.filter((_, i) => i !== index) : []
    }));
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...form.rules];
    newRules[index] = value;
    setForm(prev => ({ ...prev, rules: newRules }));
  };

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

    setTournamentFlyer(file);
    setExistingFlyerUrl(null);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'raid_tournaments');
    formData.append('folder', 'tournaments');

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

    if (!form.tournament_name || !form.game) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      let flyerUrl = existingFlyerUrl;

      if (tournamentFlyer) {
        setUploadingImage(true);
        flyerUrl = await uploadImageToCloudinary(tournamentFlyer);
        setUploadingImage(false);
      }

      const tournamentData = {
        tournament_name: form.tournament_name,
        game: form.game,
        description: form.description || "",
        entry_fee: Number(form.entry_fee) || 0,
        max_participant: Number(form.max_participant) || 0,
        first_place: Number(form.first_place) || 0,
        tournament_flyer: flyerUrl,
        format: form.format,
        country: form.country || "Ghana",
        participant_type: form.participant_type,
        squad_size: form.participant_type === "Team" ? (Number(form.squad_size) || 5) : null,
        rules: form.rules.filter(rule => rule.trim() !== ""),
        twitch_link: form.twitch_link || "",
        updated_at: serverTimestamp(),
      };

      if (isEditing) {
        const tournamentRef = doc(db, "tournaments", tournament.id);
        const adminMeta = await getAdminMeta();
        await updateDoc(tournamentRef, {
          ...tournamentData,
          updatedBy: adminMeta.id,
          updatedByName: adminMeta.name,
          updatedByRole: adminMeta.role,
        });
        // Audit log
        if (user?.id) {
          logAdminAction({
            adminId: user.id,
            action: 'tournament_update',
            entityType: 'tournament',
            entityId: tournament.id,
            details: { fields: Object.keys(tournamentData) }
          });
        }
        alert("Tournament updated successfully!");
      } else {
        const adminMeta = await getAdminMeta();
        const docRef = await addDoc(collection(db, "tournaments"), {
          ...tournamentData,
          current_participants: 0,
          status: "registration-open",
          bracketGenerated: false,
          currentRound: 0,
          totalRounds: 0,
          created_at: serverTimestamp(),
          createdBy: adminMeta.id,
          createdByName: adminMeta.name,
          createdByRole: adminMeta.role,
        });
        // Audit log
        if (user?.id) {
          logAdminAction({
            adminId: user.id,
            action: 'tournament_create',
            entityType: 'tournament',
            entityId: docRef.id,
            details: { name: tournamentData.tournament_name }
          });
        }
        alert("Tournament created successfully!");
      }

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} tournament: ` + error.message);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const selectedFormat = tournamentFormats.find(f => f.value === form.format);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center overflow-hidden">
      <div className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto sm:my-8 relative">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between z-10">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <>
                <Save className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="hidden sm:inline">Edit Tournament</span>
                <span className="sm:hidden">Edit</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="hidden sm:inline">Create Tournament</span>
                <span className="sm:hidden">Create</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 pb-30 sm:pb-8">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300 font-medium">
              Tournament Flyer {!isEditing && "(Optional)"}
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 hover:border-orange-500 transition-colors cursor-pointer group"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Tournament flyer preview"
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
                  <p className="text-sm font-medium">Click to upload tournament flyer</p>
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

          {/* Tournament Name */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Tournament Name *
            </label>
            <input
              name="tournament_name"
              placeholder="e.g., RAID Championship 2024"
              value={form.tournament_name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              required
            />
          </div>

          {/* Game Name */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Game Name *
            </label>
            <input
              name="game"
              placeholder="e.g., PUBG Mobile, Call of Duty Mobile"
              value={form.game}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              required
            />
          </div>

          {/* Twitch Livestream Link */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Twitch Livestream Link (Optional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </div>
              <input
                name="twitch_link"
                placeholder="https://twitch.tv/yourchannel"
                value={form.twitch_link}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">Visible to players on the tournament page.</p>
          </div>

          {/* Tournament Format */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Tournament Format *
            </label>
            <select
              name="format"
              value={form.format}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              required
            >
              {tournamentFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            {selectedFormat && (
              <p className="text-gray-400 text-xs mt-2 flex items-start gap-1">
                <span className="text-blue-400">ℹ️</span>
                {selectedFormat.description}
              </p>
            )}
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs">
                {form.format === "Bracket"
                  ? "⚡ Bracket will be auto-generated when tournament goes live"
                  : "📋 Winners will be selected manually by admin after completion"}
              </p>
            </div>
          </div>

          {/* Participant Type */}
          <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-700/50">
            <label className="block text-sm text-gray-300 font-medium mb-3">
              Participant Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, participant_type: "Individual" })}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${form.participant_type === "Individual"
                  ? "bg-orange-600/20 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
              >
                <Users size={20} className={form.participant_type === "Individual" ? "text-orange-500" : "text-gray-500"} />
                <span className="font-bold text-xs uppercase tracking-wider">Individual</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, participant_type: "Team" })}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${form.participant_type === "Team"
                  ? "bg-blue-600/20 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
              >
                <Shield size={20} className={form.participant_type === "Team" ? "text-blue-500" : "text-gray-500"} />
                <span className="font-bold text-xs uppercase tracking-wider">Squad / Team</span>
              </button>
            </div>
            {form.participant_type === "Team" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">
                  Required Players Per Squad
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50" size={16} />
                  <input
                    type="number"
                    name="squad_size"
                    value={form.squad_size}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    placeholder="e.g. 5"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg py-3 pl-10 pr-4 outline-none text-white text-sm"
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-2 italic">
                  Managers must select exactly this many members to mobilize their squad.
                </p>
              </div>
            )}
            <p className="text-gray-500 text-[10px] mt-2 italic px-1">
              {form.participant_type === "Individual"
                ? "Players join this tournament individually."
                : "Managers will register their entire squad for this event."}
            </p>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Country *
            </label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              required
            >
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
            </select>
            <p className="text-gray-400 text-xs mt-2">Players will only see tournaments from their country.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter tournament description and general overview..."
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          {/* Rules and Guidelines */}
          <div className="space-y-3 bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-300 font-medium">
                Rules & Guidelines
              </label>
              <button
                type="button"
                onClick={handleAddRule}
                className="text-xs flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors bg-orange-400/10 px-2 py-1 rounded"
              >
                <Plus className="w-3 h-3" />
                Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {Array.isArray(form.rules) && form.rules.map((rule, index) => (
                <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-xs">{index + 1}</span>
                    <input
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      placeholder={`Enter rule #${index + 1}`}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(index)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {form.rules.length === 0 && (
                <div className="text-center py-4 bg-gray-900/50 rounded-lg border border-dashed border-gray-700">
                  <p className="text-gray-500 text-xs italic">No specific rules added yet.</p>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="mt-2 text-xs text-orange-400 hover:underline"
                  >
                    Add the first rule
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Entry Fee and Max Participants - Stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Entry Fee ({form.country === 'Nigeria' ? '₦' : '₵'})
              </label>
              <input
                type="number"
                name="entry_fee"
                placeholder="0"
                value={form.entry_fee}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-2">
                Max Participants
              </label>
              <input
                type="number"
                name="max_participant"
                placeholder="16"
                value={form.max_participant}
                onChange={handleChange}
                min="2"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          {/* First Place Prize */}
          <div>
            <label className="block text-sm text-gray-300 font-medium mb-2">
              First Place Prize ({form.country === 'Nigeria' ? '₦' : '₵'})
            </label>
            <input
              type="number"
              name="first_place"
              placeholder="1000"
              value={form.first_place}
              onChange={handleChange}
              min="0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          {/* Buffer space for fixed mobile footer */}
          <div className="h-6 sm:hidden"></div>

          {/* Action Buttons - Fixed at bottom on mobile */}
          <div className="fixed sm:relative bottom-0 left-0 right-0 bg-gray-900 sm:bg-transparent border-t sm:border-t-0 border-gray-700 p-4 sm:p-0 flex flex-col sm:flex-row gap-3 sm:pt-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] sm:shadow-none">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingImage}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className={`flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 order-1 sm:order-2 ${(loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
            >
              {uploadingImage ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Uploading Image...</span>
                  <span className="sm:hidden">Uploading...</span>
                </>
              ) : loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? (
                    <>
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">Updating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">Creating...</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isEditing ? (
                    <>
                      <span className="hidden sm:inline">Update Tournament</span>
                      <span className="sm:hidden">Update</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Create Tournament</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}