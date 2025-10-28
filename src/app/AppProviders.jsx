"use client";

import { AuthProvider } from "./contexts/AuthContext"; // make sure path is correct

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
