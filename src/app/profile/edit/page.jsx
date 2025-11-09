'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    contact: '',
    email: '',
    bio: '',
    gamerTag: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Load profile from Firebase
useEffect(() => {
  const loadProfile = async () => {
    try {
      if (!user?.uid) return; // ✅ guard
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setContact(data.contact || "");
        setAvatarUrl(data.avatarUrl || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  loadProfile();
}, [user]);


  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        username: formData.username,
        contact: formData.contact,
        email: formData.email,
        bio: formData.bio,
        gamerTag: formData.gamerTag,
      });
      router.push('/profile');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-gray-900">
        <p>Access Denied. Please log in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-gray-900">
        Loading profile...
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

      {/* Form Card */}
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-gray-800 border border-orange-500 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
              required
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

          {/* Gamer Tag */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Gamer Tag</label>
            <input
              type="text"
              name="gamerTag"
              value={formData.gamerTag}
              onChange={handleChange}
              placeholder="ShadowReaper99"
              className="w-full bg-gray-900 border border-orange-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition"
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
          className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 font-bold py-3 rounded-2xl text-white text-lg transition-all active:scale-95"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
