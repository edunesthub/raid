"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { AuthProvider } from "@/app/contexts/AuthContext"; 
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { initializeStatusBar } from "@/utils/statusBar";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useAutoStatsUpdate } from "@/hooks/useAutoStatsUpdate";

function HookWrapper({ children }) {
  // Non-auth dependent
  useViewportHeight();
  useServiceWorker();
  
  useEffect(() => {
    initializeStatusBar();
  }, []);

  // Auth dependent
  useFriendRequests();
  useAutoStatsUpdate();
  
  return <>{children}</>;
}

export default function GlobalProviders({ children }) {
  return (
    <AuthProvider>
      <HookWrapper>
        {children}
      </HookWrapper>
    </AuthProvider>
  );
}
