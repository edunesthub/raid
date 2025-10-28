"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../lib/firebase";

export default function SplashScreen() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (user) {
          router.replace("/");
        } else {
          router.replace("/welcome");
        }
        setTimeout(() => setIsChecking(false), 100);
      }, 2000);
    });

    return () => unsubscribe();
  }, [router]);

  if (!isChecking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-orange-900">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* App Icon */}
        <div className="relative w-40 h-40 animate-bounce-slow">
          <img
            src="/icon-512.png"
            alt="RAID Arena"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* App Name */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white tracking-wider">
            RAID ARENA
          </h1>
          <p className="text-orange-400 text-sm font-medium">
            Mobile Esports Platform
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex space-x-2 mt-8">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.3s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}