"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Trophy, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Leagues", href: "/leagues", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg z-50 flex justify-around py-3">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center transition-all duration-300"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive ? "bg-orange-500 scale-110" : "bg-gray-700/50"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors duration-300 ${
                  isActive ? "text-white" : "text-gray-300"
                }`}
              />
            </div>
            <span
              className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                isActive ? "text-orange-500" : "text-gray-300"
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
