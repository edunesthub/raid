"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: userData?.username || firebaseUser.email.split('@')[0],
          contact: userData?.contact || '',
          avatarUrl: firebaseUser.photoURL || userData?.avatarUrl,
          firstName: userData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
          lastName: userData?.lastName || firebaseUser.displayName?.split(' ')[1] || '',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Don't navigate here - let splash screen handle it
      router.replace("/splash");
    } catch (error) {
      throw new Error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      router.replace("/auth/onboarding");
    } catch (error) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login"); // Changed from push to replace
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      throw new Error("Failed to send reset email");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    requestPasswordReset,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}