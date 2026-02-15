"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/contexts/AuthContext";
import { COUNTRIES } from "@/utils/countries";
import { authValidation } from "@/services/authValidation";
import { usernameService } from "@/services/usernameService";

const GENERIC_AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Shadow",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Destiny",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Spark",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Blade",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Nova"
];

const formatPhone = (country, raw) => {
  const digits = (raw || "").replace(/\D+/g, "");
  if (country === "Nigeria") {
    if (digits.startsWith("234")) return digits;
    if (digits.startsWith("0")) return `234${digits.slice(1)}`;
    return digits.length === 10 ? `234${digits}` : digits;
  }
  // Ghana default
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits.length === 9 ? `233${digits}` : digits;
};

const isPhoneValid = (country, phone) => {
  const gh = /^233\d{9}$/;
  const ng = /^234\d{10}$/;
  const digits = (phone || "").replace(/\D+/g, "");
  return country === "Nigeria" ? ng.test(digits) : gh.test(digits);
};

export default function ProfileCompletionPrompt({ hide }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    bio: "",
    dateOfBirth: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileNeedsCompletion = useMemo(() => {
    if (!user) return false;
    return [
      user.username,
      user.firstName,
      user.lastName,
      user.country,
      user.contact || user.phone,
      user.bio,
      user.avatarUrl,
    ].some((val) => !val || `${val}`.trim() === "");
  }, [user]);

  useEffect(() => {
    if (!user || hide) return;
    if (profileNeedsCompletion) {
      setForm({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        country: user.country || "Ghana",
        phone: user.contact || user.phone || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
      });
      setAvatarPreview(user.avatarUrl || null);
      setOpen(true);
    }
  }, [user, profileNeedsCompletion, hide]);

  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleGenericAvatarSelect = (url) => {
    setAvatarPreview(url);
    setAvatarFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setError("");

    if (!form.username.trim()) return setError("Username is required");
    if (!form.firstName.trim() || !form.lastName.trim()) return setError("Add your first and last name");
    if (!form.country) return setError("Select your country");
    if (!form.dateOfBirth) return setError("Enter your date of birth");
    // Validate age (must be at least 13 years old)
    const birthDate = new Date(form.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) return setError("You must be at least 13 years old");
    const formattedPhone = formatPhone(form.country, form.phone);
    if (!isPhoneValid(form.country, formattedPhone)) return setError(`Enter a valid ${form.country} phone number`);
    if (!form.bio.trim()) return setError("Add a short bio");
    if (!avatarFile && !avatarPreview) return setError("Please upload an avatar");

    try {
      setSaving(true);

      // ✅ 1. Check Username Availability (if changed)
      const currentUsername = (user.username || '').toLowerCase().trim();
      const incomingUsername = form.username.toLowerCase().trim();
      if (incomingUsername !== currentUsername) {
        const isUserAvailable = await usernameService.isUsernameAvailable(form.username, user.id);
        if (!isUserAvailable) {
          setError("Username is already taken");
          setSaving(false);
          return;
        }
      }

      // ✅ 2. Check Phone Availability (if changed)
      const currentPhone = (user.phone || user.contact || '').trim();
      const incomingPhone = formattedPhone.trim();
      if (incomingPhone !== currentPhone) {
        const isPhoneAvailable = await authValidation.isPhoneAvailable(incomingPhone);
        if (!isPhoneAvailable) {
          setError("This phone number is already registered to another account");
          setSaving(false);
          return;
        }
      }

      let avatarUrl = avatarPreview || null;

      if (avatarFile) {
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append("file", avatarFile);
        fd.append("upload_preset", "raid_avatars");
        fd.append("folder", "avatars");

        const cloudName = "drgz6qqo5";
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Failed to upload avatar");
        avatarUrl = data.secure_url;
      }

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        username: form.username.trim(),
        username_lowercase: form.username.toLowerCase().trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        country: form.country,
        dateOfBirth: form.dateOfBirth,
        contact: formattedPhone,
        phone: formattedPhone,
        bio: form.bio.trim(),
        avatarUrl,
        updatedAt: new Date(),
      });
      // refresh local view
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Profile completion error", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  if (!open || hide) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-gray-900 border border-orange-500/40 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Complete your profile</h2>
        <p className="text-gray-400 text-sm mb-4">We need your details (name, country, phone for SMS, bio) to continue.</p>
        {error && (
          <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Username *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Country *</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">You must be at least 13 years old.</p>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Phone (SMS) *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={form.country === "Nigeria" ? "08012345678 or 2348012345678" : "0241234567 or 233241234567"}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be able to receive SMS in {form.country}.</p>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Short Bio *</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Avatar *</label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No image</div>
                )}
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm border border-gray-600"
                onClick={() => document.getElementById("profile-avatar-input")?.click()}
                disabled={saving || uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading..." : "Choose Image"}
              </button>
            </div>
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              disabled={saving || uploadingAvatar}
            />

            <div className="mt-4">
              <p className="block text-gray-300 text-sm mb-2">Or choose a generic avatar:</p>
              <div className="flex flex-wrap gap-2">
                {GENERIC_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGenericAvatarSelect(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatarPreview === url ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover bg-gray-800" />
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload a clear photo or select a generic one.</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`w-full mt-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 shadow-lg shadow-orange-500/30 transition-all ${saving ? "opacity-50 cursor-not-allowed" : "hover:scale-[0.99]"}`}
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
