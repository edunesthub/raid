"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ adjust path if your file is in /src/contexts/AuthContext.jsx

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
