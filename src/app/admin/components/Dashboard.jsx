"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Users, Trophy, DollarSign, AlertCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "./StatCard";

export default function Dashboard({ hostId }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    totalRevenue: 0,
    pendingActions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      let totalUsers = 0;
      if (!hostId) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        totalUsers = usersSnapshot.size;
      }

      const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));

      const filteredTournaments = hostId
        ? tournamentsSnapshot.docs.filter(doc => doc.data().hostId === hostId)
        : tournamentsSnapshot.docs;

      const activeTournaments = filteredTournaments.filter(doc => {
        const status = doc.data().status;
        return status === "registration-open" || status === "live";
      }).length;

      let totalRevenue = 0;
      let totalCommission = 0;
      filteredTournaments.forEach(doc => {
        const data = doc.data();
        totalRevenue += (data.entry_fee || 0) * (data.current_participants || 0);
        // Calculate commission based on (entry fee * max participants)
        if (data.operational_model !== 'fixed') {
          totalCommission += (data.entry_fee || 0) * (data.max_participant || 0) * 0.20;
        }
      });

      setStats({ totalUsers, activeTournaments, totalRevenue, totalCommission, pendingActions: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-4">Loading dashboard...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!hostId && <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} trend={12} color="blue" />}
        <StatCard title="Active Tournaments" value={stats.activeTournaments.toString()} icon={Trophy} trend={8} color="orange" />
        <StatCard title="Total Revenue" value={`${user?.country === 'Nigeria' ? '₦' : '₵'}${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={15} color="green" />
        <StatCard title={hostId ? "Commission Due" : "Pending Actions"} value={hostId ? `${user?.country === 'Nigeria' ? '₦' : '₵'}${stats.totalCommission.toLocaleString()}` : stats.pendingActions.toString()} icon={AlertCircle} color="purple" />
      </div>
    </div>
  );
}
