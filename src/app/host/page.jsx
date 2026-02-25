"use client";

import { useState, useEffect, useRef } from "react";
import {
    LayoutDashboard,
    Trophy,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Award,
    ClipboardCheck,
    CheckCircle,
    CreditCard,
    AlertCircle,
    Crown,
    Zap
} from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import useHostAuth from "./hooks/useHostAuth";
import TournamentManagement from "../admin/components/TournamentManagement";
import LeagueManagement from "../admin/components/LeagueManagement";
import Dashboard from "../admin/components/Dashboard";
import WinnerSelection from "../admin/components/WinnerSelection";
import ResultsVerification from "../admin/components/ResultsVerification";
import { toast } from "react-hot-toast";

export default function HostPortal() {
    const { host, loading, logout } = useHostAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [sidebarOpen]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic">Loading Host Portal...</div>;
    if (!host) return null; // Hook handles redirect

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "tournaments", label: "My Tournaments", icon: Trophy },
        { id: "leagues", label: "My Leagues", icon: Award },
        { id: "winner-selection", label: "Select Winners", icon: Crown },
        { id: "results-verification", label: "Verify Results", icon: ClipboardCheck },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const handleTabClick = (id) => {
        setActiveTab(id);
        setSidebarOpen(false);
    };

    const canCreateTournament = true;

    return (
        <div className={`h-screen bg-black flex flex-col lg:flex-row overflow-hidden`}>
            {/* Mobile Header */}
            <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative">
                        <Image src="/assets/raid1.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white italic tracking-tighter leading-none">RAID HOST</h1>
                        <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.15em] leading-none mt-1">
                            {menuItems.find(item => item.id === activeTab)?.label}
                        </p>
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                {/* Sidebar Branding (Desktop & Mobile) */}
                <div className="p-8 border-b border-gray-800/50 relative">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 relative">
                            <Image
                                src="/assets/raid1.svg"
                                alt="RAID Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white italic tracking-tighter leading-none">RAID</h1>
                            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none mt-1">HOST PORTAL</p>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] truncate">
                                {host.hostName || host.fullName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === item.id
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-800/50 space-y-4">
                    <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                            {host.fullName?.[0] || host.hostName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-[10px] font-black uppercase tracking-wider truncate">
                                {host.fullName}
                            </p>
                            <p className="text-gray-500 text-[9px] truncate">{host.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-0 min-w-0 bg-[#050505] overflow-hidden`}>
                <div className={`max-w-[1600px] mx-auto w-full h-full flex flex-col min-h-0 min-w-0 ${activeTab === 'results-verification' ? 'p-0' : 'p-6 md:p-10 overflow-y-auto'}`}>
                    {activeTab === "dashboard" && <Dashboard hostId={host.id} />}
                    {activeTab === "tournaments" && (
                        <TournamentManagement
                            hostId={host.id}
                            paymentModel="commission"
                        />
                    )}
                    {activeTab === "leagues" && (
                        <LeagueManagement
                            hostId={host.id}
                        />
                    )}
                    {activeTab === "winner-selection" && <WinnerSelection hostId={host.id} />}
                    {activeTab === "results-verification" && <ResultsVerification hostId={host.id} />}

                    {activeTab === "settings" && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-black text-white italic">HOST SETTINGS</h2>
                            <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[2.5rem] space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Host Name</label>
                                        <input
                                            type="text"
                                            defaultValue={host.hostName}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                                        <input
                                            type="email"
                                            defaultValue={host.email}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
