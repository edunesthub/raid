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
import { Pencil, ChevronRight, LogOut, Settings, User, Trophy, Calendar, Zap, Shield } from "lucide-react";

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
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>

      {/* Header with Avatar */}
      <div className="relative pt-16 mb-12">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative container-mobile flex flex-col items-center">
          {/* Avatar display only */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-32 h-32 bg-black border-2 border-blue-500/30 overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
              {avatarUrl && typeof avatarUrl === "string" ? (
                <Image
                  src={avatarUrl}
                  alt="Profile Avatar"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-500 text-5xl font-black italic">
                    {(freshUser?.firstName || user?.firstName)?.charAt(0) || (freshUser?.email || user?.email)?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Pencil icon linking to edit profile */}
            <Link
              href="/profile/edit"
              className="absolute -bottom-2 -right-2 bg-blue-600 border border-blue-400 p-2.5 shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:bg-blue-500 transition-all z-10"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}
              aria-label="Edit profile"
            >
              <Pencil className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* User Info */}
          <div className="text-center">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-blue-400 transition-colors">
              {freshUser?.username || user?.username}
            </h1>
            <p className="text-blue-500/60 font-black uppercase tracking-[0.2em] text-[10px] mb-1">
              // OPERATIVE_ID: {user?.id?.slice(0, 12)}
            </p>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">
              {freshUser?.email || user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="container-mobile pb-32">
        {/* Stats Card */}
        <div className="relative group mb-12">
          <div className="absolute -inset-0.5 bg-blue-500/20 blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-black border border-blue-500/30 p-8 flex items-center justify-between" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
            <div>
              <p className="text-blue-500/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">TRIALS_COMMENCED</p>
              <p className="text-4xl font-black text-white italic tracking-tighter">
                {loading ? "..." : matches.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-blue-500/20"></span>
            Interface_Modules
            <span className="h-px flex-1 bg-blue-500/20"></span>
          </h2>

          <div className="grid gap-3">
            {[
              { href: "/profile/edit", icon: User, label: "Edit_Operative", sub: "Modify personal parameters", color: "blue" },
              { href: "/profile/change-password", icon: Settings, label: "Security_Key", sub: "Update access protocols", color: "purple" },
              { href: "/profile/notifications", icon: Zap, label: "Signal_Config", sub: "Manage pulse notifications", color: "green" },
              { href: "/profile/privacy", icon: Shield, label: "Data_Privacy", sub: "Control information uplink", color: "yellow" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-black/40 border border-white/5 p-5 flex items-center justify-between transition-all group-hover:border-blue-500/40" style={{ clipPath: 'polygon(1% 0, 100% 0, 100% 70%, 99% 100%, 0 100%, 0 30%)' }}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 bg-${action.color}-500/10 border border-${action.color}-500/20 flex items-center justify-center font-black transition-all group-hover:bg-${action.color}-500 group-hover:text-black`}>
                      <action.icon size={20} />
                    </div>
                    <div>
                      <p className="text-white font-black uppercase italic tracking-tighter text-sm group-hover:text-blue-400">
                        {action.label}
                      </p>
                      <p className="text-gray-600 text-[10px] font-black uppercase tracking-wide">
                        {action.sub}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tournaments */}
        {(upcomingMatches.length > 0 || recentMatches.length > 0) && (
          <div className="mb-12">
            <h2 className="text-[10px] font-black text-pink-500/60 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-pink-500/20"></span>
              Mission_Logs
              <span className="h-px flex-1 bg-pink-500/20"></span>
            </h2>

            <div className="grid gap-4">
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-black/40 border border-blue-500/20 p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all"
                  style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-black uppercase italic tracking-tighter text-lg">{m.name}</p>
                    <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest italic" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
                      SCHEDULED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-500/60 text-[10px] font-black uppercase tracking-widest mb-3">
                    <Calendar className="w-4 h-4" />
                    <p>{m.date ? new Date(m.date).toDateString() : "PENDING_DATE"}</p>
                  </div>
                  <p className="text-blue-400 font-black italic uppercase tracking-tight">// {m.game}</p>
                </div>
              ))}

              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-black/20 border border-white/5 p-6 relative overflow-hidden group"
                  style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-400 font-black uppercase italic tracking-tighter text-lg">{m.name}</p>
                    <span className="px-3 py-1 bg-gray-800 text-gray-500 text-[9px] font-black uppercase tracking-widest italic" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
                      ARCHIVED
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">
                    <Calendar className="w-4 h-4" />
                    <p>{m.date ? new Date(m.date).toDateString() : "UNK_DATE"}</p>
                  </div>
                  <p className="text-pink-500/50 font-black italic uppercase tracking-tight mb-3">// {m.game}</p>
                  {m.placement && (
                    <p className="text-cyan-400 text-xs font-black uppercase italic tracking-tighter">{m.placement}</p>
                  )}
                  {m.earnings > 0 && (
                    <p className="text-white font-black italic tracking-tighter text-sm mt-2">
                      CREDITS_REQUISITIONED: {formatCurrency(m.earnings, m.currency || 'GHS')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && !loading && (
          <div className="text-center py-20 bg-black/40 border border-white/5 mb-12" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-900 border border-white/5 flex items-center justify-center italic font-black text-gray-600 text-4xl" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
              ?
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">ZERO_RECORDS_DETECTED</h3>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-12 max-w-xs mx-auto">No prior combat data found in the local repository. Engage in trials to populate logs.</p>
            <Link href="/tournament" className="btn-raid px-12">
              Locate_Trials
            </Link>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-4 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase italic tracking-[0.2em] py-5 shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all active:scale-[0.98]"
          style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
        >
          <LogOut className="w-5 h-5" />
          Terminate_Session
        </button>
      </div>
    </div>
  );
}
