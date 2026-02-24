"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function HostLogin() {
    const [formData, setFormData] = useState({
        hostName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Check for error parameters in URL (from useHostAuth redirects)
    useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const errorParam = params.get('error');
            if (errorParam === 'account_terminated') {
                setError("This account has been terminated by an administrator.");
            } else if (errorParam === 'account_pending') {
                setError("Your host account is pending approval or has been rejected.");
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;

            // Check if user is a host and verify host name
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (userData && userData.role === "host") {
                // Check status
                if (userData.status === 'terminated') {
                    await auth.signOut();
                    setError("This account has been terminated by an administrator.");
                    return;
                }

                if (userData.status !== 'approved') {
                    await auth.signOut();
                    setError("Your host account is pending approval by the RAID team.");
                    return;
                }

                // Verify host name (case insensitive for user convenience but usually should match)
                if (userData.hostName?.toLowerCase() === formData.hostName.toLowerCase()) {
                    router.push("/host");
                } else {
                    await auth.signOut();
                    setError("Host name does not match our records for this account.");
                }
            } else {
                await auth.signOut();
                setError("This account is not registered as a host.");
            }
        } catch (err) {
            setError("Invalid credentials. Please check your email and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-gray-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                <Link
                    href="/"
                    className="absolute left-6 top-8 text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </Link>

                <div className="text-center pt-4">
                    <Link href="/" className="inline-block mb-6">
                        <Image src="/assets/raid1.svg" alt="Logo" width={60} height={60} className="hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Host Login</h2>
                    <p className="mt-2 text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Manage your tournaments and leagues</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs italic font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Host Name</label>
                            <input
                                type="text"
                                placeholder="Enter Host Name"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.hostName}
                                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 mt-6 text-xs"
                    >
                        {loading ? "Logging in..." : "Login to Portal"}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        New Host?{" "}
                        <Link href="/host/signup" className="text-orange-500 hover:text-orange-400 transition-colors underline decoration-2 underline-offset-4">
                            Register Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
