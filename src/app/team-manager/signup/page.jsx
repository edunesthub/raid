"use client";
import { useState } from "react";
import { registerManager } from "@/services/teamService";
import { UserPlus, Mail, Lock, User, Shield, Users, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamManagerSignupPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
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
            const manager = await registerManager(form);
            localStorage.setItem("managerEmail", manager.email);
            router.push("/team-manager/dashboard");
        } catch (err) {
            setMessage(err.message || "Registration failed.");
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
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-1 text-white">
                                Squad <span className="text-orange-500">Initiative</span>
                            </h1>
                            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase opacity-80">
                                Team Management Registration
                            </p>
                        </div>

                        <div className="space-y-4 hidden lg:block text-left pt-2">
                            {[
                                { icon: Users, title: "Squad Building", desc: "Recruit top talent from the community." },
                                { icon: Shield, title: "Team Control", desc: "Full authority over rosters and branding." },
                                { icon: Trophy, title: "Compete & Win", desc: "Join exclusive high-stakes tournaments." }
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
                            <h2 className="text-xl font-black uppercase tracking-tighter">Registration</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
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
                                {isLoading ? "Creating account..." : <><UserPlus size={18} /> Create Manager Account</>}
                            </button>
                        </form>

                        <div className="mt-8 text-center bg-black/30 p-4 rounded-2xl border border-gray-800">
                            <p className="text-gray-400 text-sm mb-2">Already leading a squad?</p>
                            <Link
                                href="/team-manager/login"
                                className="text-orange-500 font-bold hover:text-orange-400 flex items-center justify-center gap-1 transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Sign In
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
