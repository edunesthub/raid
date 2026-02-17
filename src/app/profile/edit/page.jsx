'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Camera, Loader2, User, Globe, Calendar, Mail, Phone, Info, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { usernameService } from '@/services/usernameService';
import { authValidation } from '@/services/authValidation';
import { COUNTRIES } from '@/utils/countries';
import { GENERIC_AVATARS } from '@/utils/avatars';
import UserAvatar from '@/components/UserAvatar';

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
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Load profile from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) {
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
            dateOfBirth: data.dateOfBirth || '',
          });

          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
        } else {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess(false);
  };

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

  const handleGenericAvatarSelect = (url) => {
    setAvatarUrl(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Session expired. Please log in again.');
      return;
    }

    const safeFormData = {
      username: formData.username?.trim() || user.username || "",
      firstName: formData.firstName?.trim() || user.firstName || "",
      lastName: formData.lastName?.trim() || user.lastName || "",
      contact: formData.contact?.trim() || user.contact || "",
      email: formData.email?.trim() || user.email || "",
      bio: formData.bio?.trim() || user.bio || "",
      country: formData.country || user.country || "Ghana",
      dateOfBirth: formData.dateOfBirth || user.dateOfBirth || "",
    };

    if (!safeFormData.username.trim()) {
      setError('Username is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const currentUsername = (user.username || '').toLowerCase().trim();
      const incomingUsername = safeFormData.username.toLowerCase().trim();
      const usernameChanged = incomingUsername !== currentUsername;

      if (usernameChanged) {
        const formatValidation = usernameService.validateUsernameFormat(safeFormData.username);
        if (!formatValidation.isValid) {
          setError(formatValidation.error);
          setSaving(false);
          return;
        }

        const isAvailable = await usernameService.isUsernameAvailable(safeFormData.username, user.id);
        if (!isAvailable) {
          const suggestions = await usernameService.generateSuggestions(safeFormData.username);
          setError(`Username taken. Try: ${suggestions.join(', ')}`);
          setSaving(false);
          return;
        }
      }

      const currentPhone = (user.phone || user.contact || '').trim();
      const incomingPhone = safeFormData.contact.trim();
      if (incomingPhone && incomingPhone !== currentPhone) {
        const isPhoneAvailable = await authValidation.isPhoneAvailable(incomingPhone);
        if (!isPhoneAvailable) {
          setError("Phone number is already in use by another user.");
          setSaving(false);
          return;
        }
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        ...safeFormData,
        username_lowercase: safeFormData.username.toLowerCase().trim(),
        avatarUrl: avatarUrl || '',
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Update failed. Try again.');
      setSaving(false);
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-20" />
          <p className="text-gray-500 font-black uppercase tracking-widest mb-4">Access Denied</p>
          <Link href="/auth/login" className="text-orange-500 font-bold hover:text-orange-400">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-orange-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container-mobile py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
              Edit <span className="text-orange-500">Profile</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Update your profile information</p>
          </div>
          <div className="w-10 h-10 opacity-0" />
        </div>

        {/* Status Messages */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-500">
              <Sparkles className="text-green-400 w-5 h-5 flex-shrink-0" />
              <p className="text-green-400 text-xs font-black uppercase tracking-widest">Profile updated successfully.</p>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-shake">
              <ShieldCheck className="text-red-400 w-5 h-5 flex-shrink-0" />
              <p className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-24">

          {/* Sidebar: Avatar Configuration */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
              <div className="relative inline-block mb-6">
                <div className="relative border-4 border-orange-500/30 shadow-2xl rounded-full p-1 bg-gradient-to-tr from-orange-500 to-blue-500 transition-all duration-700">
                  <div className="bg-black rounded-full p-1">
                    <UserAvatar user={{ ...user, avatarUrl }} size="3xl" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition shadow-xl border-2 border-black z-20 group-hover:scale-110"
                  >
                    {uploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  </button>
                </div>
              </div>

              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Choose an Avatar</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {GENERIC_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGenericAvatarSelect(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${avatarUrl === url ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover bg-gray-900" />
                  </button>
                ))}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Tip</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">
                A clear profile picture helps other players recognize you in tournaments.
              </p>
            </div>
          </div>

          {/* Main: Profile Details */}
          <div className="lg:col-span-8 space-y-6">

            {/* Module: Core Identity */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <h2 className="text-xs font-black uppercase text-white tracking-[0.2em]">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-all font-black italic uppercase text-lg tracking-tighter"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold uppercase tracking-tight"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold uppercase tracking-tight"
                  />
                </div>
              </div>
            </div>

            {/* Module: Public Transmission */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h2 className="text-xs font-black uppercase text-white tracking-[0.2em]">Bio</h2>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Briefly describe yourself</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write a short bio..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-all text-sm leading-relaxed resize-none text-gray-300 italic"
                />
              </div>
            </div>

            {/* Module: Contact Details */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-4 h-4 text-green-400" />
                <h2 className="text-xs font-black uppercase text-white tracking-[0.2em]">Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                    <Globe className="w-3 h-3" /> Region
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-green-500 transition-all font-bold uppercase tracking-tight appearance-none text-white cursor-pointer"
                  >
                    <option value="" disabled className="bg-black">Select Region</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="bg-black">
                        {c.flag} {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all font-bold uppercase tracking-tight text-white cursor-pointer"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-4 text-gray-600 font-bold uppercase tracking-tight cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="+X XXX XXX XXXX"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-all font-black tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-sm tracking-[0.2em] py-5 rounded-3xl transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Save Changes
                  </>
                )}
              </button>
              <Link
                href="/profile"
                className="md:w-1/3 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 font-black uppercase text-sm tracking-[0.2em] py-5 rounded-3xl transition-all active:scale-95"
              >
                Cancel
              </Link>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}