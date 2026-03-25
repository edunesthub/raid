"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/app/contexts/AuthContext"; 
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { initializeStatusBar } from "@/utils/statusBar";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useAutoStatsUpdate } from "@/hooks/useAutoStatsUpdate";

/**
 * Component that uses Auth-dependent hooks.
 * Must be rendered as a child of AuthProvider.
 */
function ViewportProvider({ children }) {
  // non-auth hooks
  useViewportHeight();
  useServiceWorker();
  
  useEffect(() => {
    initializeStatusBar();
  }, []);

  // auth-dependent hooks
  useFriendRequests();
  useAutoStatsUpdate();
  
  return <>{children}</>;
}

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ViewportProvider>
        {children}
      </ViewportProvider>
    </AuthProvider>
  );
}