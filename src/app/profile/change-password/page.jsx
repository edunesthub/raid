"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext.jsx";
import Link from "next/link";
import Image from "next/image";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ChangePasswordPage() {
  const raid1Logo = "/assets/raid1.svg";

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (error) setError("");
  };

  const validatePassword = () => {
    if (!formData.currentPassword) {
      setError("Please enter your current password");
      return false;
    }

    if (!formData.newPassword) {
      setError("Please enter a new password");
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError("New password must be different from current password");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }

    // Check password strength
    if (passwordStrength.strength < 2) {
      setError("Password is too weak. Please use a stronger password with letters, numbers, and symbols");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error("No user is currently logged in");
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, formData.newPassword);

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err) {
      console.error("Password change error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        setError("New password is too weak");
      } else if (err.code === "auth/requires-recent-login") {
        setError("For security, please log out and log in again before changing your password");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later");
      } else {
        setError(err.message || "Failed to change password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>
      <div className="container-mobile py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/profile" className="inline-block group mb-8">
              <div className="relative p-3 bg-black border border-blue-500/20 shadow-[0_0_15px_rgba(0,243,255,0.1)] group-hover:border-blue-500/50 transition-all" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                <Image
                  src={raid1Logo}
                  alt="RAID Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </Link>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
              Security <span className="text-blue-500">Key</span>
            </h1>
            <p className="text-blue-500/40 font-black uppercase tracking-[0.3em] text-[10px]">
              // UPDATE_ACCESS_PROTOCOLS
            </p>
          </div>

          {/* Form */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500/10 blur-sm opacity-30"></div>
            <div className="relative bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>

              {/* Messages */}
              {success && (
                <div className="bg-blue-600/10 border border-blue-600/30 p-4 mb-8 flex items-center justify-between" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 animate-pulse" />
                    <div>
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest italic">PROTOCOLS_UPDATED</p>
                      <p className="text-blue-500/50 text-[8px] font-bold uppercase">Redirecting_to_terminal...</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 animate-ping"></div>
                </div>
              )}

              {error && (
                <div className="bg-pink-600/10 border border-pink-600/30 p-4 mb-8 flex items-start gap-3" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
                  <AlertCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">SYSTEM_ERROR: {error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Current Password */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">CURRENT_AUTH_TOKEN</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-blue-500/40" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/20 pl-12 pr-12 py-4 text-white font-black italic uppercase tracking-widest focus:outline-none focus:border-blue-500/60 transition-all text-sm"
                      style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                      required
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/40 hover:text-blue-400 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">NEW_CIPHER_STRING</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-blue-500/40" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/20 pl-12 pr-12 py-4 text-white font-black italic uppercase tracking-widest focus:outline-none focus:border-blue-500/60 transition-all text-sm"
                      style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                      required
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/40 hover:text-blue-400 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-4 bg-black/40 border border-white/5 p-3" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">CIPHER_INTEGRITY:</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${passwordStrength.label === 'Weak' ? 'text-pink-500' :
                            passwordStrength.label === 'Medium' ? 'text-yellow-500' :
                              'text-blue-400'
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-900 h-1 relative overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${passwordStrength.label === 'Weak' ? 'bg-pink-500 shadow-[0_0_10px_rgba(255,0,255,0.5)]' :
                              passwordStrength.label === 'Medium' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.5)]' :
                                'bg-blue-500 shadow-[0_0_10px_rgba(0,243,255,0.5)]'
                            }`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">REPLICATE_CIPHER</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-blue-500/40" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/20 pl-12 pr-12 py-4 text-white font-black italic uppercase tracking-widest focus:outline-none focus:border-blue-500/60 transition-all text-sm"
                      style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                      required
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/40 hover:text-blue-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-blue-900/10 border border-blue-500/10 p-5 space-y-3" style={{ clipPath: 'polygon(0 10%, 5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}>
                  <h3 className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-1">COMPLEXITY_PROTOCOL:</h3>
                  {[
                    { met: formData.newPassword.length >= 8, label: "LEN >= 08_CHAR" },
                    { met: formData.newPassword !== formData.currentPassword && formData.newPassword, label: "STR_ID != CUR_ID" },
                    { met: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword), label: "MIXED_CASE_BITS" },
                    { met: /\d/.test(formData.newPassword), label: "NUMERIC_INJECT" },
                    { met: /[^a-zA-Z0-9]/.test(formData.newPassword), label: "SYM_CORE_INJECT" },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 ${req.met ? 'bg-blue-500 shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'bg-gray-800'}`}></div>
                      <span className={`text-[8px] font-black tracking-widest ${req.met ? 'text-blue-400 italic' : 'text-gray-600'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-[0.2em] py-5 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all active:scale-[0.98] ${(isLoading || success) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      RECODING...
                    </div>
                  ) : success ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      RECODE_COMPLETE
                    </div>
                  ) : (
                    "COMMIT_RECODE"
                  )}
                </button>
              </form>

              {/* Back to Profile */}
              <div className="text-center mt-10">
                <Link
                  href="/profile"
                  className="text-blue-500/40 hover:text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] transition-colors"
                >
                  [ ABORT_DATA_SHIFT ]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}