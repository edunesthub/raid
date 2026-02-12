// src/app/auth/signup/page.jsx - Enhanced with username validation
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, X } from "lucide-react";
import { authValidation } from "@/services/authValidation";

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

export default function SignupPage() {
  const router = useRouter();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    country: "Ghana",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  // ======================
  // Email Handling
  // ======================
  const handleEmailChange = (email) => {
    setFormData({ ...formData, email });
    setEmailAvailable(null);

    if (window.emailCheckTimeout) clearTimeout(window.emailCheckTimeout);

    window.emailCheckTimeout = setTimeout(() => {
      checkEmailAvailability(email);
    }, 800);
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !authValidation.validateEmailFormat(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const available = await authValidation.isEmailAvailable(email);
      setEmailAvailable(available);
    } catch (err) {
      console.error(err);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  // ======================
  // Username Handling
  // ======================
  const handleUsernameChange = (username) => {
    setFormData({ ...formData, username });
    setUsernameAvailable(null);
    setUsernameError("");

    const formatCheck = authValidation.validateUsernameFormat(username);
    if (!formatCheck.isValid) {
      setUsernameError(formatCheck.error);
      return;
    }

    if (window.usernameCheckTimeout) clearTimeout(window.usernameCheckTimeout);

    window.usernameCheckTimeout = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await authValidation.isUsernameAvailable(username);
        setUsernameAvailable(available);
        if (!available) setUsernameError("Username is already taken");
      } catch (err) {
        console.error(err);
        setUsernameError("Failed to check username availability");
      } finally {
        setUsernameChecking(false);
      }
    }, 800);
  };

  // ======================
  // Password Strength
  // ======================
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '', textColor: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    return { strength, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (!avatarFile) {
      // If no file, keep the existing preview (which might be a generic URL)
      // unless we want to clear it when file is removed? 
      // Actually, if we setAvatarFile(null), we might want to keep the preview if it was a generic one.
      // But if we are switching from file to nothing, we rely on the selection handler.
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  const handleGenericAvatarSelect = (url) => {
    setAvatarPreview(url);
    setAvatarFile(null);
  };

  const isValidPhoneForCountry = (country, phoneRaw) => {
    const phone = phoneRaw.trim();
    const ghLocal = /^0\d{9}$/; // e.g., 0241234567
    const ghIntl = /^233\d{9}$/; // e.g., 233241234567
    const ngLocal = /^0\d{10}$/; // e.g., 08012345678
    const ngIntl = /^234\d{10}$/; // e.g., 2348012345678

    if (country === "Nigeria") {
      return ngLocal.test(phone) || ngIntl.test(phone);
    }
    return ghLocal.test(phone) || ghIntl.test(phone);
  };

  // ======================
  // Form Validation
  // ======================
  const validateStep1 = () => {
    setError("");
    if (!formData.email || !authValidation.validateEmailFormat(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (emailAvailable === false) {
      setError("This email is already registered. Please use a different email or login.");
      return false;
    }

    const usernameCheck = authValidation.validateUsernameFormat(formData.username);
    if (!usernameCheck.isValid) {
      setError(usernameCheck.error);
      return false;
    }
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (passwordStrength.strength < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setError("");
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name");
      return false;
    }
    if (!formData.country) {
      setError("Please select your country");
      return false;
    }
    const phone = formData.phone.trim();
    const country = formData.country || "Ghana";
    if (!isValidPhoneForCountry(country, phone)) {
      const example = country === "Nigeria" ? "08012345678 or 2348012345678" : "0241234567 or 233241234567";
      setError(`Please enter a valid ${country} phone number (e.g., ${example})`);
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setError("");
    if (!formData.bio.trim()) {
      setError("Please add a short bio");
      return false;
    }
    if (!avatarFile && !avatarPreview) {
      setError("Please upload a profile picture or select a generic one");
      return false;
    }
    return true;
  };
  const validateForm = () => {
    setError("");
    // First & Last Name required
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name");
      return false;
    }

    if (!formData.country) {
      setError("Please select your country");
      return false;
    }

    // Phone required and must match selected country
    const phone = formData.phone.trim();
    const country = formData.country || "Ghana";
    if (!isValidPhoneForCountry(country, phone)) {
      const example = country === "Nigeria" ? "08012345678 or 2348012345678" : "0241234567 or 233241234567";
      setError(`Please enter a valid ${country} phone number (e.g., ${example})`);
      return false;
    }

    // Bio required
    if (!formData.bio.trim()) {
      setError("Please add a short bio");
      return false;
    }

    // Avatar required
    if (!avatarFile && !avatarPreview) {
      setError("Please upload a profile picture or select a generic one");
      return false;
    }
    if (!formData.email || !authValidation.validateEmailFormat(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (emailAvailable === false) {
      setError("This email is already registered. Please use a different email or login.");
      return false;
    }

    const usernameCheck = authValidation.validateUsernameFormat(formData.username);
    if (!usernameCheck.isValid) {
      setError(usernameCheck.error);
      return false;
    }
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (passwordStrength.strength < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // ======================
  // Form Submit
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: formData.email.toLowerCase().trim(),
        username: formData.username.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        country: formData.country || "Ghana",
        bio: formData.bio.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Upload avatar to Cloudinary (same flow as profile edit)
      let avatarUrl = avatarPreview; // Default to the preview (generic url)

      if (avatarFile) {
        try {
          const formDataCloud = new FormData();
          formDataCloud.append('file', avatarFile);
          formDataCloud.append('upload_preset', 'raid_avatars');
          formDataCloud.append('folder', 'avatars');

          const cloudName = 'drgz6qqo5';
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formDataCloud
          });
          const data = await res.json();
          if (!data.secure_url) throw new Error('Failed to upload avatar');
          avatarUrl = data.secure_url;
        } catch (uploadErr) {
          console.error('Error uploading avatar:', uploadErr);
          setError(uploadErr.message || 'Failed to upload avatar. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Save avatarUrl to user profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { avatarUrl, updatedAt: new Date() });

      await setDoc(doc(db, "userStats", user.uid), {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalEarnings: 0,
        winRate: 0,
        currentStreak: 0,
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // JSX
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full mt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-500 text-transparent bg-clip-text">
            Create Account
          </h1>
          <p className="text-gray-400">Join Ghana &amp; Nigeria's premier esports platform</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative">
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all z-20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-orange-500 rounded transition-all" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
            <span className="ml-3 text-xs text-gray-400">Step {currentStep} of {totalSteps}</span>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="your.email@example.com" className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" required disabled={isLoading} />
                    {emailChecking && (<div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>)}
                    {!emailChecking && emailAvailable === true && (<CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />)}
                    {!emailChecking && emailAvailable === false && (<AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />)}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Username *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" value={formData.username} onChange={(e) => handleUsernameChange(e.target.value)} placeholder="username" className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" required disabled={isLoading} />
                    {usernameChecking && (<div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>)}
                    {!usernameChecking && usernameAvailable === true && (<CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />)}
                    {!usernameChecking && usernameAvailable === false && (<AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />)}
                  </div>
                  {usernameError && (<p className="text-red-400 text-xs mt-1">{usernameError}</p>)}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" required disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-400">Password Strength:</span><span className={`text-xs font-semibold ${passwordStrength.textColor}`}>{passwordStrength.label}</span></div>
                      <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} /></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" required disabled={isLoading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => { if (validateStep1()) setCurrentStep(2); }} disabled={isLoading || emailChecking || usernameChecking} className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50">Next</button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" disabled={isLoading} required />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" disabled={isLoading} required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={isLoading}
                    required
                  >
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number (SMS-enabled) *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={formData.country === "Nigeria" ? "e.g., 08012345678 or 2348012345678" : "e.g., 0241234567 or 233241234567"}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Use a number that can receive SMS in {formData.country}.</p>
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setCurrentStep(1)} className="px-5 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white">Back</button>
                  <button type="button" onClick={() => { if (validateStep2()) setCurrentStep(3); }} className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white">Next</button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Short Bio *</label>
                  <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your gaming experience..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" disabled={isLoading} required />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Profile Picture *</label>
                  {avatarPreview ? (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-orange-500/60 bg-gray-900 flex-shrink-0">
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-gray-400">Looking good! You can replace it by choosing another file.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3">Upload a clear image of yourself or your gaming avatar.</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={isLoading}
                  // Not required because we can choose generic
                  />

                  <div className="mt-4">
                    <p className="block text-gray-300 text-sm font-medium mb-2">Or choose a generic avatar:</p>
                    <div className="flex flex-wrap gap-2">
                      {GENERIC_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleGenericAvatarSelect(url)}
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${avatarPreview === url ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                        >
                          <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover bg-gray-800" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button type="button" onClick={() => setCurrentStep(2)} className="px-5 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white">Back</button>
                  <button type="submit" disabled={isLoading || emailChecking || usernameChecking || emailAvailable === false || usernameAvailable === false || !formData.firstName.trim() || !formData.lastName.trim() || !formData.country || !formData.phone.trim() || !formData.bio.trim() || (!avatarFile && !avatarPreview)} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? (<div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Creating Account...</div>) : ("Create Account")}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
