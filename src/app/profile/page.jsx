"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters.js";

const fakeMatches = [
  {
    id: "1",
    name: "CODM Battle Royale",
    game: "Call of Duty Mobile",
    date: "2024-09-15",
    status: "upcoming",
    placement: "N/A",
    earnings: 0,
  },
  {
    id: "2",
    name: "PUBG Mobile Squad",
    game: "PUBG Mobile",
    date: "2024-09-20",
    status: "upcoming",
    placement: "N/A",
    earnings: 0,
  },
  {
    id: "3",
    name: "FIFA Mobile Cup",
    game: "FIFA Mobile",
    date: "2024-09-10",
    status: "completed",
    placement: "1st Place",
    earnings: 3000,
  },
];

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setMatches(fakeMatches);
  }, []);

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/welcome"); // ✅ Redirect to welcome page after logout
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  if (!isAuthenticated) {
    return (
      <div className="container-mobile min-h-screen flex items-center justify-center py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
          <Link href="/auth/login" className="btn-raid">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return <p className="text-white">Loading profile...</p>;

  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const recentMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="container-mobile min-h-screen py-6 text-white">
      <div className="max-w-3xl mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-orange-500">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="Profile Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-black to-orange-500 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
          {user.contact && <p className="text-gray-400 text-sm">{user.contact}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="card-raid p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{matches.length}</p>
            <p className="text-gray-400 text-sm">Tournaments Played</p>
          </div>
        </div>

        {/* Matches */}
        <h2 className="text-xl font-bold mb-2">Upcoming Matches</h2>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map((m) => (
            <div key={m.id} className="card-raid p-4 mb-2">
              <p className="font-semibold">{m.name}</p>
              <p className="text-gray-400 text-sm">{new Date(m.date).toDateString()}</p>
              <p className="text-orange-400">{m.game}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mb-6">No upcoming matches</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-2">Recent Matches</h2>
        {recentMatches.length > 0 ? (
          recentMatches.map((m) => (
            <div key={m.id} className="card-raid p-4 mb-2">
              <p className="font-semibold">{m.name}</p>
              <p className="text-gray-400 text-sm">{new Date(m.date).toDateString()}</p>
              <p className="text-orange-400">{m.game}</p>
              <p className="text-green-400">{m.placement}</p>
              <p className="text-gray-300">
                {m.earnings > 0 && `Earnings: ${formatCurrency(m.earnings)}`}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mb-6">No recent matches</p>
        )}

        {/* Settings & Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            Settings & Actions
          </h2>
          <div className="card-raid p-4 space-y-2">
            <Link
              href="/profile/change-password"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Change Password</h3>
                <p className="text-gray-400 text-sm">Update your account security</p>
              </div>
              <span>→</span>
            </Link>
            <Link
              href="/profile/notifications"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Notification Preferences</h3>
                <p className="text-gray-400 text-sm">Manage your notification settings</p>
              </div>
              <span>→</span>
            </Link>
            <Link
              href="/profile/privacy"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Privacy Settings</h3>
                <p className="text-gray-400 text-sm">Control your profile visibility</p>
              </div>
              <span>→</span>
            </Link>
            <Link
  href="/profile/debug"
  className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
>
  <div>
    <h3 className="font-semibold">Debug & Cache Settings</h3>
    <p className="text-gray-400 text-sm">Clear cache and check app version</p>
  </div>
  <span>→</span>
</Link>

            {/* ✅ Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-semibold transition-all duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
