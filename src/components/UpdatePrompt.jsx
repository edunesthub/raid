"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";

export default function UpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!updateAvailable) return null;

  const handleUpdate = () => {
    updateServiceWorker();
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl shadow-2xl p-4 border-2 border-orange-400 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm">Update Available!</h3>
              <p className="text-xs text-white/90">A new version is ready</p>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg"
          >
            Update Now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}