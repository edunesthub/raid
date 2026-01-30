'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Trophy, Award, Calendar, Mail, Phone, Star, TrendingUp, Target, Crown, Medal, Zap, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id;
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    totalEarnings: 0,
    winRate: 0,
    currentStreak: 0,
    bestPlacement: null
  });
  const [achievements, setAchievements] = useState([]);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setError('User not found');
        return;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      setUser(userData);

      // Load user stats
      const statsDoc = await getDoc(doc(db, 'userStats', userId));
      if (statsDoc.exists()) {
        setStats(statsDoc.data());
      }

      // Load achievements (tournament wins)
      const achievementsQuery = query(
        collection(db, 'tournament_participants'),
        where('userId', '==', userId),
        where('placement', 'in', [1, 2, 3]),
        orderBy('placementAt', 'desc'),
        limit(10)
      );

      const achievementsSnapshot = await getDocs(achievementsQuery);
      const achievementsList = await Promise.all(
        achievementsSnapshot.docs.map(async (snap) => {
          const data = snap.data();
          const tournamentDoc = await getDoc(doc(db, 'tournaments', data.tournamentId));

          return {
            placement: data.placement,
            placementAt: data.placementAt,
            tournament: tournamentDoc.exists()
              ? {
                id: tournamentDoc.id,
                name: tournamentDoc.data().tournament_name,
                game: tournamentDoc.data().game
              }
              : null
          };
        })
      );


      setAchievements(achievementsList.filter(a => a.tournament));

      // Load recent tournaments
      const tournamentsQuery = query(
        collection(db, 'tournament_participants'),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc'),
        limit(5)
      );

      const tournamentsSnapshot = await getDocs(tournamentsQuery);
      const tournamentsList = await Promise.all(
        tournamentsSnapshot.docs.map(async (snap) => {
          const data = snap.data();
          const tournamentDoc = await getDoc(doc(db, 'tournaments', data.tournamentId));

          if (!tournamentDoc.exists()) return null;

          const tournamentData = tournamentDoc.data();

          return {
            id: tournamentDoc.id,
            name: tournamentData.tournament_name,
            game: tournamentData.game,
            status: tournamentData.status,
            placement: data.placement || null
          };
        })
      );


      setRecentTournaments(tournamentsList.filter(t => t));

    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const getPlacementBadge = (placement) => {
    const badges = {
      1: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', emoji: '🥇', text: '1st Place' },
      2: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40', emoji: '🥈', text: '2nd Place' },
      3: { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', emoji: '🥉', text: '3rd Place' }
    };
    return badges[placement] || badges[3];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || 'User not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/" className="btn-raid inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505] text-white">
      <div className="scanline"></div>

      <div className="container-mobile py-8 relative z-10 max-w-6xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">REVERT_OFFLINE</span>
        </Link>

        {/* Profile Header Card */}
        <div className="relative group mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-black border border-blue-500/20 p-8 sm:p-10" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
              {/* Avatar section */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse"></div>
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 border-2 border-blue-500 p-1 bg-black" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                  <div className="w-full h-full bg-gray-900 overflow-hidden" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-4xl text-blue-500/30 italic">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 px-3 py-1 text-[8px] font-black uppercase tracking-widest italic border border-black shadow-[0_0_10px_#00f3ff]">
                  LEVEL_AUTHORIZED
                </div>
              </div>

              {/* User Identity */}
              <div className="flex-1 text-center sm:text-left pt-2">
                <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                  <h1 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tighter">
                    {user.username}
                  </h1>
                  {stats.tournamentsWon > 0 && <Trophy className="w-8 h-8 text-yellow-500 shadow-[0_0_15px_rgba(255,255,0,0.3)]" />}
                </div>

                <div className="space-y-4">
                  <p className="text-blue-500/60 font-black uppercase tracking-[0.4em] text-[10px]">
                    // OPERATIVE_SIG: {user.firstName || 'REDACTED'} {user.lastName || 'REDACTED'}
                  </p>

                  {user.bio && (
                    <div className="bg-blue-500/5 border-l-2 border-blue-500/40 p-4 max-w-2xl">
                      <p className="text-gray-500 font-bold text-xs uppercase tracking-wide leading-relaxed italic">
                        "{user.bio}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-6 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">ENLISTED_{new Date(user.createdAt.toDate?.() || user.createdAt).getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">STATUS_ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'TRIALS_JOINED', value: stats.tournamentsPlayed, color: 'blue', icon: Zap },
            { label: 'VICTORIES_SECURED', value: stats.tournamentsWon, color: 'yellow', icon: Trophy },
            { label: 'BOUNTY_REQUISITIONED', value: `${currentUser?.country === 'Nigeria' ? '₦' : '₵'}${(stats.totalEarnings || 0).toLocaleString()}`, color: 'cyan', icon: Target },
            { label: 'WIN_PROBABILITY', value: `${stats.winRate?.toFixed(1) || 0}%`, color: 'pink', icon: TrendingUp },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="group relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
                <div className={`absolute -inset-px bg-${stat.color}-500/20 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative bg-black border border-white/5 p-8 text-center group-hover:border-blue-500/30 transition-all">
                  <Icon className={`w-10 h-10 text-${stat.color}-500/30 mx-auto mb-6 group-hover:scale-110 transition-transform`} />
                  <p className="text-4xl font-black italic text-white tracking-tighter mb-1 uppercase group-hover:text-blue-400 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-gray-700 text-[8px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 text-blue-100">
          {/* Achievements */}
          {achievements.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1 bg-yellow-500 shadow-[0_0_10px_#facc15]"></div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">HONOR_AWARDS</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const badge = getPlacementBadge(achievement.placement);
                  const Icon = badge.icon;
                  return (
                    <div key={index} className="bg-black border border-white/5 p-5 relative group hover:border-yellow-500/20 transition-all" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 ${badge.bg} flex items-center justify-center`} style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                          <Icon className={`w-5 h-5 ${badge.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${badge.color}`}>{badge.text}</p>
                          <p className="text-white font-black italic uppercase tracking-tighter text-sm truncate">{achievement.tournament.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{achievement.tournament.game}</span>
                        <span className="text-blue-500/40 text-[8px] font-black">{achievement.placementAt && new Date(achievement.placementAt.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Activity Log */}
          {recentTournaments.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">BATTLE_HISTORY</h2>
              </div>

              <div className="space-y-4">
                {recentTournaments.map((tournament, index) => (
                  <Link key={index} href={`/tournament/${tournament.id}`}>
                    <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all mb-4" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 20%, 100% 100%, 2% 100%, 0 80%)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-black italic uppercase tracking-tighter text-lg group-hover:text-blue-400 transition-colors truncate">{tournament.name}</h3>
                          <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${tournament.status === 'completed' ? 'bg-gray-800 text-gray-500' :
                            tournament.status === 'live' ? 'bg-pink-600/20 text-pink-500 animate-pulse' :
                              'bg-blue-600/20 text-blue-500'
                            }`}>
                            {tournament.status}
                          </div>
                        </div>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{tournament.game}</p>
                      </div>

                      <div className="flex items-center gap-6 ml-6">
                        {tournament.placement ? (
                          <div className="text-right">
                            <p className="text-white font-black italic text-xl tracking-tighter">{tournament.placement === 1 ? '🥇' : tournament.placement === 2 ? '🥈' : '🥉'}</p>
                            <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mt-1">RANK</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-gray-600 font-black italic text-sm">--</p>
                            <p className="text-gray-800 text-[8px] font-black uppercase tracking-widest mt-1">N/A</p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && recentTournaments.length === 0 && (
          <div className="bg-black border border-white/5 p-20 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
            <Trophy className="w-20 h-20 text-gray-800 mx-auto mb-8 opacity-40 shrink-0" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">NO_RECORDS_STORED</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-10 max-w-xs mx-auto">This operative has not yet initialized combat data in the arena nodes.</p>
            <Link href="/tournament" className="btn-raid px-10 py-4">
              SCAN_NODES
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}