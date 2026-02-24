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
    if (!user || user.role === "host") return false;
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
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-gray-950/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">Complete Profile</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">Join the arena! We need a few more details to set up your account.</p>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs px-4 py-3 italic font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Username *</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Unique ID"
                  className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">First Name *</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Last Name *</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Country *</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm appearance-none"
                  required
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.name} className="bg-gray-900">
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm [color-scheme:dark]"
                  required
                />
                <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest ml-1">Age 13+ requirement</p>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Phone (SMS Updates) *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={form.country === "Nigeria" ? "08012345678" : "0241234567"}
                  className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                  required
                />
                <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest ml-1">Receive tournament notifications</p>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 mb-1.5">Gamer Bio *</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Talk about your gaming experience..."
                  className="w-full rounded-2xl bg-black/40 border border-white/5 px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium text-sm resize-none leading-relaxed"
                  required
                />
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 ml-1">Identity Visual *</label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden bg-black border-2 border-orange-500/20 group-hover:border-orange-500 transition-all shadow-xl shadow-orange-500/10">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-black italic text-xl">?</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById("profile-avatar-input")?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center border-2 border-gray-950 shadow-lg"
                      disabled={saving || uploadingAvatar}
                    >
                      <UploadIcon size={14} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      Upload a battle-ready avatar or select a variant below.
                    </p>
                  </div>
                </div>

                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  disabled={saving || uploadingAvatar}
                />

                <div className="pt-2">
                  <div className="flex flex-wrap gap-2.5">
                    {GENERIC_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleGenericAvatarSelect(url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all duration-300 ${avatarPreview === url ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <img src={url} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover bg-black" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 mt-4 text-xs ${saving ? "cursor-not-allowed" : ""}`}
              >
                {saving ? "Synchronizing Data..." : "Enter the Arena"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const UploadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
