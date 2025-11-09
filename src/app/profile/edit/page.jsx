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
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load profile from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Wait for user to be loaded
        if (!user?.id) {
          console.log('Waiting for user to load...');
          setLoading(false);
          return;
        }

        console.log('Loading profile for user:', user.id);
        const docRef = doc(db, "users", user.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Profile data loaded:', data);
          
          setFormData({
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            contact: data.contact || '',
            email: data.email || user.email || '',
            bio: data.bio || '',
          });
        } else {
          console.log('No profile document found, using auth user data');
          // Set defaults from auth user
          setFormData({
            username: user.username || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            contact: user.contact || '',
            email: user.email || '',
            bio: '',
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    // Only load profile if user is authenticated
    if (isAuthenticated && user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess(false);
  };

const handleSave = async (e) => {
  e.preventDefault();
if (!user?.id) {
  setError('You must be logged in to update your profile');
  return;
}


  // Ensure all fields are strings
  const safeFormData = {
    username: formData.username || "",
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    contact: formData.contact || "",
    email: formData.email || "",
    bio: formData.bio || "",
  };

  // Validation
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

const userRef = doc(db, 'users', user.id);

    await updateDoc(userRef, {
      username: safeFormData.username.trim(),
      firstName: safeFormData.firstName.trim(),
      lastName: safeFormData.lastName.trim(),
      contact: safeFormData.contact.trim(),
      email: safeFormData.email.trim(),
      bio: safeFormData.bio.trim(),
      updatedAt: new Date(),
    });

    setSuccess(true);

    setTimeout(() => {
      router.push('/profile');
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