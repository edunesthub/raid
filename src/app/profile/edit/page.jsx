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
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
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
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-10">
        <Link href="/profile" className="text-orange-500 hover:text-orange-600">
          <ArrowLeft size={28} />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-wide text-orange-400">
          Edit Profile
        </h1>
        <div className="w-6" />
      </div>

      {/* Success Message */}
      {success && (
        <div className="w-full max-w-md mb-6 bg-green-600/10 border border-green-600/30 rounded-lg p-4">
          <p className="text-green-400 text-center">✓ Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-md mb-6 bg-red-600/10 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Avatar */}
      <div className="mb-6 relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 mx-auto mb-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-4xl font-bold">
              {formData.firstName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition"
        >
          {uploadingAvatar ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '📷'
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-gray-800 border border-orange-500 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md"
      >
        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your username"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="+233 123 456 789"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
            >
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Write a short bio..."
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition resize-none"
            ></textarea>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 font-bold py-3 rounded-2xl text-white text-lg transition-all active:scale-95 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}