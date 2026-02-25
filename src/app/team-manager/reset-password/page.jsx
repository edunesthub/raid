"use client";
import { useState } from "react";
import { resetManagerPassword } from "@/services/teamService";
import { KeyRound, Mail, Lock, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [form, setForm] = useState({ email: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setIsError(false);

        if (form.newPassword !== form.confirmPassword) {
            setMessage("Passwords do not match");
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            await resetManagerPassword(form.email, form.newPassword);
            setMessage("Password updated successfully! Redirecting...");
            setTimeout(() => {
                router.push("/team-manager/login");
            }, 2000);
        } catch (err) {
            setMessage(err.message || "Failed to reset password.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.05)] animate-fade-in relative overflow-hidden mt-12">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="text-orange-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Reset Password</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Management Security</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Account Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="manager@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="••••••••"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2 text-xs"
                        >
                            {isLoading ? "Updating..." : <><RefreshCw size={16} /> Update Password</>}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-black/30 p-4 rounded-2xl border border-gray-800">
                        <Link
                            href="/team-manager/login"
                            className="text-gray-400 font-bold hover:text-white flex items-center justify-center gap-1 transition-colors text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </div>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest border ${isError
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                            }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
