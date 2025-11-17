"use client";

import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log("User choice:", choice.outcome);
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 p-4 bg-purple-600 text-white rounded-lg shadow-lg z-50 flex items-center gap-4 animate-slide-up">
      <span>Install RAID for the best experience</span>
      <button onClick={handleInstall} className="bg-white text-purple-600 px-3 py-1 rounded font-semibold">
        Install
      </button>
      <button onClick={() => setShowInstall(false)} className="text-white opacity-70 hover:opacity-100 ml-2">✕</button>
    </div>
  );
}
