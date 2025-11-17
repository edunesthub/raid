// src/app/auth/signup/page.jsx - Enhanced with username validation
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { authValidation } from "@/services/authValidation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  
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

  // ======================
  // Form Validation
  // ======================
  const validateForm = () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
          <p className="text-gray-400">Join Ghana's premier esports platform</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading}
                />
                {emailChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!emailChecking && emailAvailable === true && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
                {!emailChecking && emailAvailable === false && (
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading}
                />
                {usernameChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!usernameChecking && usernameAvailable === true && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
                {!usernameChecking && usernameAvailable === false && (
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                )}
              </div>
              {usernameError && (
                <p className="text-red-400 text-xs mt-1">{usernameError}</p>
              )}
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>


            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password Strength:</span>
                    <span className={`text-xs font-semibold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                emailChecking ||
                usernameChecking ||
                emailAvailable === false ||
                usernameAvailable === false
              }
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
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
