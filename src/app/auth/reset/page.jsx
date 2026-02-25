"use client";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, ChevronLeft } from "lucide-react";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        <button
          onClick={() => router.back()}
          className="absolute left-6 top-8 text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center pt-4">
          <Link href="/" className="inline-block mb-6">
            <Image src="/assets/raid1.svg" alt="Logo" width={60} height={60} className="hover:scale-110 transition-transform duration-300" />
          </Link>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            {sent ? "Check Email" : "Reset Access"}
          </h2>
          <p className="mt-2 text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            {sent ? "Recovery instructions sent" : "Secure Password Recovery"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-green-500/10 border border-green-500/20 rounded-[2rem] p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                We've sent password reset instructions to <br />
                <span className="text-white font-bold">{email}</span>
              </p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all border border-white/5 text-xs"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs italic font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 text-xs flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : <><KeyRound size={16} /> Send Recovery Email</>}
              </button>

              <p className="text-center text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Please check your spam folder if you <br /> don't see the email within 2 minutes.
              </p>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/auth/login" className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}