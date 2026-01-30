"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NotificationPreferencesPage() {
  // ✅ Correct way: just use static path for public assets
  const raid1Logo = "/assets/raid1.svg";

  const [preferences, setPreferences] = useState({
    tournamentUpdates: true,
    tournamentReminders: true,
    tournamentResults: true,
    clanInvites: true,
    clanMessages: true,
    promotionalEmails: false,
    pushNotifications: true,
    smsNotifications: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // ✅ Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("notificationPreferences");
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse stored preferences:", err);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem(
        "notificationPreferences",
        JSON.stringify(preferences)
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationItem = ({ prefKey, title, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div className="flex-1">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(prefKey)}
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-400">
            Manage how you receive notifications
          </p>
        </div>

        {/* Form */}
        <div className="card-raid p-8">
          {success && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 mb-6">
              <p className="text-green-400 text-sm">
                Preferences saved successfully!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Tournament Notifications */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Tournament Notifications
              </h2>
              <div className="space-y-3">
                <NotificationItem
                  prefKey="tournamentUpdates"
                  title="Tournament Updates"
                  description="Get notified about tournament status changes"
                  enabled={preferences.tournamentUpdates}
                />
                <NotificationItem
                  prefKey="tournamentReminders"
                  title="Tournament Reminders"
                  description="Reminders before tournaments start"
                  enabled={preferences.tournamentReminders}
                />
                <NotificationItem
                  prefKey="tournamentResults"
                  title="Tournament Results"
                  description="Notifications when tournament results are available"
                  enabled={preferences.tournamentResults}
                />
              </div>
            </div>

            {/* Clan Notifications */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Clan Notifications
              </h2>
              <div className="space-y-3">
                <NotificationItem
                  prefKey="clanInvites"
                  title="Clan Invites"
                  description="Notifications when you receive clan invitations"
                  enabled={preferences.clanInvites}
                />
                <NotificationItem
                  prefKey="clanMessages"
                  title="Clan Messages"
                  description="Notifications for clan messages and requests"
                  enabled={preferences.clanMessages}
                />
              </div>
            </div>

            {/* Marketing Notifications */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Marketing & Promotions
              </h2>
              <NotificationItem
                prefKey="promotionalEmails"
                title="Promotional Emails"
                description="Special offers and promotional content"
                enabled={preferences.promotionalEmails}
              />
            </div>

            {/* Delivery Methods */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Delivery Methods
              </h2>
              <div className="space-y-3">
                <NotificationItem
                  prefKey="pushNotifications"
                  title="Push Notifications"
                  description="In-app and browser notifications"
                  enabled={preferences.pushNotifications}
                />
                <NotificationItem
                  prefKey="smsNotifications"
                  title="SMS Notifications"
                  description="Text message notifications (charges may apply)"
                  enabled={preferences.smsNotifications}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => router.push("/profile")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>

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
