"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  clearAllCaches, 
  unregisterServiceWorkers, 
  forceHardRefresh,
  getCacheSize,
  isPWA,
  getAppVersion
} from "@/utils/cacheUtils";

export default function DebugSettingsPage() {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [appVersion, setAppVersion] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 👇 New hydration-safe states
  const [pwaStatus, setPwaStatus] = useState(null);
  const [swSupported, setSwSupported] = useState(null);

  useEffect(() => {
    loadCacheInfo();
    loadAppVersion();

    // Run client-only checks after hydration
    if (typeof window !== "undefined") {
      setPwaStatus(isPWA());
      setSwSupported("serviceWorker" in navigator);
    }
  }, []);

  const loadCacheInfo = async () => {
    const info = await getCacheSize();
    setCacheInfo(info);
  };

  const loadAppVersion = async () => {
    const version = await getAppVersion();
    setAppVersion(version);
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    setMessage("");
    
    const success = await clearAllCaches();
    if (success) {
      setMessage("✅ Cache cleared successfully!");
      await loadCacheInfo();
    } else {
      setMessage("❌ Failed to clear cache");
    }
    setIsLoading(false);
  };

  const handleUnregisterSW = async () => {
    setIsLoading(true);
    setMessage("");
    
    const success = await unregisterServiceWorkers();
    setMessage(success ? "✅ Service workers unregistered!" : "❌ Failed to unregister service workers");
    setIsLoading(false);
  };

  const handleHardRefresh = async () => {
    setIsLoading(true);
    setMessage("🔄 Refreshing app...");
    await forceHardRefresh();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile" 
            className="text-orange-500 hover:text-orange-400 inline-flex items-center mb-4"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold">Debug & Settings</h1>
          <p className="text-gray-400 mt-2">App information and cache management</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-white">{message}</p>
          </div>
        )}

        {/* App Info */}
        <div className="card-raid p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">App Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-white font-mono">{appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Running as PWA:</span>
              <span className="text-white">
                {pwaStatus === null ? "..." : pwaStatus ? "Yes ✅" : "No (Browser)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Service Worker:</span>
              <span className="text-white">
                {swSupported === null ? "..." : swSupported ? "Supported ✅" : "Not Supported ❌"}
              </span>
            </div>
          </div>
        </div>

        {/* Cache Info */}
        {cacheInfo && (
          <div className="card-raid p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Cache Storage</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Used:</span>
                <span className="text-white">{cacheInfo.usage} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-white">{cacheInfo.quota} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Percentage:</span>
                <span className="text-white">{cacheInfo.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cacheInfo.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-raid p-6">
          <h2 className="text-xl font-bold mb-4">Cache Management</h2>
          <div className="space-y-4">
            <button
              onClick={handleClearCache}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Clear Cache"}
            </button>

            <button
              onClick={handleHardRefresh}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Hard Refresh App"}
            </button>

            <button
              onClick={handleUnregisterSW}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Unregister Service Worker"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Note:</strong> Clearing cache and unregistering service workers will remove all offline data. The app will need to redownload assets on next visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
