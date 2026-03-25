"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/auth";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        // Set session cookie for the route proxy
        document.cookie = `session-token=${firebaseUser.uid}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        
        const userRef = doc(db, "users", firebaseUser.uid);

        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              username: firebaseUser.email?.split('@')[0] || 'user',
              username_lowercase: firebaseUser.email?.split('@')[0].toLowerCase() || 'user',
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              avatarUrl: firebaseUser.photoURL || '',
              createdAt: serverTimestamp(),
              country: 'Ghana',
              walletBalance: 0,
              role: 'user',
              onboardingComplete: false
            });
          }
        } catch (error) {
          console.error("Error checking/creating user profile:", error);
        }

        unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          const userData = docSnapshot.data();
          if (userData) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              username: userData.username || firebaseUser.email?.split('@')[0],
              contact: userData.contact || userData.phone || '',
              phone: userData.phone || userData.contact || '',
              bio: userData.bio || '',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL,
              country: userData.country || 'Ghana',
              firstName: userData.firstName || firebaseUser.displayName?.split(' ')[0] || '',
              lastName: userData.lastName || firebaseUser.displayName?.split(' ')[1] || '',
              role: userData.role || 'user',
              walletBalance: userData.walletBalance || 0,
            });
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching user profile snapshot:", error);
          setIsLoading(false);
        });
      } else {
        // Remove session cookie
        document.cookie = `session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error: any) {
      throw new Error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      router.replace("/auth/onboarding");
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset email");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    requestPasswordReset,
    logout,
    isLoading,
    error,
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