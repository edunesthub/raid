"use client";

import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Upload, Image as ImageIcon } from "lucide-react";

export default function TournamentForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    tournament_name: "",
    game: "",
    entry_fee: "",
    max_participant: "",
    first_place: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tournamentFlyer, setTournamentFlyer] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setTournamentFlyer(file);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'raid_tournaments'); // You'll need to create this preset
    formData.append('folder', 'tournaments');

    const cloudName = 'drgz6qqo5'; // Replace with your Cloudinary cloud name
    
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
      let flyerUrl = null;

      // Upload image to Cloudinary if selected
      if (tournamentFlyer) {
        setUploadingImage(true);
        flyerUrl = await uploadImageToCloudinary(tournamentFlyer);
        setUploadingImage(false);
      }

      await addDoc(collection(db, "tournaments"), {
        tournament_name: form.tournament_name,
        game: form.game,
        description: form.description || "",
        entry_fee: Number(form.entry_fee) || 0,
        max_participant: Number(form.max_participant) || 0,
        first_place: Number(form.first_place) || 0,
        tournament_flyer: flyerUrl,
        current_participants: 0,
        status: "registration-open",
        created_at: serverTimestamp(),
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create tournament: " + error.message);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">Create Tournament</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300 font-medium">
              Tournament Flyer (Optional)
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors cursor-pointer group"
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Tournament flyer preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                    <span className="ml-2 text-white font-medium">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
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
          <input
            name="tournament_name"
            placeholder="Tournament Name *"
            value={form.tournament_name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />

          {/* Game Name */}
          <input
            name="game"
            placeholder="Game Name *"
            value={form.game}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Tournament Description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
          />

          {/* Entry Fee and Max Participants */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="entry_fee"
              placeholder="Entry Fee (₵)"
              value={form.entry_fee}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input
              type="number"
              name="max_participant"
              placeholder="Max Participants"
              value={form.max_participant}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          {/* First Place Prize */}
          <input
            type="number"
            name="first_place"
            placeholder="First Place Prize (₵)"
            value={form.first_place}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className={`w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg transition-colors ${
              (loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingImage ? "Uploading Image..." : loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}