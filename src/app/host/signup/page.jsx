"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

export default function HostSignup() {
    const [formData, setFormData] = useState({
        fullName: "",
        hostName: "",
        country: "Ghana",
        phoneNumber: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: formData.fullName
            });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: formData.email,
                fullName: formData.fullName,
                hostName: formData.hostName,
                country: formData.country,
                phoneNumber: formData.phoneNumber,
                role: "host",
                createdAt: new Date(),
                status: "pending_approval" // Admin might need to approve hosts
            });

            router.push("/host");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 py-12">
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
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Become a Host</h2>
                    <p className="mt-2 text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Start hosting tournaments and leagues</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs italic font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Host Name</label>
                            <input
                                type="text"
                                placeholder="Host Name (e.g. Organization)"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.hostName}
                                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Country</label>
                                <select
                                    required
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                >
                                    {COUNTRIES.map((country) => (
                                        <option key={country.code} value={country.name} className="bg-gray-900">
                                            {country.flag} {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
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
                        {loading ? "Creating Account..." : "Create Host Account"}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        Already have access?{" "}
                        <Link href="/host/login" className="text-orange-500 hover:text-orange-400 transition-colors underline decoration-2 underline-offset-4">
                            Portal Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
