"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, ChevronLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

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

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Arena</span>
        </Link>

        {/* Login Card */}
        <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">
              Welcome <span className="text-orange-500">Back.</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sign in to your RAID account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Password</label>
                <Link href="/auth/reset" className="text-[10px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-raid-v2 py-5 flex items-center justify-center gap-3 relative group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-black uppercase tracking-widest">Processing...</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-black uppercase tracking-widest">Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              No account?{" "}
              <Link href="/auth/signup" className="text-orange-500 hover:text-orange-400 transition-colors ml-1">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Credits or Terms */}
        <p className="text-center mt-8 text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">
          RAID Arena © {new Date().getFullYear()} • All Rights Reserved
        </p>
      </div>
    </div>
  );
}