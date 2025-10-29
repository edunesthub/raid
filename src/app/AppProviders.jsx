"use client";

import { AuthProvider } from "./contexts/AuthContext"; 
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useServiceWorker } from "@/hooks/useServiceWorker";

function ViewportProvider({ children }) {
  useViewportHeight();
  useServiceWorker();
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