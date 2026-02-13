"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "./AppProviders";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineLoader from "../components/OfflineLoader";
import UpdatePrompt from "@/components/UpdatePrompt";
import ProfileCompletionPrompt from "@/components/ProfileCompletionPrompt";
import BottomNav from "../components/BottomNav";
import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from "@/components/Footer";
import LeagueSection from "@/components/LeagueSection";
import Link from "next/link";
import { Home, Trophy, Users, BarChart2 } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages that should hide navigation completely
  const hideNav = ["/welcome", "/auth/login", "/auth/signup", "/auth/onboarding", "/admin/login"].includes(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/team-chat") ||
    pathname.startsWith("/league-chat") ||
    (pathname.includes("/tournament/") && pathname.endsWith("/chat"));

  // Pages that should hide footer
  const hideFooter = hideNav;
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RAID ARENA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/raid1.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="icon" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" sizes="512x512" href="/icon-512.png" />
        <title>Raid Esports Platform</title>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-100 h-full overflow-x-hidden`}
        style={{
          minHeight: "100vh",
          minHeight: "100dvh",
          height: "100%",
        }}
      >
        <AppProviders>
          <div className="flex flex-col h-full min-h-screen">
            {/* Navigation - only show on regular pages */}
            {!hideNav && <Navigation />}

            {/* Main Content Area */}
            <div className={`flex flex-1 ${!hideNav ? 'pt-16' : ''}`}>
              {/* Desktop Sidebar - Persistent Navigation */}
              {!hideNav && (
                <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-gray-800 bg-black/50 backdrop-blur-xl overflow-y-auto z-30">
                  <nav className="p-4 flex flex-col space-y-2">
                    {/* The navigation items are imported and shared, but for desktop sidebar we might want a specific list */}
                    {/* For now, I'll use a simple list that matches the user's focus */}
                    <Link href="/" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === "/" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                      <Home className="w-5 h-5" />
                      <span className="font-semibold">Home</span>
                    </Link>
                    <Link href="/tournament" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === "/tournament" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Tournaments</span>
                    </Link>
                    <Link href="/leagues" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === "/leagues" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Leagues</span>
                    </Link>
                    <Link href="/esports-teams" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === "/esports-teams" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Esports Teams</span>
                    </Link>
                    <Link href="/leaderboard" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${pathname === "/leaderboard" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                      <BarChart2 className="w-5 h-5" />
                      <span className="font-semibold">Leaderboard</span>
                    </Link>
                  </nav>
                </aside>
              )}
              <main
                className={`flex-1 ${!hideNav ? 'lg:pl-64' : ''} ${!hideNav ? 'pb-24 md:pb-4' : ''}`}
                style={{
                  paddingTop: hideNav ? '0' : undefined,
                  paddingBottom: hideNav ? '0' : undefined,
                }}
              >
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>

            {/* Footer and Bottom Nav - only show on regular pages */}
            {!hideFooter && (
              <>
                <div className={`${!hideNav ? 'lg:pl-64' : ''}`}>
                  <Footer />
                </div>
                <div className="md:hidden">
                  <BottomNav />
                </div>
              </>
            )}
          </div>

          {/* <PWAInstallPrompt /> */}
          <UpdatePrompt />
          {!hideNav && <ProfileCompletionPrompt hide={hideNav} />}
          <OfflineLoader />
        </AppProviders>

        <Analytics />
      </body>
    </html>
  );
}