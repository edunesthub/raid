"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext.jsx";

const raid1Logo = "/assets/raid1.svg";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="scanline"></div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Image src={raid1Logo} alt="RAID Arena Logo" width={60} height={60} className="relative w-12 h-12 grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
            USER_<span className="text-blue-500">AUTH</span>
          </h1>
          <p className="text-blue-500/40 font-black uppercase tracking-[0.4em] text-[10px]">
            // ESTABLISHING_SECURE_LINK
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-black border border-blue-500/20 p-8 sm:p-10" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-600/10 border border-red-600/30 p-4 animate-shake" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)' }}>
                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">// ERROR: {error}</p>
                </div>
              )}

              <div>
                <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">ACCESS_ID (EMAIL)</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ENTER_ENCRYPTED_EMAIL"
                    className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                    style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-3">CYPHER_KEY (PASSWORD)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="ENTER_KEY_VECTOR"
                    className="w-full bg-blue-500/5 border border-blue-500/20 px-5 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase tracking-wider"
                    style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <Link href="/auth/reset" className="text-pink-500/60 hover:text-pink-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                  RECOVER_CREDENTIALS?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.2em] py-5 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-95 disabled:opacity-50"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white animate-spin"></div>
                    <span>SYNCING_DATA...</span>
                  </div>
                ) : (
                  "INITIALIZE_SESSION"
                )}
              </button>
            </form>

            <div className="text-center mt-10 space-y-4">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                NEW_RECRUIT?{" "}
                <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 font-black transition-colors">
                  ENLIST_NOW
                </Link>
              </p>

              <Link href="/" className="block text-gray-800 hover:text-gray-400 text-[9px] font-black uppercase tracking-[0.4em] transition-colors pt-4 border-t border-white/5 mx-10">
                ← REVERT_TO_ARENA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}