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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/profile" className="inline-flex items-center justify-center mb-4">
            <Image
              src={raid1Logo}
              alt="RAID Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
          <p className="text-gray-400">Update your account security</p>
        </div>

        {/* Form */}
        <div className="card-raid p-8">
          {/* Success Message */}
          {success && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 text-sm font-semibold">
                  Password changed successfully!
                </p>
                <p className="text-green-300 text-xs mt-1">
                  Redirecting to profile...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.label === 'Weak' ? 'text-red-400' :
                      passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
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
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  disabled={isLoading || success}
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

            {/* Password Requirements */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium mb-2">
                Password Requirements:
              </h3>
              <ul className="text-gray-400 text-xs space-y-1">
                <li className={formData.newPassword.length >= 8 ? 'text-green-400' : ''}>
                  • At least 8 characters long
                </li>
                <li className={formData.newPassword !== formData.currentPassword && formData.newPassword ? 'text-green-400' : ''}>
                  • Different from current password
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'text-green-400' : ''}>
                  • Mix of uppercase and lowercase letters
                </li>
                <li className={/\d/.test(formData.newPassword) ? 'text-green-400' : ''}>
                  • At least one number
                </li>
                <li className={/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'text-green-400' : ''}>
                  • At least one special character
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full btn-raid ${(isLoading || success) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating Password...
                </div>
              ) : success ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Password Changed!
                </div>
              ) : (
                "Change Password"
              )}
            </button>
          </form>

          {/* Back to Profile */}
          <div className="text-center mt-6">
            <Link
              href="/profile"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}