"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === "admin@raidarena.com") {
        setAdmin({
          id: user.uid,
          email: user.email,
          name: user.displayName || "Admin User",
          role: "super_admin",
        });
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setAdmin(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { admin, loading, logout };
}
