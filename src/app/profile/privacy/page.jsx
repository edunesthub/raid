"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Save, X, Check, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState({
    // Profile visibility
    profileVisibility: "public", // public, friends, private
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    
    // Gaming activity
    showTournamentHistory: true,
    showStats: true,
    showAchievements: true,
    
    // Social features
    allowClanInvites: true,
    allowFriendRequests: true,
    allowDirectMessages: true,
    
    // Data & tracking
    analyticsTracking: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const stored = localStorage.getItem("privacySettings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse privacy settings:", err);
      }
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(false);
    setError("");
  };

  const handleSelect = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      localStorage.setItem("privacySettings", JSON.stringify(settings));
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleItem = ({ settingKey, title, description, enabled, icon: Icon }) => (
    <div className="flex items-start justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all group">
      <div className="flex items-start gap-3 flex-1 pr-4">
        {Icon && (
          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-orange-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0 ${
          enabled 
            ? "bg-gradient-to-r from-orange-600 to-orange-500" 
            : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const SelectItem = ({ settingKey, title, description, value, options, icon: Icon }) => (
    <div className="p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all">
      <div className="flex items-start gap-3 mb-3">
        {Icon && (
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-purple-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => handleSelect(settingKey, e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const getVisibilityIcon = () => {
    switch (settings.profileVisibility) {
      case "public": return Eye;
      case "friends": return Shield;
      case "private": return EyeOff;
      default: return Eye;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <X className="w-5 h-5 mr-2" />
            Close
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privacy Settings</h1>
              <p className="text-gray-400 text-sm">Control your profile visibility and data</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-in">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-medium">Privacy settings saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Settings Categories */}
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Profile Visibility
            </h2>
            <div className="space-y-3">
              <SelectItem
                settingKey="profileVisibility"
                title="Who can see your profile"
                description="Control who has access to view your profile information"
                value={settings.profileVisibility}
                icon={getVisibilityIcon()}
                options={[
                  { value: "public", label: "🌍 Public - Everyone can see" },
                  { value: "friends", label: "👥 Friends Only" },
                  { value: "private", label: "🔒 Private - Only me" },
                ]}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              Contact Information
            </h2>
            <div className="space-y-3">
              <ToggleItem
                settingKey="showEmail"
                title="Show Email Address"
                description="Display your email on your public profile"
                enabled={settings.showEmail}
              />
              <ToggleItem
                settingKey="showPhone"
                title="Show Phone Number"
                description="Display your phone number on your profile"
                enabled={settings.showPhone}
              />
              <ToggleItem
                settingKey="showOnlineStatus"
                title="Show Online Status"
                description="Let others see when you're active on the platform"
                enabled={settings.showOnlineStatus}
              />
            </div>
          </div>

          {/* Gaming Activity */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              Gaming Activity
            </h2>
            <div className="space-y-3">
              <ToggleItem
                settingKey="showTournamentHistory"
                title="Tournament History"
                description="Display your tournament participation and results"
                enabled={settings.showTournamentHistory}
              />
              <ToggleItem
                settingKey="showStats"
                title="Gaming Statistics"
                description="Show your win rate, earnings, and performance metrics"
                enabled={settings.showStats}
              />
              <ToggleItem
                settingKey="showAchievements"
                title="Achievements & Badges"
                description="Display your earned achievements and awards"
                enabled={settings.showAchievements}
              />
            </div>
          </div>

          {/* Social Features */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Social Interactions
            </h2>
            <div className="space-y-3">
              <ToggleItem
                settingKey="allowClanInvites"
                title="Clan Invitations"
                description="Allow other players to invite you to their clans"
                enabled={settings.allowClanInvites}
              />
              <ToggleItem
                settingKey="allowFriendRequests"
                title="Friend Requests"
                description="Let other players send you friend requests"
                enabled={settings.allowFriendRequests}
              />
              <ToggleItem
                settingKey="allowDirectMessages"
                title="Direct Messages"
                description="Receive messages from other players"
                enabled={settings.allowDirectMessages}
              />
            </div>
          </div>

          {/* Data & Analytics */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Data & Analytics
            </h2>
            <div className="space-y-3">
              <ToggleItem
                settingKey="analyticsTracking"
                title="Analytics Tracking"
                description="Help us improve the platform by sharing anonymized usage data"
                enabled={settings.analyticsTracking}
                icon={Lock}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push("/profile")}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm flex items-start gap-2">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              Your privacy is important to us. We never share your personal data with 
              third parties without your explicit consent. Learn more in our{" "}
              <a href="/privacy-policy" className="underline hover:text-blue-300">
                Privacy Policy
              </a>.
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}