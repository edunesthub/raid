"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateCredentials, generateFakeTokens } from "@/data/fakeUsers";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state on first render
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userData = localStorage.getItem("userData");

        if (!accessToken || !userData) {
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        setUser(user);
      } catch (err) {
        console.error("Auth check failed:", err);
        // Clear invalid data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fakeUser = validateCredentials(email, password);

      if (!fakeUser) {
        throw new Error("Invalid email or password");
      }

      const { accessToken, refreshToken } = generateFakeTokens(fakeUser);

      const userData = {
        id: fakeUser.id,
        email: fakeUser.email,
        username: fakeUser.username,
        avatarUrl: fakeUser.avatarUrl,
        firstName: fakeUser.firstName,
        lastName: fakeUser.lastName,
        role: fakeUser.role,
      };

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userData", JSON.stringify(userData));

      setUser(userData);
      router.push("/");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("userData");

    if (!refreshToken || !userData) {
      logout();
      return;
    }

    try {
      const user = JSON.parse(userData);
      const { accessToken } = generateFakeTokens({
        id: user.id,
        email: user.email,
        password: "",
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || "user",
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("accessToken", accessToken);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const logout = async () => {
    try {
      // In a real app, call logout API here
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      router.push("/auth/login");
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate successful request (replace with API call in a real app)
    } catch (error) {
      throw new Error("Failed to send reset email");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    requestPasswordReset,
    logout,
    isLoading,
    // Remove setUser unless explicitly needed by consumers
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