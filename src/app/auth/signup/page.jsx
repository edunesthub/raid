// src/app/auth/signup/page.jsx - Enhanced with username validation
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { authValidation } from "@/services/authValidation";

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
      setAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

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
    if (!avatarFile) {
      setError("Please upload a profile picture");
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
    if (!avatarFile) {
      setError("Please upload a profile picture");
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

        // Save avatarUrl to user profile
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { avatarUrl: data.secure_url, updatedAt: new Date() });
      } catch (uploadErr) {
        console.error('Error uploading avatar:', uploadErr);
        setError(uploadErr.message || 'Failed to upload avatar. Please try again.');
        setIsLoading(false);
        return;
      }

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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="scanline"></div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-2 uppercase italic tracking-tighter">
            ENLIST_<span className="text-pink-500">OPERATIVE</span>
          </h1>
          <p className="text-pink-500/40 font-black uppercase tracking-[0.4em] text-[10px]">
            // ESTABLISHING_NEW_NODE_LINK
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-blue-600 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-black border border-white/10 p-8 sm:p-12" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 95%, 98% 100%, 0 100%, 0 5%)' }}>

            {/* Steps Progress */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="text-pink-500/40 text-[10px] font-black uppercase tracking-[0.3em]">PROGRESS_TRACKER</span>
                <span className="text-white font-black italic text-xs tracking-widest bg-pink-500/10 px-3 py-1 border border-pink-500/20">
                  STEP_{currentStep} // 0{totalSteps}
                </span>
              </div>
              <div className="relative w-full bg-pink-900/10 border border-pink-500/20 h-2 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 1% 100%, 0 70%)' }}>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-500 shadow-[0_0_15px_rgba(255,0,255,0.5)] transition-all duration-1000"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/10 border border-red-600/30 p-4 mb-8 animate-shake" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">// ERROR: {error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">ACCESS_ID (EMAIL)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/30" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="ENTER_UPLINK_COMM"
                        className="w-full bg-blue-500/5 border border-blue-500/20 pl-12 pr-12 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                        style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                        required
                        disabled={isLoading}
                      />
                      {emailChecking && (<div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>)}
                      {!emailChecking && emailAvailable === true && (<CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />)}
                      {!emailChecking && emailAvailable === false && (<AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">CODE_NAME (USERNAME)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/30" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="ASSIGN_IDENTIFIER"
                        className="w-full bg-blue-500/5 border border-blue-500/20 pl-12 pr-12 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                        style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                        required
                        disabled={isLoading}
                      />
                      {usernameChecking && (<div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>)}
                      {!usernameChecking && usernameAvailable === true && (<CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />)}
                      {!usernameChecking && usernameAvailable === false && (<AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />)}
                    </div>
                    {usernameError && (<p className="text-red-400 text-[8px] font-black uppercase tracking-widest mt-2 ml-2">// {usernameError}</p>)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">CYPHER (PASSWORD)</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                          required
                          disabled={isLoading}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-blue-500 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                      {formData.password && (
                        <div className="mt-4 px-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 italic">STRENGTH_ANALYSIS:</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
                          </div>
                          <div className="w-full bg-gray-900 h-1"><div className={`h-1 transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} /></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-blue-500/60 text-[10px) font-black uppercase tracking-[0.3em] mb-3">VERIFY_CYPHER</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                          required
                          disabled={isLoading}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-blue-500 transition-colors">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-8">
                    <button
                      type="button"
                      onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                      disabled={isLoading || emailChecking || usernameChecking}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.2em] px-10 py-4 transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] active:scale-95 disabled:opacity-50"
                      style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                      NEXT_PHASE
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">GIVEN_NAME</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="JOHN"
                        className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                        style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">SURNAME</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="DOE"
                        className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                        style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">REGION_SELECTOR</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-black uppercase tracking-[0.2em] appearance-none"
                      style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                      disabled={isLoading}
                      required
                    >
                      <option value="Ghana" className="bg-black text-white">GHANA_NODE</option>
                      <option value="Nigeria" className="bg-black text-white">NIGERIA_NODE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">COMMLINK_SIGNAL (PHONE)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={formData.country === "Nigeria" ? "ENTER_SIGNAL [080...]" : "ENTER_SIGNAL [024...]"}
                      className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                      style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2 ml-2 italic">// REQUIRED_FOR_PRIZE_DISTRIBUTION_SYSTEM</p>
                  </div>

                  <div className="flex justify-between pt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-gray-700 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                    >
                      ← REVERT_PHASE
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (validateStep2()) setCurrentStep(3); }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.2em] px-10 py-4 transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] active:scale-95"
                      style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                      NEXT_PHASE
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">OPERATIVE_BIO</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="DESCRIBE_COMBAT_EXPERIENCE"
                      className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                      style={{ clipPath: 'polygon(0 0, 98% 0, 100% 10%, 100% 100%, 2% 100%, 0 90%)' }}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">AVATAR_UPLINK</label>
                    <div className="bg-blue-500/5 border border-dashed border-blue-500/20 p-6 flex flex-col items-center justify-center relative group-hover:border-blue-500/40 transition-all" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
                      {avatarPreview ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative w-24 h-24 border-2 border-blue-500 p-1" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
                            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">// VISUAL_SIG_ESTABLISHED</p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 border-2 border-blue-500/20 flex items-center justify-center mx-auto mb-4" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
                            <User className="w-6 h-6 text-blue-500/30" />
                          </div>
                          <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest leading-relaxed">UPLOAD_OPERATIVE_IMAGE_FOR_CLEARANCE</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-gray-700 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                    >
                      ← REVERT_PHASE
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || emailChecking || usernameChecking || emailAvailable === false || usernameAvailable === false || !formData.firstName.trim() || !formData.lastName.trim() || !formData.country || !formData.phone.trim() || !formData.bio.trim() || !avatarFile}
                      className="bg-pink-600 hover:bg-pink-500 text-white font-black italic uppercase tracking-[0.2em] px-12 py-5 transition-all shadow-[0_0_30px_rgba(255,0,255,0.4)] active:scale-95 disabled:opacity-40"
                      style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white animate-spin"></div>
                          <span>ENCRYPTING...</span>
                        </div>
                      ) : (
                        "FINALIZE_ENLISTMENT"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-12 text-center pt-8 border-t border-white/5">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                ALREADY_ENLISTED?{" "}
                <Link href="/auth/login" className="text-pink-500 hover:text-pink-400 font-black transition-colors ml-2">
                  RESUME_ACCESS
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
