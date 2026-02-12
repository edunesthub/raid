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

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages that should hide navigation and footer completely
  const hideLayout = ["/welcome", "/auth/login", "/auth/signup", "/auth/onboarding", "/admin/login"].includes(pathname) || pathname.startsWith("/admin") || pathname.includes("/tournament/") && pathname.endsWith("/chat");
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
            {!hideLayout && <Navigation />}

            {/* Main Content Area */}
            <main
              className={`flex-1 ${!hideLayout ? 'pt-16 md:pt-16' : ''} ${!hideLayout ? 'pb-24 md:pb-4' : ''}`}
              style={{
                paddingTop: hideLayout ? '0' : undefined,
                paddingBottom: hideLayout ? '0' : undefined,
              }}
            >
              {children}
            </main>



            {/* Footer and Bottom Nav - only show on regular pages */}
            {!hideLayout && (
              <>
                <Footer />
                <div className="md:hidden">
                  <BottomNav />
                </div>
              </>
            )}
          </div>

          {/* <PWAInstallPrompt /> */}
          <UpdatePrompt />
          {!hideLayout && <ProfileCompletionPrompt hide={hideLayout} />}
          <OfflineLoader />
        </AppProviders>

        <Analytics />
      </body>
    </html>
  );
}