// src/utils/cacheUtils.js

/**
 * Clear all service worker caches
 */
export async function clearAllCaches() {
  if (typeof window === "undefined" || !("caches" in window)) return false;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log("[Cache] All caches cleared");
    return true;
  } catch (error) {
    console.error("[Cache] Failed to clear caches:", error);
    return false;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    console.log("[SW] All service workers unregistered");
    return true;
  } catch (error) {
    console.error("[SW] Failed to unregister service workers:", error);
    return false;
  }
}

/**
 * Force hard refresh - clears cache and reloads
 */
export async function forceHardRefresh() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  await clearAllCaches();

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
  }

  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/**
 * Get current cache size (approximate)
 */
export async function getCacheSize() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("caches" in window) ||
    !("storage" in navigator) ||
    !("estimate" in navigator.storage)
  ) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usageInMB = (estimate.usage / (1024 * 1024)).toFixed(2);
    const quotaInMB = (estimate.quota / (1024 * 1024)).toFixed(2);

    return {
      usage: usageInMB,
      quota: quotaInMB,
      percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    };
  } catch (error) {
    console.error("[Cache] Failed to get cache size:", error);
    return null;
  }
}

/**
 * Check if running as PWA
 */
export function isPWA() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Get app version from service worker
 */
export async function getAppVersion() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return "Unknown";
  }

  if (navigator.serviceWorker.controller) {
    return "v1.0.0"; // placeholder
  }

  return "Unknown";
}
