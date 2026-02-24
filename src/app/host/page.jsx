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
        { id: "payments", label: "Payments", icon: CreditCard },
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

    const updatePaymentModel = async (model) => {
        try {
            const hostRef = doc(db, "users", host.id);
            await updateDoc(hostRef, {
                paymentModel: model,
                // If switching to subscription, set as unpaid initially if not already paid
                subscriptionStatus: model === 'subscription' ? (host.subscriptionStatus || 'unpaid') : null
            });
            toast.success(`Switched to ${model === 'subscription' ? 'Monthly Subscription' : 'Commission per Tournament'} model.`);
            window.location.reload(); // Refresh to update context
        } catch (error) {
            console.error("Error updating payment model:", error);
            toast.error("Failed to update payment plan.");
        }
    };

    const handleMockPayment = async () => {
        try {
            const hostRef = doc(db, "users", host.id);
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);

            await updateDoc(hostRef, {
                subscriptionStatus: 'active',
                subscriptionExpiry: expiry,
                lastSubscriptionPayment: new Date()
            });
            toast.success("Payment successful! Your subscription is now active for 30 days.");
            window.location.reload();
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed simulation.");
        }
    };

    const canCreateTournament = host.paymentModel === 'commission' || host.subscriptionStatus === 'active';

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
                            paymentModel={host.paymentModel}
                            onPlanRequired={!host.paymentModel ? () => setShowPlanModal(true) : null}
                            restriction={host.paymentModel === 'subscription' && host.subscriptionStatus !== 'active' ? "Please pay your monthly subscription to create new tournaments." : null}
                        />
                    )}
                    {activeTab === "leagues" && (
                        <LeagueManagement
                            hostId={host.id}
                            onPlanRequired={!host.paymentModel ? () => setShowPlanModal(true) : null}
                            restriction={host.paymentModel === 'subscription' && host.subscriptionStatus !== 'active' ? "Please pay your monthly subscription to create new leagues." : null}
                        />
                    )}
                    {activeTab === "winner-selection" && <WinnerSelection hostId={host.id} />}
                    {activeTab === "results-verification" && <ResultsVerification hostId={host.id} />}
                    {activeTab === "payments" && (
                        <div className="space-y-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Host Revenue & Plans</h2>
                                <p className="text-gray-400 text-sm font-medium tracking-wide">Manage your billing cycle and operational strategy</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Plan Selection */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Commission Plan */}
                                        <div className={`p-5 rounded-3xl border transition-all ${host.paymentModel !== 'subscription' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-gray-900/50 border-white/5 opacity-60 hover:opacity-100'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-white/5 rounded-xl text-orange-500">
                                                    <Zap size={20} />
                                                </div>
                                                {host.paymentModel !== 'subscription' && (
                                                    <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-[7px] font-black uppercase tracking-widest">Active</span>
                                                )}
                                            </div>
                                            <h3 className="text-base font-black text-white uppercase italic mb-1 tracking-tight">Pay Per Event</h3>
                                            <p className="text-gray-400 text-[10px] leading-snug mb-4 font-medium">No monthly costs. RAID takes a 20% commission from the total entry pool (Entry Fee × Max Participants).</p>
                                            {host.paymentModel === 'subscription' && (
                                                <button
                                                    onClick={() => updatePaymentModel('commission')}
                                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                                                >
                                                    Switch to Commission
                                                </button>
                                            )}
                                        </div>

                                        {/* Subscription Plan */}
                                        <div className={`p-5 rounded-3xl border transition-all ${host.paymentModel === 'subscription' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-gray-900/50 border-white/5 opacity-60 hover:opacity-100'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2.5 bg-white/5 rounded-xl text-blue-400">
                                                    <CreditCard size={20} />
                                                </div>
                                                {host.paymentModel === 'subscription' && (
                                                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-[7px] font-black uppercase tracking-widest">Active</span>
                                                )}
                                            </div>
                                            <h3 className="text-base font-black text-white uppercase italic mb-1 tracking-tight">Monthly Subscription</h3>
                                            <p className="text-gray-400 text-[10px] leading-snug mb-4 font-medium">₵200 per month. Unlimited hosting with zero commissions.</p>
                                            {host.paymentModel !== 'subscription' && (
                                                <button
                                                    onClick={() => updatePaymentModel('subscription')}
                                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                                                >
                                                    Switch to Monthly
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Strategy Banner */}
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 shrink-0">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Important Note</p>
                                            <p className="text-gray-500 text-[11px] leading-relaxed">
                                                Switching plans takes effect immediately. For Monthly users, tournament creation is disabled if the subscription payment is overdue.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Payment */}
                                <div className="space-y-6">
                                    <div className="bg-gray-900/50 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between h-full">
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6">Billing Status</h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current Balance Due</p>
                                                    <p className="text-4xl font-black text-white italic tracking-tighter">
                                                        ₵{host.paymentModel === 'subscription' && host.subscriptionStatus !== 'active' ? '200.00' : '0.00'}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-gray-500 uppercase">Payment Status</span>
                                                        <span className={host.paymentModel === 'subscription' ? (host.subscriptionStatus === 'active' ? 'text-green-500' : 'text-red-500') : 'text-green-500'}>
                                                            {host.paymentModel === 'subscription' ? (host.subscriptionStatus === 'active' ? 'PAID / ACTIVE' : 'OVERDUE') : 'COMMISSION MODE'}
                                                        </span>
                                                    </div>
                                                    {host.paymentModel === 'subscription' && host.subscriptionExpiry && (
                                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                                            <span className="text-gray-500 uppercase">Expiry Date</span>
                                                            <span className="text-white">{new Date(host.subscriptionExpiry.seconds * 1000).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {host.paymentModel === 'subscription' && host.subscriptionStatus !== 'active' && (
                                            <button
                                                onClick={handleMockPayment}
                                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95 mt-8"
                                            >
                                                Pay ₵200 now
                                            </button>
                                        )}

                                        {(host.paymentModel !== 'subscription' || host.subscriptionStatus === 'active') && (
                                            <div className="mt-8 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                                                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest">No outstanding payments</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
            {/* Plan Required Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] max-w-xl w-full space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl shadow-orange-500/10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Choose your strategy</h2>
                                <p className="text-gray-400 text-sm font-medium tracking-wide">Select a payment plan to begin creating events.</p>
                            </div>
                            <button onClick={() => setShowPlanModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => updatePaymentModel('commission')}
                                className="p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all text-left group"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="p-3 bg-white/5 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                                        <Zap size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Select Plan</span>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase italic mb-1">Pay Per Event</h3>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed">No upfront costs. 20% commission of the total entry pool (Entry Fee × Max Participants) applies per event.</p>
                            </button>

                            <button
                                onClick={() => updatePaymentModel('subscription')}
                                className="p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all text-left group"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="p-3 bg-white/5 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                                        <CreditCard size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Select Plan</span>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase italic mb-1">Monthly Subscription</h3>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed">₵200 per month. Unlimited hosting with zero commissions.</p>
                            </button>
                        </div>

                        <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                            You can switch plans anytime in the Payments tab
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
