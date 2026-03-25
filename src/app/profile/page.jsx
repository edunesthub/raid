"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { 
  Pencil, ChevronRight, LogOut, User, Trophy, 
  Calendar, MapPin, Phone, Settings, ShieldCheck, 
  LayoutDashboard, Gamepad, Wallet, History
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { getCountryFlag } from "@/utils/countries";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freshUser, setFreshUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchFreshUserData(user.id);
      fetchUserTournaments();
    }
  }, [user?.id]);

  const fetchFreshUserData = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) setFreshUser(docSnap.data());
    } catch (e) {
      console.error('Error fetching fresh user data:', e);
    }
  };

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
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 pt-24">
        <div className="glass-panel p-12 rounded-[2.5rem] text-center max-w-lg w-full">
          <div className="w-20 h-20 mx-auto mb-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">Transmission Blocked.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">Please authenticate to access your tactical profile</p>
          <Link href="/auth/login" className="btn-raid-v2 py-4 px-12 block text-center">
            <span className="text-sm font-black uppercase tracking-widest">Authorize Connection</span>
          </Link>
        </div>
      </div>
    );
  }

  const displayUser = freshUser || user;

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Persistent Identity */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
              {/* Profile Background Detail */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/10 to-transparent" />
              
              <div className="relative flex flex-col items-center">
                <div className="relative mb-8 group">
                  <div className="p-1 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 shadow-[0_0_50px_rgba(249,115,22,0.2)] group-hover:scale-105 transition-all duration-700">
                    <div className="bg-black rounded-full p-1">
                      <UserAvatar user={displayUser} size="2xl" />
                    </div>
                  </div>
                  <Link href="/profile/edit" className="absolute bottom-1 right-1 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-500 hover:text-white transition-all scale-100 hover:scale-110 active:scale-95 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <Pencil size={18} />
                  </Link>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                      {displayUser.username}
                    </h1>
                    <span className="text-2xl drop-shadow-lg" title={displayUser.country}>
                      {getCountryFlag(displayUser.country || 'Ghana')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">{displayUser.role || 'Player'}.V1</p>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <MapPin size={18} className="text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{displayUser.country || 'Ghana'}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <Calendar size={18} className="text-purple-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Joined {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}</span>
                  </div>
                </div>

                {displayUser.bio && (
                  <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative">
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-black border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-orange-500">Bio.v1</span>
                    <p className="text-gray-400 text-sm italic leading-relaxed">"{displayUser.bio}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-[2rem] text-center border-orange-500/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Tournaments</p>
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{matches.length}</h3>
              </div>
              <div className="glass-panel p-6 rounded-[2rem] text-center border-purple-500/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Earnings</p>
                <div className="flex justify-center items-end gap-1">
                  <span className="text-xs font-black text-green-500 mb-1 leading-none">GHS</span>
                  <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">0</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Data */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Dashboard Tabs (UX enhancement) */}
            <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
              <button className="flex items-center gap-3 px-6 py-3 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <LayoutDashboard size={14} /> Overview
              </button>
              <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all">
                <Wallet size={14} /> Financials
              </button>
              <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all">
                <History size={14} /> History
              </button>
            </div>

            {/* Tournament History Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Trophy className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Combat History</h2>
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">Official Tactical Data Feed</p>
                  </div>
                </div>
                <Link href="/tournament" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
                  Join New Battle →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 glass-panel rounded-[2rem] animate-pulse" />)}
                </div>
              ) : matches.length === 0 ? (
                <div className="glass-panel p-16 rounded-[3rem] text-center border-dashed border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gamepad className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-2 leading-none">Record Empty.</h3>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-10">No official tournament engagements detected</p>
                  <Link href="/tournament" className="btn-raid-v2 py-4 px-10 inline-block">
                    <span className="text-xs font-black uppercase tracking-widest">Enlist in Tournament</span>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {matches.map((m) => (
                    <Link
                      key={m.id}
                      href={`/tournament/${m.id}`}
                      className="glass-panel p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex items-center gap-6 flex-1 w-full">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                          <Trophy className="text-gray-500 group-hover:text-orange-500 transition-colors" size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">{m.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                              m.status === 'completed' ? 'border-white/5 bg-white/5 text-gray-500' : 'border-orange-500/30 bg-orange-500/10 text-orange-500'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                            <span className="flex items-center gap-2"><Calendar size={12}/>{new Date(m.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-white/40">{m.game}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                        {m.earnings > 0 && (
                          <div className="text-right">
                            <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Combat Prize</p>
                            <p className="text-lg font-black italic text-green-400 leading-none">{formatCurrency(m.earnings, m.currency || 'GHS')}</p>
                          </div>
                        )}
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all group-hover:translate-x-1">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Logout Engagement */}
            <div className="pt-12 border-t border-white/5 flex justify-center md:justify-start">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-500 hover:text-red-500 font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] transition-all group shadow-xl active:scale-95"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
