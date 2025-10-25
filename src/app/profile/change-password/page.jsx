"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext.jsx";
import Link from "next/link";
import Image from "next/image";

export default function ChangePasswordPage() {
  // ✅ Use public path instead of importing
  const raid1Logo = "/assets/raid1.svg";

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (formData.email === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API
      setSuccess(true);
      setFormData({ email: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => router.push("/profile"), 2000);
    } catch {
      setError("Failed to change password. Please try again.");
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
          {success && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 mb-6">
              <p className="text-green-400 text-sm">
                Password changed successfully! Redirecting...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                placeholder="Enter your new password"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm your new password"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-gray-300 text-sm font-medium mb-2">
                Password Requirements:
              </h3>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Must be different from current password</li>
                <li>• Use a combination of letters and numbers</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-raid ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating Password...
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
