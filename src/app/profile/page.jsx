"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters.js";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Pencil } from "lucide-react"; // 🖊️ import icon

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) fetchUserTournaments();
  }, [user]);

  const fetchUserTournaments = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "tournaments"),
        where("participants", "array-contains", user.uid),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      const tournaments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatches(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-mobile min-h-screen flex items-center justify-center py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Please log in to view your profile.
          </p>
          <Link href="/auth/login" className="btn-raid">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return <p className="text-white">Loading profile...</p>;

  const upcomingMatches = matches.filter(
    (m) => m.status === "upcoming" || m.status === "registration-open"
  );
  const recentMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="container-mobile min-h-screen py-6 text-white">
      <div className="max-w-3xl mx-auto">
{/* Avatar + Details */}
<div className="flex flex-col items-center mb-6">
  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-orange-500">
    {user.avatarUrl ? (
      <Image
        src={user.avatarUrl}
        alt="Profile Avatar"
        fill
        className="object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-r from-black to-orange-500 flex items-center justify-center">
        <span className="text-white text-3xl font-bold">
          {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
        </span>
      </div>
    )}
  </div>

{/* Username + Pencil */}
<div className="relative inline-block">
  <h1 className="text-3xl font-bold">{user.username}</h1>
  <Link
    href="/profile/edit"
    className="absolute -top-2 -right-7 p-1 rounded-full hover:bg-orange-600/20 transition-colors"
  >
    <Pencil size={20} className="text-orange-400 hover:text-orange-500" />
  </Link>
</div>


  <p className="text-gray-400 text-sm">{user.email}</p>
  {user.contact && (
    <p className="text-gray-400 text-sm">{user.contact}</p>
  )}
</div>


        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="card-raid p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {loading ? "..." : matches.length}
            </p>
            <p className="text-gray-400 text-sm">Tournaments Played</p>
          </div>
        </div>

        {/* Matches */}
        <h2 className="text-xl font-bold mb-2">Upcoming Matches</h2>
        {loading ? (
          <p className="text-gray-400 mb-6">Loading matches...</p>
        ) : upcomingMatches.length > 0 ? (
          upcomingMatches.map((m) => (
            <div
              key={m.id}
              className="card-raid p-4 mb-2 border border-orange-500/30 rounded-xl hover:border-orange-500/60 transition-all duration-200"
            >
              <p className="font-semibold">{m.name}</p>
              <p className="text-gray-400 text-sm">
                {m.date ? new Date(m.date).toDateString() : "TBD"}
              </p>
              <p className="text-orange-400">{m.game}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mb-6">No upcoming matches</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-2">Recent Matches</h2>
        {recentMatches.length > 0 ? (
          recentMatches.map((m) => (
            <div
              key={m.id}
              className="card-raid p-4 mb-2 border border-orange-500/30 rounded-xl hover:border-orange-500/60 transition-all duration-200"
            >
              <p className="font-semibold">{m.name}</p>
              <p className="text-gray-400 text-sm">
                {m.date ? new Date(m.date).toDateString() : "TBD"}
              </p>
              <p className="text-orange-400">{m.game}</p>
              {m.placement && (
                <p className="text-green-400">{m.placement}</p>
              )}
              {m.earnings > 0 && (
                <p className="text-gray-300">
                  Earnings: {formatCurrency(m.earnings)}
                </p>
              )}
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
              href="/profile/edit"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Edit Profile</h3>
                <p className="text-gray-400 text-sm">
                  Update your account information
                </p>
              </div>
              <span>→</span>
            </Link>
            <Link
              href="/profile/change-password"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Change Password</h3>
                <p className="text-gray-400 text-sm">
                  Update your account security
                </p>
              </div>
              <span>→</span>
            </Link>

            <Link
              href="/profile/notifications"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Notification Preferences</h3>
                <p className="text-gray-400 text-sm">
                  Manage your notification settings
                </p>
              </div>
              <span>→</span>
            </Link>

            <Link
              href="/profile/privacy"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Privacy Settings</h3>
                <p className="text-gray-400 text-sm">
                  Control your profile visibility
                </p>
              </div>
              <span>→</span>
            </Link>

            <Link
              href="/profile/debug"
              className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold">Debug & Cache Settings</h3>
                <p className="text-gray-400 text-sm">
                  Clear cache and check app version
                </p>
              </div>
              <span>→</span>
            </Link>

            {/* Logout */}
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
