"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/tournament", label: "Tournaments", icon: <Trophy className="w-5 h-5" /> },
    { href: "/chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
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
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
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

            {/* Links */}
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 transition-all duration-300 relative group ${pathname === item.href
                      ? "text-blue-400"
                      : "text-gray-400 hover:text-blue-300"
                    }`}
                >
                  <div className={`transition-transform duration-300 ${pathname === item.href ? "scale-110" : "group-hover:scale-110"}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold tracking-widest text-xs uppercase">{item.label}</span>
                  {pathname === item.href && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
                  )}
                </Link>
              ))}

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    {/* ✅ NEW: NotificationBadge Component */}
                    <NotificationBadge />

                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 overflow-hidden flex items-center justify-center bg-blue-500 shadow-[0_0_10px_rgba(0,243,255,0.5)] border border-blue-300/50" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
                        {user?.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover"
                          />
                        ) : (
                          <span className="text-black text-sm font-bold">
                            {user?.firstName?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">▼</span>
                    </button>
                  </div>

                  <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0f] border border-blue-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
                    <div className="px-4 py-2 border-b border-blue-500/20">
                      <p className="text-blue-400 text-sm font-bold uppercase tracking-tighter">
                        {user?.firstName || user?.username || "User"}
                      </p>
                      <p className="text-gray-500 text-[10px] break-all">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-pink-500 hover:bg-pink-500/10 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
              )}
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
              className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400"
              style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}
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
              className="text-pink-500 text-xl font-bold hover:text-pink-400 glitch-hover"
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
                  className={`flex items-center justify-between px-4 py-3 border transition-all ${isActive
                      ? "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[inset_0_0_10px_rgba(0,243,255,0.1)]"
                      : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-blue-300"
                    }`}
                  style={{ clipPath: 'polygon(0 0, 95% 0, 100% 20%, 100% 100%, 5% 100%, 0 80%)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={isActive ? "text-blue-400" : "text-gray-500"}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-gray-600"
                      }`}
                  />
                </Link>
              );
            })}

            {/* ✅ Add Notifications Link for Mobile */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${pathname === "/notifications"
                    ? "bg-orange-500/20 border-orange-500 text-orange-400"
                    : "bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:text-orange-400"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium text-sm">Notifications</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 ${pathname === "/notifications" ? "text-orange-400" : "text-gray-500"
                    }`}
                />
              </Link>
            )}

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
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-black to-orange-500">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </span>
                )}
              </div>
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