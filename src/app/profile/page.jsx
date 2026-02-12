"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters.js";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { Pencil, ChevronRight, LogOut, Settings, User, Trophy, Calendar } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [freshUser, setFreshUser] = useState(null);
  const router = useRouter();

  // Fetch fresh user data from Firestore to ensure latest profile changes
  const fetchFreshUserData = async (userId) => {
    if (!userId) return;
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setFreshUser(data);
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl);
      }
    } catch (e) {
      console.error('Error fetching fresh user data:', e);
      // Fallback to context user
      if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchFreshUserData(user.id);
      fetchUserTournaments();
    }
  }, [user?.id]);

  const fetchUserTournaments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "tournaments"),
        where("participants", "array-contains", user.id),
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-mobile min-h-screen flex items-center justify-center py-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-8">Please log in to view your profile.</p>
          <Link href="/auth/login" className="btn-raid inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const upcomingMatches = matches.filter(
    (m) => m.status === "upcoming" || m.status === "registration-open"
  );
  const recentMatches = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header with Avatar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/20 via-transparent to-transparent h-64"></div>

        <div className="relative container-mobile py-12">
          <div className="flex flex-col items-center">
            {/* Avatar display only */}
            <div className="relative mb-6">
              <div className="relative border-4 border-white/10 shadow-2xl rounded-full">
                <UserAvatar
                  user={{ ...user, ...freshUser }}
                  size="2xl"
                />

                {/* Pencil icon linking to edit profile */}
                <Link
                  href="/profile/edit"
                  className="absolute bottom-2 right-2 bg-black/70 border border-white/10 rounded-full p-2 shadow-lg hover:bg-orange-500 transition-all z-10"
                  aria-label="Edit profile"
                >
                  <Pencil className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>

            {/* User Info */}
            <h1 className="text-3xl font-bold text-white mb-2">{freshUser?.username || user?.username}</h1>
            <p className="text-gray-400 text-sm mb-1">{freshUser?.email || user?.email}</p>
            {(freshUser?.contact || user?.contact) && <p className="text-gray-500 text-sm">{freshUser?.contact || user?.contact}</p>}
          </div>
        </div>
      </div>

      <div className="container-mobile pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 -mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tournaments</p>
                <p className="text-4xl font-bold text-white">
                  {loading ? "..." : matches.length}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
            Quick Actions
          </h2>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden border border-white/5 shadow-xl">
            <Link
              href="/profile/edit"
              className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Edit Profile</p>
                  <p className="text-gray-500 text-sm">Update your information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>

            <Link
              href="/profile/change-password"
              className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-gray-500 text-sm">Update your security</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>

            <Link
              href="/profile/notifications"
              className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-500 text-sm">Manage preferences</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>

            <Link
              href="/profile/privacy"
              className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Privacy</p>
                  <p className="text-gray-500 text-sm">Control your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Tournaments */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
              Upcoming Tournaments
            </h2>
            <div className="space-y-3">
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-white/5 shadow-xl hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold">{m.name}</p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Upcoming
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <p>{m.date ? new Date(m.date).toDateString() : "TBD"}</p>
                  </div>
                  <p className="text-orange-400 font-medium">{m.game}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
              Recent Tournaments
            </h2>
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-white/5 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold">{m.name}</p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-400">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <p>{m.date ? new Date(m.date).toDateString() : "TBD"}</p>
                  </div>
                  <p className="text-orange-400 font-medium mb-2">{m.game}</p>
                  {m.placement && (
                    <p className="text-green-400 text-sm font-medium">{m.placement}</p>
                  )}
                  {m.earnings > 0 && (
                    <p className="text-gray-300 text-sm">
                      Earnings: {formatCurrency(m.earnings, m.currency || 'GHS')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-gray-400 mb-6">Join your first tournament to get started!</p>
            <Link href="/tournament" className="btn-raid inline-block">
              Browse Tournaments
            </Link>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-4 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
