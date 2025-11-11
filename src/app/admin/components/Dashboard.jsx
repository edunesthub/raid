"use client";

import { useEffect, useState } from "react";
import { Users, Trophy, DollarSign, AlertCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "./StatCard";

export default function Dashboard() {
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
      const usersSnapshot = await getDocs(collection(db, "users"));
      const tournamentsSnapshot = await getDocs(collection(db, "tournaments"));

      const totalUsers = usersSnapshot.size;
      const activeTournaments = tournamentsSnapshot.docs.filter(doc => {
        const status = doc.data().status;
        return status === "registration-open" || status === "live";
      }).length;

      let totalRevenue = 0;
      tournamentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRevenue += (data.entry_fee || 0) * (data.current_participants || 0);
      });

      setStats({ totalUsers, activeTournaments, totalRevenue, pendingActions: 0 });
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
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} trend={12} color="blue" />
        <StatCard title="Active Tournaments" value={stats.activeTournaments.toString()} icon={Trophy} trend={8} color="orange" />
        <StatCard title="Total Revenue" value={`₵${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={15} color="green" />
        <StatCard title="Pending Actions" value={stats.pendingActions.toString()} icon={AlertCircle} color="purple" />
      </div>
    </div>
  );
}
