// Update: src/app/admin/hooks/useAdminAuth.jsx

"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        // Redirect to admin login if not authenticated
        if (!loading && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, loading]);

  const logout = async () => {
    try {
      await signOut(auth);
      setAdmin(null);
      router.replace('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { admin, loading, logout };
}