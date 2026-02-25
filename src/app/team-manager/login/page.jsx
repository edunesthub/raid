"use client";
import { useState } from "react";
import { loginManager } from "@/services/teamService";
import { LogIn, Mail, Lock, Shield, Users, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamManagerLoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        try {
            const manager = await loginManager({ email: form.email, password: form.password });
            localStorage.setItem("managerEmail", manager.email);
            router.push("/team-manager/dashboard");
        } catch (err) {
            setMessage(err.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4 animate-fade-in text-center lg:text-left">
                        <div className="mb-0">
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-1">
                                Team <span className="text-orange-500">Portal</span>
                            </h1>
                            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase opacity-80">
                                Managed Access Dashboard
                            </p>
                        </div>

                        <div className="space-y-4 hidden lg:block text-left pt-2">
                            {[
                                { icon: Users, title: "Roster Control", desc: "Manage member recruitment and details." },
                                { icon: Shield, title: "Brand Identity", desc: "Update slogans and team profile pictures." },
                                { icon: Trophy, title: "Elite Standing", desc: "Visible on the global team directory." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                                        <item.icon className="text-orange-500" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-gray-500 text-[11px] leading-none">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.05)] animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Sign In</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="manager@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-gray-400">Password</label>
                                    <Link
                                        href="/team-manager/reset-password"
                                        className="text-[10px] font-bold uppercase tracking-widest text-orange-500/60 hover:text-orange-500 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-raid flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isLoading ? "Signing in..." : <><LogIn size={18} /> Sign In to Dashboard</>}
                            </button>
                        </form>

                        <div className="mt-8 text-center bg-black/30 p-4 rounded-2xl border border-gray-800">
                            <p className="text-gray-400 text-sm mb-2">New to the arena?</p>
                            <Link
                                href="/team-manager/signup"
                                className="text-orange-500 font-bold hover:text-orange-400 flex items-center justify-center gap-1 transition-colors"
                            >
                                <ArrowRight size={14} /> Create Manager Account
                            </Link>
                        </div>


                        {message && (
                            <div className="mt-6 p-4 rounded-xl text-center text-sm bg-red-500/10 text-red-500 border border-red-500/20">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
