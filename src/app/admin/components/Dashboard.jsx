"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Users, Trophy, DollarSign, AlertCircle, X, Zap, Target } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "./StatCard";

export default function Dashboard({ hostId }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    totalRevenue: 0,
    totalCommission: 0,
    commissionEventsCount: 0,
  });
  const [commissionTournaments, setCommissionTournaments] = useState([]);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
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

      const tournamentsSnapshot = await getDocs(query(collection(db, "tournaments"), orderBy("created_at", "desc")));

      const filteredTournaments = hostId
        ? tournamentsSnapshot.docs.filter(doc => doc.data().hostId === hostId)
        : tournamentsSnapshot.docs;

      const activeTournaments = filteredTournaments.filter(doc => {
        const status = doc.data().status;
        return status === "registration-open" || status === "live";
      }).length;

      let totalRevenue = 0;
      let totalCommission = 0;
      let commEvents = [];

      filteredTournaments.forEach(doc => {
        const data = doc.data();
        const tournament = { id: doc.id, ...data };

        totalRevenue += (data.entry_fee || 0) * (data.current_participants || 0);

        // ONLY calculate commission for tournaments created by HOSTS (must have hostId)
        // AND not on fixed model
        if (data.hostId && data.operational_model !== 'fixed') {
          const eventCommission = (data.entry_fee || 0) * (data.max_participant || 0) * 0.20;
          totalCommission += eventCommission;
          commEvents.push({
            ...tournament,
            calculatedCommission: eventCommission,
            cashPool: (data.entry_fee || 0) * (data.max_participant || 0)
          });
        }
      });

      setCommissionTournaments(commEvents);
      setStats({
        totalUsers,
        activeTournaments,
        totalRevenue,
        totalCommission,
        commissionEventsCount: commEvents.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currency = user?.country === 'Nigeria' ? '₦' : '₵';

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Dashboard Overview</h2>
        <button
          onClick={loadStats}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
          title="Refresh Stats"
        >
          <Zap size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!hostId && <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="blue" />}
        <StatCard title="Active Events" value={stats.activeTournaments.toString()} icon={Trophy} color="orange" />
        <StatCard title="Total Revenue" value={`${currency}${stats.totalRevenue.toLocaleString()} `} icon={DollarSign} color="green" />
        <StatCard
          title={hostId ? "Commission Due" : "Raid Commission"}
          value={hostId ? `${currency}${stats.totalCommission.toLocaleString()} ` : stats.commissionEventsCount.toString() + ' Events'}
          icon={AlertCircle}
          color="purple"
          onClick={() => setShowCommissionModal(true)}
        />
      </div>

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Commission Report</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Detailed breakdown of event earnings</p>
              </div>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Events</p>
                  <p className="text-2xl font-black text-white italic">{stats.commissionEventsCount}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl md:col-span-2">
                  <p className="text-[10px] font-black text-orange-500/70 uppercase tracking-widest mb-1">Total Potential Commission</p>
                  <p className="text-3xl font-black text-white italic">{currency}{stats.totalCommission.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Event Breakdown</h4>
                <div className="space-y-3">
                  {commissionTournaments.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-gray-500 font-bold italic">No commission-base tournaments found.</p>
                    </div>
                  ) : (
                    commissionTournaments.map((t) => (
                      <div key={t.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                              <Target size={24} />
                            </div>
                            <div>
                              <h5 className="text-white font-black uppercase italic tracking-tight group-hover:text-orange-500 transition-colors uppercase">{t.tournament_name}</h5>
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{t.game} • {t.format}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 md:text-right">
                            <div>
                              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Cash Pool</p>
                              <p className="text-lg font-black text-white italic">{currency}{t.cashPool.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-orange-500/70 uppercase tracking-widest mb-1">RAID Commission</p>
                              <p className="text-lg font-black text-orange-500 italic">{currency}{t.calculatedCommission.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 shrink-0">
              <p>Generated {new Date().toLocaleDateString()}</p>
              <p className="text-orange-500/50">Confidential Report</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
