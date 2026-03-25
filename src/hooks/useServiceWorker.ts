// src/hooks/useServiceWorker.ts
"use client";

import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      }).catch((error: any) => {
        if (error.message?.includes('404') && process.env.NODE_ENV === 'production') {
          console.warn('Service worker file not found. Custom PWA functionality may be limited.');
        } else {
          console.error('Service worker registration failed:', error);
        }
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { registration, updateAvailable, updateServiceWorker };
}