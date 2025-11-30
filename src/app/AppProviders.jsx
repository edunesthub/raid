"use client";

import { AuthProvider } from "./contexts/AuthContext"; 
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useEffect } from "react";
import { initializeStatusBar } from "@/utils/statusBar";

function ViewportProvider({ children }) {
  useViewportHeight();
  useServiceWorker();
  
  useEffect(() => {
    initializeStatusBar();
  }, []);
  
  return <>{children}</>;
}

export default function AppProviders({ children }) {
  return (
    <ViewportProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ViewportProvider>
  );
}