"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, cloneElement, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import NotificationBadge from "@/components/NotificationBadge";
import {
  Home,
  Trophy,
  BarChart2,
  Users,
  FileText,
  Phone,
  ChevronRight,
  ChevronDown,
  Bell,
  MessageCircle,
  Gamepad2,
  ShieldCheck,
  Crown,
  UserCheck,
} from "lucide-react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import UserAvatar from "@/components/UserAvatar";
import LeagueSection from "@/components/LeagueSection";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'compete' | 'community' | 'management' | null
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  const isPortalPage = pathname.startsWith("/admin") || pathname.startsWith("/host") || pathname.startsWith("/team-manager");
  const isAdmin = userData?.role === 'admin' || userData?.adminRole || user?.email === 'admin@raidarena.com';
  const isHost = userData?.role === 'host' || userData?.isHost;
  const isTeamManager = userData?.role === 'manager' || userData?.isManager || userData?.isTeamManager;

  useEffect(() => {
    const fetchTotalUnreads = async () => {
      if (!user?.id) return;

      try {
        const userId = user.id || user.uid;

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userId));
        const data = userDoc.data();
        setUserData(data);
        const isAdmin = data?.role === 'admin' || data?.adminRole || user.email === 'admin@raidarena.com';

        let tournamentIds = [];

        if (isAdmin) {
          const allTournamentsSnapshot = await getDocs(collection(db, "tournaments"));
          tournamentIds = allTournamentsSnapshot.docs
            .filter(doc => doc.data().status !== "completed")
            .map(doc => doc.id);
        } else {
          const participantsQuery = query(
            collection(db, "tournament_participants"),
            where("userId", "==", userId)
          );
          const participantsSnapshot = await getDocs(participantsQuery);
          const participantTournamentIds = [...new Set(
            participantsSnapshot.docs.map(doc => doc.data().tournamentId)
          )];

          // Filter out completed tournaments
          const tournamentsData = await Promise.all(
            participantTournamentIds.map(async (tid) => {
              const tDoc = await getDoc(doc(db, "tournaments", tid));
              return tDoc.exists() && tDoc.data().status !== "completed" ? tid : null;
            })
          );
          tournamentIds = tournamentsData.filter(t => t !== null);
        }

        // Count total unread messages across all tournaments
        let totalUnread = 0;
        for (const tournamentId of tournamentIds) {
          const lastRead = localStorage.getItem(`chat_last_read_${tournamentId}_${userId}`);
          const lastReadTimestamp = lastRead ? parseInt(lastRead) : 0;

          const messagesQuery = query(
            collection(db, "tournament_chats"),
            where("tournamentId", "==", tournamentId),
            where("createdAt", ">", new Date(lastReadTimestamp))
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          totalUnread += messagesSnapshot.docs.filter(doc => doc.data().senderId !== userId).length;
        }

        setTotalUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchTotalUnreads();

    // Listen for storage changes to update count
    const handleStorageChange = () => {
      fetchTotalUnreads();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      // Close active dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    if (isUserMenuOpen || activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, activeDropdown]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const navConfig = [
    { type: 'link', href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    {
      type: 'dropdown',
      id: 'compete',
      label: "Compete",
      icon: <Trophy className="w-5 h-5" />,
      children: [
        { href: "/tournament", label: "Tournaments", icon: <Trophy className="w-4 h-4" /> },
        { href: "/leagues", label: "Leagues", icon: <Gamepad2 className="w-4 h-4" /> },
        { href: "/leaderboard", label: "Leaderboard", icon: <BarChart2 className="w-4 h-4" /> },
      ]
    },
    {
      type: 'dropdown',
      id: 'community',
      label: "Community",
      icon: <Users className="w-5 h-5" />,
      children: [
        { href: "/chat", label: " Chat", icon: <MessageCircle className="w-4 h-4" />, badge: totalUnreadCount },
        { href: "/players", label: "Players", icon: <Users className="w-4 h-4" /> },
        { href: "/esports-teams", label: "Teams", icon: <Users className="w-4 h-4" /> },
      ]
    },
    ...(isAuthenticated && (isAdmin || isHost || isTeamManager) ? [{
      type: 'dropdown',
      id: 'management',
      label: "Management",
      icon: <ShieldCheck className="w-5 h-5" />,
      children: [
        { href: "/host", label: " Host Portal", icon: <Crown className="w-4 h-4" /> },
        { href: "/team-manager/dashboard", label: "Team Manager Portal", icon: <UserCheck className="w-4 h-4" /> },
      ]
    }] : []),
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  if (pathname.startsWith("/auth/")) return null;


  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/assets/raid1.svg"
                alt="Raid1Arena Logo"
                width={32}
                height={32}
                className="h-8 w-8 mr-2"
              />
            </Link>

            {/* Desktop Links - Right Aligned */}
            <div className="flex-1 flex items-center justify-end">
              <div className="flex items-center space-x-1" ref={dropdownRef}>
                {navConfig.map((item) => (
                  <div key={item.id || item.href} className="relative group">
                    {item.type === 'link' ? (
                      <Link
                        href={item.href}
                        className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${pathname === item.href
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                      </Link>
                    ) : (
                      <div className="relative group/dropdown">
                        <button
                          onMouseEnter={() => setActiveDropdown(item.id)}
                          onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                          className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${pathname.startsWith(item.href) || (item.children?.some(child => pathname === child.href))
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === item.id && (
                          <div
                            onMouseLeave={() => setActiveDropdown(null)}
                            className="absolute top-full right-0 mt-2 w-56 bg-[#0a0a0a]/90 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all uppercase tracking-[0.15em] border border-transparent ${pathname === child.href
                                  ? "bg-orange-500 text-white shadow-lg"
                                  : "text-gray-400 hover:text-white hover:bg-white/5"
                                  }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {cloneElement(child.icon, { className: "w-4 h-4" })}
                                  <span className="text-[10px] font-black">{child.label}</span>
                                </div>
                                {child.badge > 0 && (
                                  <span className="bg-orange-500 text-black text-[9px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-black border border-black/20">
                                    {child.badge > 99 ? '99+' : child.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Auth Section */}
                <div className="ml-6 pl-6 border-l border-white/10 flex items-center">
                  {isAuthenticated ? (
                    <div className="relative" ref={userMenuRef}>
                      <div className="flex items-center space-x-4">
                        <NotificationBadge />

                        <div className="relative">
                          <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center space-x-2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <UserAvatar
                              user={user}
                              size="xs"
                            />
                            <span className="text-[10px] opacity-30">▼</span>
                          </button>
                        </div>
                      </div>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-4 w-60 bg-[#0a0a0a]/90 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-5 py-4 border-b border-white/5 mb-2">
                            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                              {user?.firstName || user?.username || "RAID Player"}
                            </p>
                            <p className="text-gray-500 text-[10px] mt-2 truncate font-medium">{user?.email}</p>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all uppercase tracking-[0.2em]"
                          >
                            My Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-[10px] font-black text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all uppercase tracking-[0.2em]"
                          >
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                    >
                      Enter Arena
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* MOBILE HEADER */}
      {!isPortalPage && (
        <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black">
          <div className="px-4 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/raid1.svg"
                alt="RAID Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </Link>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <NotificationBadge />
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* MOBILE SIDEBAR */}
      {isMenuOpen && !isPortalPage && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {!isPortalPage && (
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-80 bg-black/70 backdrop-blur-xl border-r border-white/10 shadow-xl transform transition-transform duration-300 z-[100] flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="px-5 py-6 flex flex-col space-y-5 flex-grow overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                <Image src="/assets/raid1.svg" alt="Raid1 Logo" width={28} height={28} className="w-7 h-7" />
                <span className="text-white text-sm font-semibold tracking-wide">Raid</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-orange-400 text-xl font-semibold hover:text-orange-500"
              >
                ✕
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col space-y-3 mt-4">
              {navConfig.map((item) => {
                if (item.type === 'link') {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isActive
                        ? "bg-orange-500/20 border-orange-500 text-orange-400"
                        : "bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:text-orange-400"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-gray-500"}`} />
                    </Link>
                  );
                } else {
                  return (
                    <div key={item.id} className="flex flex-col space-y-2">
                      <div className="px-4 py-2 flex items-center space-x-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <div className="flex flex-col space-y-2 pl-2 border-l border-white/5 ml-6">
                        {item.children.map((child) => {
                          const isActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isActive
                                ? "bg-orange-500/20 border-orange-500 text-orange-400"
                                : "bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:text-orange-400"
                                }`}
                            >
                              <div className="flex items-center space-x-3">
                                {child.icon}
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">{child.label}</span>
                                  {child.badge > 0 && (
                                    <span className="bg-orange-500 text-black text-[9px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-black">
                                      {child.badge > 99 ? '99+' : child.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-gray-500"}`} />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              })}

              {/* Terms and Privacy moved to bottom of config implicitly or kept here */}
              <div className="border-t border-white/10 mt-6 pt-4 flex flex-col space-y-2">
                <Link href="/terms-of-service" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200">Terms of Service</Link>
                <Link href="/privacy-policy" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200">Privacy Policy</Link>
              </div>

            </div>
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="border-t border-white/10 px-5 py-4 bg-black/60">
              <div className="flex items-center space-x-3 mb-3">
                <UserAvatar
                  user={user}
                  size="sm"
                />
                <div>
                  <p className="text-white text-sm font-semibold">
                    {user?.firstName || user?.username || "User"}
                  </p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white mb-2"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-white/10 px-5 py-4 bg-black/60">
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}