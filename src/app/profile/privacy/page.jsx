"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function PrivacySettingsPage() {
  // ✅ Use static path (since file lives in /public/assets/)
  const raid1Logo = "/assets/raid1.svg";

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showSocialLinks: true,
    showTournamentHistory: true,
    allowClanInvites: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataSharing: false,
    analyticsTracking: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // ✅ Handlers
  const handleToggle = (key) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key, value) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save privacy settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reusable Components
  const ToggleItem = ({ toggleKey, title, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div className="flex-1">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(toggleKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-orange-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const SelectItem = ({ selectKey, title, description, value, options }) => (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="mb-3">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => handleSelect(selectKey, e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // ✅ Page Layout
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
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

          <h1 className="text-3xl font-bold text-white mb-2">Privacy Settings</h1>
          <p className="text-gray-400">
            Control your profile visibility and data sharing
          </p>
        </div>

        {/* Form */}
        <div className="card-raid p-8">
          {success && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 mb-6">
              <p className="text-green-400 text-sm">
                ✅ Privacy settings saved successfully!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Visibility */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Profile Visibility</h2>
              <SelectItem
                selectKey="profileVisibility"
                title="Who can see your profile"
                description="Control who can view your profile information"
                value={privacySettings.profileVisibility}
                options={[
                  { value: "public", label: "Everyone" },
                  { value: "friends", label: "Friends only" },
                  { value: "private", label: "Private" },
                ]}
              />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                <ToggleItem
                  toggleKey="showEmail"
                  title="Show Email Address"
                  description="Display your email on your profile"
                  enabled={privacySettings.showEmail}
                />
                <ToggleItem
                  toggleKey="showPhone"
                  title="Show Phone Number"
                  description="Display your phone number on your profile"
                  enabled={privacySettings.showPhone}
                />
                <ToggleItem
                  toggleKey="showSocialLinks"
                  title="Show Social Media Links"
                  description="Display your social media profiles"
                  enabled={privacySettings.showSocialLinks}
                />
              </div>
            </div>

            {/* Gaming Activity */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Gaming Activity</h2>
              <div className="space-y-3">
                <ToggleItem
                  toggleKey="showTournamentHistory"
                  title="Show Tournament History"
                  description="Display your tournament participation history"
                  enabled={privacySettings.showTournamentHistory}
                />
                <ToggleItem
                  toggleKey="showOnlineStatus"
                  title="Show Online Status"
                  description="Let others see when you're online"
                  enabled={privacySettings.showOnlineStatus}
                />
              </div>
            </div>

            {/* Social Features */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Social Features</h2>
              <div className="space-y-3">
                <ToggleItem
                  toggleKey="allowClanInvites"
                  title="Allow Clan Invites"
                  description="Let other players invite you to their clans"
                  enabled={privacySettings.allowClanInvites}
                />
                <ToggleItem
                  toggleKey="allowFriendRequests"
                  title="Allow Friend Requests"
                  description="Let other players send you friend requests"
                  enabled={privacySettings.allowFriendRequests}
                />
              </div>
            </div>

            {/* Data & Privacy */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Data & Privacy</h2>
              <div className="space-y-3">
                <ToggleItem
                  toggleKey="dataSharing"
                  title="Data Sharing"
                  description="Allow sharing of anonymized data for product improvement"
                  enabled={privacySettings.dataSharing}
                />
                <ToggleItem
                  toggleKey="analyticsTracking"
                  title="Analytics Tracking"
                  description="Allow tracking of your activity for analytics purposes"
                  enabled={privacySettings.analyticsTracking}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
