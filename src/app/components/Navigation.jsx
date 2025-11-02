"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext.jsx";


export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const publicNavItems = [
    { href: "/", label: "Tournaments", icon: "" },
    { href: "/clans", label: "Clans", icon: "" }, // Add Clans to public navigation
  ];

  const authenticatedNavItems = [
    { href: "/", label: "Home", icon: "" },
    { href: "/tournament", label: "Tournaments", icon: "" },
    { href: "/leaderboard", label: "Leaderboard", icon: "" },
    { href: "/about", label: "About", icon: "" },
    { href: "/contact", label: "Contact", icon: "" },

  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Don't show navigation on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
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
              <span className="text-white text-xl font-semibold">

              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === item.href
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <span className="text-sm">{item.icon}</span>
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
                  <Link href="/auth/signup" className="btn-raid-outline">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
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

            {/* Mobile Menu Trigger (profile avatar) */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-2">

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
                </div>
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

        {/* Mobile Menu Dropdown */}
        <div
          className={`${isMenuOpen ? "block" : "hidden"
            } border-t border-gray-800 bg-black/95`}
        >
          <div className="px-4 py-2 space-y-1">
            {!isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${pathname === item.href
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-white text-sm font-semibold">
                    {user?.firstName || user?.username || "User"}
                  </p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors w-full"
                >
                  <span className="text-lg"></span>
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors w-full text-left"
                >
                  <span className="text-lg"></span>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg"></span>
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gradient-to-r from-black to-orange-500 text-white hover:from-gray-900 hover:to-orange-600 transition-colors"
                >
                  <span className="text-lg"></span>
                  <span className="font-medium">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (modern pill-style) */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-4">
          <div className="max-w-md mx-auto px-4">
            <div className="rounded-2xl border border-gray-800/70 bg-black/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-xl">
              <div className="grid grid-cols-3">
                {authenticatedNavItems
                  .filter((item) => item.label !== "Deposit")
                  .map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center py-2.5 transition-colors ${isActive
                          ? "text-orange-500"
                          : "text-gray-400 hover:text-white"
                          }`}
                      >
                        <span className="text-xs font-semibold tracking-wide">
                          {item.label}
                        </span>
                        <span
                          className={`mt-1 h-1 w-8 rounded-full ${isActive ? "bg-orange-500" : "bg-transparent"
                            }`}
                        ></span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
