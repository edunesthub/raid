"use client";

import { useEffect, useState } from "react";

export default function OfflineLoader() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // initial check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-black/80 p-6 rounded-2xl text-center border border-white/10 shadow-xl w-72 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-semibold">You are offline</p>
        <p className="text-gray-300 text-sm">
          Check your connection and try again.
        </p>
      </div>
    </div>
  );
}
