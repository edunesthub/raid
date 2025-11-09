"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Home,
  Trophy,
  BarChart2,
  Users,
  FileText,
  Phone,
  ChevronRight,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/tournament", label: "Tournaments", icon: <Trophy className="w-5 h-5" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <BarChart2 className="w-5 h-5" /> },
    { href: "/about", label: "About", icon: <FileText className="w-5 h-5" /> },
    { href: "/contact", label: "Contact", icon: <Phone className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  // Don't show navigation on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

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

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <div
                    className={`h-4 w-4 ${
                      pathname === item.href ? "text-white" : "text-orange-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Authentication Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/notifications"
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white relative"
                      aria-label="Notifications"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </Link>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-black to-orange-500">
                        {user?.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {user?.firstName?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">▼</span>
                    </button>
                  </div>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-lg">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold">
                          {user?.firstName || user?.username || "User"}
                        </p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/raid1.svg"
                alt="RAID Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </Link>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Link
                  href="/notifications"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white relative"
                  aria-label="Notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-full hover:bg-gray-800"
                aria-label="Open menu"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-black to-orange-500">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="w-9 h-9 object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Side Menu */}
<div
  className={`fixed top-0 left-0 h-full w-80 bg-black/70 backdrop-blur-xl border-r border-white/10 shadow-xl transform transition-transform duration-300 z-[100] ${
    isMenuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
          <div className="px-5 py-6 flex flex-col space-y-5">
            {/* Header with Logo & Close */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2"
              >
                <Image
                  src="/assets/raid1.svg"
                  alt="Raid1 Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <span className="text-white text-sm font-semibold tracking-wide">
                  Raid
                </span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-orange-400 text-xl font-semibold hover:text-orange-500 transition-all"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-3 mt-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-orange-500/20 border-orange-500 text-orange-400"
                        : "bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:text-orange-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-5 w-5 ${
                          isActive ? "text-orange-400" : "text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        isActive ? "text-orange-400" : "text-gray-500"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Login Button if not authenticated */}
            {!isAuthenticated && (
              <div className="mt-auto">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full block text-center px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {!isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-4 flex justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </>
  );
}
