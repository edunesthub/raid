// src/app/admin/page.jsx - UPDATED WITH STATS UTILITY
"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Award,
  ClipboardCheck,
  Crown,
  Calculator,
  UserCheck
} from "lucide-react";
import useAdminAuth from "./hooks/useAdminAuth";
import Dashboard from "./components/Dashboard";
import TournamentManagement from "./components/TournamentManagement";
import UserManagement from "./components/UserManagement";
import ResultsVerification from './components/ResultsVerification';
import ResultsManagement from './components/ResultsManagement';
import NonBracketResults from './components/NonBracketResults';
import WinnerSelection from './components/WinnerSelection';
import AdminActivity from './components/AdminActivity';
import ManagerManagement from './components/ManagerManagement';
import dynamic from 'next/dynamic';

// Lazy load the stats page
const AdminStatsUtility = dynamic(() => import('./stats/page'), { ssr: false });

export default function AdminPortal() {
  const { admin, loading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!admin) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Please login as admin</div>;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "activity", label: "Activity", icon: ClipboardCheck },
    { id: "results-management", label: "Bracket Results", icon: Gamepad2 },
    { id: "non-bracket-results", label: "Battle Royale", icon: Award },
    { id: "winner-selection", label: "Select Winners", icon: Crown },
    { id: "results", label: "Verify Results", icon: ClipboardCheck },
    { id: "users", label: "Users", icon: Users },
    { id: "managers", label: "Team Managers", icon: UserCheck },
    { id: "stats-utility", label: "Stats Utility", icon: Calculator },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-bold text-white">RAID ARENA</h1>
          <p className="text-orange-400 text-xs">{menuItems.find(item => item.id === activeTab)?.label} Portal</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white hover:bg-gray-800 rounded-lg">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Desktop Logo */}
        <div className="hidden lg:block p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">RAID ARENA</h1>
          <p className="text-orange-400 text-sm">Admin Portal</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-sm transition-all ${activeTab === item.id ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "tournaments" && <TournamentManagement />}
        {activeTab === "activity" && <AdminActivity />}
        {activeTab === "results-management" && <ResultsManagement />}
        {activeTab === "non-bracket-results" && <NonBracketResults />}
        {activeTab === "winner-selection" && <WinnerSelection />}
        {activeTab === "results" && <ResultsVerification />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "managers" && <ManagerManagement />}
        {activeTab === "stats-utility" && <AdminStatsUtility />}
        {activeTab === "analytics" && <div className="text-white p-4">Analytics coming soon...</div>}
        {activeTab === "settings" && <div className="text-white p-4">Settings coming soon...</div>}
      </div>
    </div>
  );
}