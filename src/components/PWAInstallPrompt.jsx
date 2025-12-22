"use client";

import { useEffect, useState } from "react";
import { Download, X, Zap } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show in dev mode for testing
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        setDeferredPrompt({ prompt: () => {}, userChoice: Promise.resolve({ outcome: "accepted" }) });
        setShowInstall(true);
      }, 2000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log("User choice:", choice.outcome);
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowInstall(false);
      setDeferredPrompt(null);
      setIsClosing(false);
    }, 300);
  };

  if (!showInstall) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-30'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isClosing ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl overflow-hidden max-w-sm w-[calc(100vw-32px)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Install RAID</h3>
              <p className="text-orange-100 text-sm">Get the app experience</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 bg-orange-500">
            <p className="text-white text-sm leading-relaxed mb-6">
              Install RAID on your device for faster access and the best mobile experience.
            </p>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Lightning-fast performance</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Full-screen gaming</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-orange-600 font-bold py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                Install
              </button>
              <button
                onClick={handleClose}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-orange-600/50 text-center">
            <p className="text-orange-100 text-xs">Works on iOS, Android & Web</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
