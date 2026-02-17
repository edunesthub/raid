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
import { Pencil, ChevronRight, LogOut, Settings, User, Trophy, Calendar, MapPin, Info, HardDrive, Shield, Phone } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { getCountryFlag } from "@/utils/countries";

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-mobile min-h-screen flex items-center justify-center py-6 bg-black">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center backdrop-blur-xl border border-white/5">
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const upcomingMatches = matches.filter(
    (m) => m.status === "upcoming" || m.status === "registration-open"
  );
  const recentMatches = matches.filter((m) => m.status === "completed");

  const displayUser = freshUser || user;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="pt-12 pb-20 relative">
          <div className="container-mobile flex flex-col items-center">
            {/* Avatar Stack */}
            <div className="relative group mb-8">
              <div className="relative border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-full p-1 bg-gradient-to-tr from-orange-500 to-blue-500 scale-100 group-hover:scale-105 transition-all duration-500">
                <div className="bg-black rounded-full p-1">
                  <UserAvatar
                    user={displayUser}
                    size="2xl"
                  />
                </div>

                {/* Edit Button Overlay */}
                <Link
                  href="/profile/edit"
                  className="absolute bottom-2 right-2 bg-white text-black rounded-full p-2.5 shadow-xl hover:bg-orange-500 hover:text-white transition-all z-20"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>

              {/* Pulse effect */}
              <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            </div>

            {/* Profile Info Card */}
            <div className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              {/* Gloss effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {displayUser.username}
                  </h1>
                  <span className="text-4xl md:text-5xl drop-shadow-lg" title={displayUser.country || 'Ghana'}>
                    {getCountryFlag(displayUser.country || 'Ghana')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-gray-400 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{displayUser.country || 'Ghana'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-gray-400 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Joined {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}</span>
                  </div>
                  {displayUser.contact && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-gray-400 text-sm font-medium">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>{displayUser.contact}</span>
                    </div>
                  )}
                </div>

                {displayUser.bio && (
                  <div className="max-w-md bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-8 group-hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-2 mb-3 justify-center">
                      <div className="w-6 h-[1px] bg-gray-700" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60">Bio</span>
                      <div className="w-6 h-[1px] bg-gray-700" />
                    </div>
                    <p className="text-gray-300 italic leading-relaxed text-sm md:text-base px-2">
                      "{displayUser.bio}"
                    </p>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="container-mobile pb-24 space-y-12">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-orange-500" />
              Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/profile/edit"
                className="group flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-orange-500/10 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-black italic uppercase tracking-tighter">Edit Profile</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase">Update your information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-orange-500" />
              </Link>


            </div>
          </section>

          {/* Tournament Overview */}
          <section>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-orange-500" />
              Tournaments
            </h2>

            {loading ? (
              <div className="bg-white/5 rounded-[2.5rem] p-12 text-center border border-white/5 animate-pulse">
                <p className="text-gray-500 font-bold italic">Loading tournaments...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white/5 rounded-[2.5rem] p-12 text-center border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-gray-800" />
                </div>
                <h3 className="text-white font-black italic uppercase text-xl mb-2 tracking-tighter">No Tournaments Yet</h3>
                <p className="text-gray-500 text-sm mb-8 font-medium">You haven't joined any tournaments yet.</p>
                <Link href="/tournament" className="px-8 py-4 bg-orange-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-orange-600 transition-all inline-block">
                  Browse Tournaments
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/tournament/${m.id}`}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] hover:bg-white/[0.05] hover:border-orange-500/30 transition-all relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Trophy className="w-8 h-8 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{m.name}</p>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.status === 'completed'
                            ? 'bg-gray-800/50 text-gray-400 border-white/5'
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                            }`}>
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-xs font-bold uppercase tracking-wide">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(m.date).toLocaleDateString()}</span>
                          <span className="text-orange-500/50">•</span>
                          <span>{m.game}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center gap-4 relative z-10">
                      {m.earnings > 0 && (
                        <div className="text-right">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Prize Money</p>
                          <p className="text-xl font-black text-green-400 italic">+{formatCurrency(m.earnings, m.currency || 'GHS')}</p>
                        </div>
                      )}
                      <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Logout Section */}
          <div className="pt-12 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-10 py-5 flex items-center justify-center gap-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-500 hover:text-red-500 font-black uppercase text-xs tracking-[0.2em] rounded-3xl transition-all shadow-xl active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
