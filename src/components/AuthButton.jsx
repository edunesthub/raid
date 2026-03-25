"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase"; // ✅ make sure this points to your firebase.js config
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track auth state in real time
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  if (loading) return <button>Loading...</button>;

  if (user) {
    return (
      <div>
        <span className="mr-3">Hi, {user.displayName}</span>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return <button onClick={handleGoogleSignIn}>Sign in with Google</button>;
}
