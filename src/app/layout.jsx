"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "./AppProviders";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineLoader from "../components/OfflineLoader";
import BottomNav from "../components/BottomNav";

// Google Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ✅ Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/assets/raid1.svg" type="image/svg+xml" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-100 min-h-screen`}
      >
        <AppProviders>
          <Navigation />

          {/* Main Content */}
          <main className="min-h-screen pt-16 pb-28 md:pb-4">{children}</main>

          {/* Background pattern */}
          <div className="fixed inset-0 -z-10 opacity-5 bg-esports-pattern" />

          <Footer />

          {/* Mobile-only Bottom Navbar */}
          <div className="md:hidden">
            <BottomNav />
          </div>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />

          {/* Offline Loader */}
          <OfflineLoader />
        </AppProviders>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
