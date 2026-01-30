'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { usernameService } from '@/services/usernameService';

export default function EditProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    bio: '',
    country: 'Ghana',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef(null);

  // Load profile from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) {
          console.log('Waiting for user to load...');
          setLoading(false);
          return;
        }

        const docRef = doc(db, "users", user.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            contact: data.contact || '',
            email: data.email || user.email || '',
            bio: data.bio || '',
            country: data.country || 'Ghana',
          });

          // Set avatar if exists
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
        } else {
          // Defaults from auth user
          setFormData({
            username: user.username || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            contact: user.contact || '',
            email: user.email || '',
            bio: '',
            country: user.country || 'Ghana',
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);

      const formDataCloud = new FormData();
      formDataCloud.append('file', file);
      formDataCloud.append('upload_preset', 'raid_avatars');
      formDataCloud.append('folder', 'avatars');

      const cloudName = 'drgz6qqo5';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataCloud
      });
      const data = await res.json();

      if (!data.secure_url) throw new Error('Upload failed');

      setAvatarUrl(data.secure_url);

      if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { avatarUrl: data.secure_url, updatedAt: new Date() });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to update your profile');
      return;
    }

    // Preserve existing values when fields are left untouched/blank
    const safeFormData = {
      username: formData.username?.trim() || user.username || "",
      firstName: formData.firstName?.trim() || user.firstName || "",
      lastName: formData.lastName?.trim() || user.lastName || "",
      contact: formData.contact?.trim() || user.contact || "",
      email: formData.email?.trim() || user.email || "",
      bio: formData.bio?.trim() || user.bio || "",
      country: formData.country || user.country || "Ghana",
    };

    if (!safeFormData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!safeFormData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // ✅ Only validate username if it actually changed
      const currentUsername = (user.username || '').toLowerCase().trim();
      const incomingUsername = safeFormData.username.toLowerCase().trim();
      const usernameChanged = incomingUsername !== currentUsername;

      if (usernameChanged) {
        // ✅ Validate username format only if it changed
        const formatValidation = usernameService.validateUsernameFormat(safeFormData.username);
        if (!formatValidation.isValid) {
          setError(formatValidation.error);
          setSaving(false);
          return;
        }

        const isAvailable = await usernameService.isUsernameAvailable(
          safeFormData.username,
          user.id
        );

        if (!isAvailable) {
          setError("Username is already taken. Please choose another one.");

          // Generate suggestions
          const suggestions = await usernameService.generateSuggestions(safeFormData.username);
          if (suggestions.length > 0) {
            setError(`Username is taken. Try: ${suggestions.join(', ')}`);
          }
          return;
        }
      }

      const userRef = doc(db, 'users', user.id);

      await updateDoc(userRef, {
        username: safeFormData.username.trim(),
        firstName: safeFormData.firstName.trim(),
        lastName: safeFormData.lastName.trim(),
        contact: safeFormData.contact.trim(),
        email: safeFormData.email.trim(),
        bio: safeFormData.bio.trim(),
        country: safeFormData.country || 'Ghana',
        updatedAt: new Date(),
      });

      setSuccess(true);
      // Hard refresh to ensure country change propagates through auth context
      // Keep button in loading state until navigation completes
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-gray-900">
        <div className="text-center">
          <p className="mb-4">Access Denied. Please log in.</p>
          <Link href="/auth/login" className="text-orange-500 hover:text-orange-400">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>

      <div className="container-mobile py-12 relative z-10">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/profile" className="p-3 bg-black border border-white/10 hover:border-blue-500/50 transition-all" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
              <ArrowLeft className="w-6 h-6 text-blue-500" />
            </Link>
            <div className="text-right">
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Operative <span className="text-blue-500">Log</span>
              </h1>
              <p className="text-blue-500/40 font-black uppercase tracking-[0.3em] text-[9px]">
                // UPDATE_PERSONAL_PARAMETERS
              </p>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="bg-blue-600/10 border border-blue-600/30 p-4 mb-8 flex items-center justify-between" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
              <p className="text-blue-400 text-xs font-black uppercase tracking-widest italic animate-pulse">
                ✓ CORE_DATA_SYNCHRONIZED
              </p>
              <div className="w-2 h-2 bg-blue-500 animate-ping"></div>
            </div>
          )}

          {error && (
            <div className="bg-pink-600/10 border border-pink-600/30 p-4 mb-8" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
              <p className="text-pink-500 text-xs font-black uppercase tracking-widest">⚠️ SYSTEM_ERROR: {error}</p>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-32 h-32 bg-black border-2 border-blue-500/30 overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-blue-900/20 flex items-center justify-center text-blue-500 text-5xl font-black italic">
                    {formData.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-blue-600 border border-blue-400 p-2.5 shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:bg-blue-500 transition-all z-10"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="mt-4 text-blue-500/40 font-black uppercase tracking-[0.2em] text-[10px]">REHOST_BIOMETRIC_VISUAL</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="relative group">
            <div className="absolute -inset-1 bg-blue-500/5 blur opacity-50"></div>
            <div className="relative bg-black border border-blue-500/20 p-8 sm:p-10 space-y-8" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>

              <div className="grid sm:grid-cols-2 gap-8">
                {/* Username */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">IDENTITY_LABEL</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                    required
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">PREFIX_IDENTIFIER</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">SUFFIX_IDENTIFIER</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">UPLINK_SECURE_ID</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">ZONE_COORDINATES</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all appearance-none"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                  >
                    <option value="Ghana">Ghana [ZONE_AF-W]</option>
                    <option value="Nigeria">Nigeria [ZONE_AF-E]</option>
                  </select>
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">TRANSMISSION_UPLINK</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                    required
                  />
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">TACTICAL_SYNOPSIS</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all resize-none"
                    style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 100%, 0 100%, 0 10%)' }}
                  ></textarea>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-[0.2em] py-5 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all active:scale-[0.98] ${saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
              >
                <Save className="w-5 h-5 shadow-[0_0_10px_white]" />
                {saving ? 'SYNCHRONIZING...' : 'COMMIT_CHANGES'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}