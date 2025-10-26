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
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Global Metadata
export const metadata = {
  metadataBase: new URL("https://raid-esports.vercel.app"),
  title: "RAID - Competitive Mobile Gaming Platform",
  description:
    "Africa's premier mobile-first esports platform. Join tournaments, win cash prizes, and get instant payouts through Mobile Money.",
  keywords: [
    "Esports",
    "Mobile Gaming",
    "Tournaments",
    "Africa Gaming",
    "Cash Prizes",
    "Mobile Money",
    "Competitive Gaming",
    "RAID Platform",
  ],
  authors: [{ name: "RAID Team" }],
  openGraph: {
    title: "RAID - Competitive Mobile Gaming Platform",
    description:
      "Join Africa's premier mobile gaming platform. Compete in tournaments, win cash prizes, and get instant payouts through Mobile Money.",
    url: "https://raid-esports.vercel.app",
    siteName: "RAID",
    images: [
      {
        url: "/assets/og-raid.png",
        width: 1200,
        height: 630,
        alt: "RAID OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [{ url: "/assets/raid1.svg", type: "image/svg+xml" }],
  },
};

// ✅ Viewport config
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-100 min-h-screen`}
      >
        <AppProviders>
          <Navigation />

          <main className="min-h-screen pt-16 pb-20 md:pb-4">{children}</main>

          {/* Background pattern */}
          <div className="fixed inset-0 -z-10 opacity-5 bg-esports-pattern" />

          <Footer />

          <BottomNav />

          <PWAInstallPrompt />

          <OfflineLoader />
        </AppProviders>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
