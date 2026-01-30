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
    <div className="group relative transition-all duration-300">
      <div className="absolute -inset-0.5 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-center justify-between p-5 bg-black/40 border border-white/5 transition-all group-hover:border-blue-500/30" style={{ clipPath: 'polygon(1% 0, 100% 0, 100% 80%, 99% 100%, 0 100%, 0 20%)' }}>
        <div className="flex-1">
          <h3 className="text-white font-black uppercase italic tracking-tighter text-sm group-hover:text-blue-400">{title}</h3>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{description}</p>
        </div>
        <button
          onClick={() => handleToggle(prefKey)}
          className={`relative inline-flex h-6 w-12 items-center transition-all duration-300 ${enabled ? "bg-blue-600 shadow-[0_0_15px_rgba(0,243,255,0.4)]" : "bg-gray-800"
            }`}
          style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
        >
          <span
            className={`inline-block h-4 w-4 bg-white transition-transform duration-300 ${enabled ? "translate-x-7 shadow-[0_0_10px_white]" : "translate-x-1"
              }`}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>
      <div className="container-mobile py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
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
              Signal <span className="text-blue-500">Config</span>
            </h1>
            <p className="text-blue-500/40 font-black uppercase tracking-[0.3em] text-[10px]">
              // MANAGE_UPLINK_PROTOCOLS
            </p>
          </div>

          {/* Form */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500/10 blur-sm opacity-30"></div>
            <div className="relative bg-black border border-blue-500/20 p-8 sm:p-10" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
              {success && (
                <div className="bg-blue-600/10 border border-blue-600/30 p-4 mb-8 flex items-center justify-between" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
                  <p className="text-blue-400 text-xs font-black uppercase tracking-widest italic animate-pulse">
                    PROTOCOLS_SYNCHRONIZED_SUCCESSFULLY
                  </p>
                  <div className="w-2 h-2 bg-blue-500 animate-ping"></div>
                </div>
              )}

              <div className="space-y-12">
                {/* Tournament Notifications */}
                <div>
                  <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                    <span className="w-2 h-2 bg-blue-500"></span>
                    Tourney_Flux
                  </h2>
                  <div className="space-y-4">
                    <NotificationItem
                      prefKey="tournamentUpdates"
                      title="Uplink Updates"
                      description="Monitor operational status shifts"
                      enabled={preferences.tournamentUpdates}
                    />
                    <NotificationItem
                      prefKey="tournamentReminders"
                      title="Sync Reminders"
                      description="Pre-combat synchronization alerts"
                      enabled={preferences.tournamentReminders}
                    />
                    <NotificationItem
                      prefKey="tournamentResults"
                      title="Data Results"
                      description="Final combat analysis reports"
                      enabled={preferences.tournamentResults}
                    />
                  </div>
                </div>

                {/* Clan Notifications */}
                <div>
                  <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                    <span className="w-2 h-2 bg-pink-500"></span>
                    Faction_Uplink
                  </h2>
                  <div className="space-y-4">
                    <NotificationItem
                      prefKey="clanInvites"
                      title="Faction Requests"
                      description="Incoming recruitment signals"
                      enabled={preferences.clanInvites}
                    />
                    <NotificationItem
                      prefKey="clanMessages"
                      title="Comm_Burst"
                      description="Encoded faction-wide transmissions"
                      enabled={preferences.clanMessages}
                    />
                  </div>
                </div>

                {/* Marketing Notifications */}
                <div>
                  <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                    <span className="w-2 h-2 bg-purple-500"></span>
                    Corp_Feed
                  </h2>
                  <NotificationItem
                    prefKey="promotionalEmails"
                    title="Corp Incentives"
                    description="Redistributed credit opportunities"
                    enabled={preferences.promotionalEmails}
                  />
                </div>

                {/* Delivery Methods */}
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                    <span className="w-2 h-2 bg-white"></span>
                    Uplink_Nodes
                  </h2>
                  <div className="space-y-4">
                    <NotificationItem
                      prefKey="pushNotifications"
                      title="Direct Stream"
                      description="Bypassing central terminal buffer"
                      enabled={preferences.pushNotifications}
                    />
                    <NotificationItem
                      prefKey="smsNotifications"
                      title="Secure SMS"
                      description="External network pulse (Credit cost applies)"
                      enabled={preferences.smsNotifications}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex-1 bg-gray-900 border border-white/10 hover:border-white/30 text-gray-500 font-black uppercase italic tracking-widest py-4 transition-all"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    ABORT_SYNC
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-widest py-4 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    {isLoading ? "EXECUTING..." : "COMMIT_CHANGES"}
                  </button>
                </div>
              </div>

              {/* Back to Profile */}
              <div className="text-center mt-12">
                <Link
                  href="/profile"
                  className="text-blue-500/40 hover:text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] transition-colors"
                >
                  [ ACCESS_LOCAL_REPOS ]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
