// src/hooks/useServiceWorker.js
"use client";

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // Clear old caches on first load to fix precache issues
    const clearOldCaches = async () => {
      if (!('caches' in window)) return;
      
      try {
        const cacheNames = await caches.keys();
        const now = new Date().getTime();
        
        // Keep only the most recent caches, delete everything older
        await Promise.all(
          cacheNames.map(name => {
            // Delete all precache-related caches to force fresh download
            if (name.includes('precache') || name.includes('next-data')) {
              console.log('[SW] Clearing old cache:', name);
              return caches.delete(name);
            }
          })
        );
      } catch (error) {
        console.error('[SW] Error clearing caches:', error);
      }
    };

    // Reload page when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[SW] New service worker activated, reloading page...');
        clearOldCaches().then(() => window.location.reload());
      }
    });

    // Register service worker
    const registerSW = async () => {
      try {
        // Clear old caches before registering
        await clearOldCaches();

        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for fresh SW file
        });
        setRegistration(reg);
        
        console.log('[SW] Service Worker registered:', reg);

        // Check for updates every 30 seconds
        setInterval(() => {
          console.log('[SW] Checking for updates...');
          reg.update().catch(err => console.error('[SW] Update check failed:', err));
        }, 30000);

        // Check for updates on visibility change (when user returns to app)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            console.log('[SW] App became visible, checking for updates...');
            reg.update().catch(err => console.error('[SW] Update check failed:', err));
          }
        });

        // Handle waiting service worker (update available)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          console.log('[SW] New service worker found, installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed but waiting to activate
              console.log('[SW] New version available!');
              setUpdateAvailable(true);
            }
          });
        });

        // If there's already a waiting worker, activate it
        if (reg.waiting) {
          console.log('[SW] Update already waiting, activating...');
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    registerSW();
  }, []);

  // Function to skip waiting and activate new service worker
  const updateServiceWorker = () => {
    if (registration?.waiting) {
      console.log('[SW] Sending SKIP_WAITING message to service worker');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { updateAvailable, updateServiceWorker };
}