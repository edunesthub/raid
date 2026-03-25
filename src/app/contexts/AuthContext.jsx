"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Unsubscribe from previous snapshot listener if exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        // Set up real-time listener for user document
        const userRef = doc(db, "users", firebaseUser.uid);

        // Initial check and creation if missing
        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              username: firebaseUser.email.split('@')[0],
              username_lowercase: firebaseUser.email.split('@')[0].toLowerCase(),
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              avatarUrl: firebaseUser.photoURL || '',
              createdAt: serverTimestamp(),
              country: 'Ghana',
              walletBalance: 0,
              role: 'user', // default role
              onboardingComplete: false
            });
          }
        } catch (error) {
          console.error("Error checking/creating user profile:", error);
        }

        unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          const userData = docSnapshot.data();

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: userData?.username || firebaseUser.email.split('@')[0],
            contact: userData?.contact || userData?.phone || '',
            phone: userData?.phone || userData?.contact || '',
            bio: userData?.bio || '',
            // Use Firestore avatarUrl if available, otherwise firebase photoURL
            avatarUrl: userData?.avatarUrl || firebaseUser.photoURL,
            country: userData?.country || 'Ghana',
            firstName: userData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
            lastName: userData?.lastName || firebaseUser.displayName?.split(' ')[1] || '',
            role: userData?.role || 'user',
            walletBalance: userData?.walletBalance || 0,
          });
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching user profile snapshot:", error);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate directly to home after login
      router.replace("/");
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
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(error.message || "Failed to send reset email");
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