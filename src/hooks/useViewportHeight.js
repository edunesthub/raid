// src/hooks/useViewportHeight.js
"use client";

import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    // Function to set the actual viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Set on mount
    setVH();

    // Update on resize and orientation change
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    // Cleanup
    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);
}