"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, cloneElement, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext.jsx";
import NotificationBadge from "@/components/NotificationBadge";
import {
  Home,
  Trophy,
  BarChart2,
  Users,
  FileText,
  Phone,
  ChevronRight,
  Bell,
  MessageCircle,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import LeagueSection from "@/components/LeagueSection";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/leagues", label: "Leagues", icon: <Trophy className="w-5 h-5" /> },
    { href: "/players", label: "Players", icon: <Users className="w-5 h-5" /> },
    { href: "/host", label: "Host Portal", icon: <Users className="w-5 h-5" /> },
    { href: "/esports-teams", label: "Esports Teams", icon: <Users className="w-5 h-5" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <BarChart2 className="w-5 h-5" /> },
    { href: "/about", label: "About", icon: <FileText className="w-5 h-5" /> },
    { href: "/contact", label: "Contact", icon: <Phone className="w-5 h-5" /> },
  ];

  const footerItems = [
    { href: "/terms-of-service", label: "Terms of Service" },
    { href: "/privacy-policy", label: "Privacy Policy" },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  if (pathname.startsWith("/auth/")) return null;


  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6">
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
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 ${pathname === item.href
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </Link>
                ))}

                {/* Auth Section */}
                <div className="ml-6 pl-6 border-l border-white/10 flex items-center">
                  {isAuthenticated ? (
                    <div className="relative">
                      <div className="flex items-center space-x-4">
                        <NotificationBadge />

                        <div className="relative" ref={userMenuRef}>
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
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
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

      {/* MOBILE SIDEBAR */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

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
            {navItems.map((item) => {
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
                  <ChevronRight
                    className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-gray-500"
                      }`}
                  />
                </Link>
              );
            })}


            {/* Footer Links */}
            <div className="border-t border-white/10 mt-6 pt-4 flex flex-col space-y-2">
              {footerItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${pathname === item.href
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
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
    </>
  );
}