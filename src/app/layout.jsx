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
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = ["/welcome", "/auth/login", "/auth/signup", "/splash"].includes(pathname);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-100`}
        style={{
          minHeight: "100vh",
          minHeight: "100dvh",
          paddingTop: "env(safe-area-inset-top, 0)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        <AppProviders>
          {!hideLayout && <Navigation />}
          <main className="min-h-screen pt-16 pb-28 md:pb-4">{children}</main>
          {!hideLayout && (
            <>
              <Footer />
              <div className="md:hidden">
                <BottomNav />
              </div>
            </>
          )}
          <PWAInstallPrompt />
          <OfflineLoader />
        </AppProviders>

        <Analytics />
      </body>
    </html>
  );
}
