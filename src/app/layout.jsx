"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "./AppProviders";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineLoader from "../components/OfflineLoader";
import UpdatePrompt from "@/components/UpdatePrompt"; 
import BottomNav from "../components/BottomNav";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = ["/welcome",  "/auth/login", "/auth/signup", "/auth/onboarding", "/admin/login"].includes(pathname) || pathname.startsWith("/admin");

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RAID ARENA" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/raid1.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="icon" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" sizes="512x512" href="/icon-512.png" />
        <title>Raid Esports Platform</title>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-100 overflow-x-hidden`}>
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            
            {!hideLayout && <Navigation />}

            <main className="flex-1">
              {children}
            </main>

            {!hideLayout && (
              <div className="md:hidden">
                <BottomNav />
              </div>
            )}
          </div>

          <PWAInstallPrompt />
          <UpdatePrompt />
          <OfflineLoader />
        </AppProviders>

        <Analytics />
      </body>
    </html>
  );
}