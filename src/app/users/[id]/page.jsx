'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Trophy, Award, Calendar, Mail, Phone, Star, TrendingUp, Target, Crown, Medal, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import { getCountryFlag } from '@/utils/countryFlags';
import UserAvatar from '@/components/UserAvatar';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-widest">
            {error || 'User not found'}
          </h2>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-8">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/" className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16 flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 lg:px-12 relative z-10">
        <Link
          href="/players"
          className="inline-flex items-center text-gray-500 hover:text-orange-500 font-black uppercase text-[10px] tracking-widest transition-all mb-8 md:mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Players
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white/[0.03] border border-white/10 p-6 md:p-10 rounded-[2.5rem] mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.02] via-transparent to-transparent"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-125"></div>
              <UserAvatar
                user={user}
                size="3xl"
                className="relative border-4 border-white/10 group-hover:border-orange-500/50 group-hover:scale-105 transition-all duration-500 shadow-2xl"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                  {user.username || 'Unknown User'}
                </h1>
                <div className="flex items-center gap-2">
                  {user.country && (
                    <span className="text-3xl" title={user.country}>
                      {getCountryFlag(user.country)}
                    </span>
                  )}
                  {stats.tournamentsWon > 0 && (
                    <Trophy className="w-8 h-8 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  )}
                </div>
              </div>

              {(user.firstName || user.lastName) && (
                <p className="text-lg md:text-xl text-gray-500 font-bold uppercase tracking-widest mb-6">
                  {user.firstName} {user.lastName}
                </p>
              )}

              {user.bio && (
                <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl leading-relaxed mb-8">
                  {user.bio}
                </p>
              )}

              {user.createdAt && (
                <div className="flex items-center justify-center md:justify-start text-orange-500/60 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  Elite Member Since {new Date(user.createdAt.toDate?.() || user.createdAt).getFullYear()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          {[
            { label: 'Tournaments Played', value: stats.tournamentsPlayed || 0, icon: Target, color: 'text-orange-500' },
            { label: 'Tournaments Won', value: stats.tournamentsWon || 0, icon: Crown, color: 'text-orange-500' },
            { label: 'Total Earnings', value: `${currentUser?.country === 'Nigeria' ? '₦' : '₵'}${(stats.totalEarnings || 0).toLocaleString()}`, icon: null, emoji: '💰' },
            { label: 'Win Rate', value: `${stats.winRate?.toFixed(1) || 0}%`, icon: TrendingUp, color: 'text-orange-500' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/10 p-4 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-center hover:bg-white/[0.06] hover:border-orange-500/30 transition-all duration-300 group">
              {stat.icon ? (
                <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${stat.color} mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`} />
              ) : (
                <div className="text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">{stat.emoji}</div>
              )}
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 uppercase tracking-tighter">
                {stat.value}
              </p>
              <p className="text-gray-500 text-[8px] md:text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 p-6 md:p-10 rounded-[2.5rem] mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Star className="w-8 h-8 text-orange-500" />
              Achievements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {achievements.map((achievement, index) => {
                const badge = getPlacementBadge(achievement.placement);
                const Icon = badge.icon;
 
                return (
                  <div
                    key={index}
                    className="bg-white/[0.04] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all duration-300 group cursor-default"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border ${
                        achievement.placement === 1 ? 'bg-orange-500/10 text-orange-500 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]' :
                        achievement.placement === 2 ? 'bg-gray-300/10 text-gray-300 border-gray-300/40 shadow-[0_0_20px_rgba(209,213,219,0.15)]' :
                        'bg-[#b08d57]/10 text-[#b08d57] border-[#b08d57]/40 shadow-[0_0_20px_rgba(176,141,87,0.15)]'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black uppercase text-[10px] tracking-widest opacity-60 mb-0.5">{badge.text}</p>
                        <p className="text-white font-black uppercase text-xs md:text-sm tracking-tight truncate group-hover:text-orange-500 transition-colors">{achievement.tournament.name}</p>
                      </div>
                    </div>
 
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{achievement.tournament.game}</span>
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        {achievement.placementAt && new Date(achievement.placementAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Tournaments */}
        {recentTournaments.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 p-6 md:p-10 rounded-[2.5rem] mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              Recent Tournaments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {recentTournaments.map((tournament, index) => (
                <Link
                  key={index}
                  href={`/tournament/${tournament.id}`}
                  className="bg-white/[0.04] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-white font-black uppercase text-xs md:text-sm tracking-tight truncate group-hover:text-orange-500 transition-colors mb-1">{tournament.name}</h3>
                      <p className="text-gray-500 font-black uppercase text-[9px] tracking-widest">{tournament.game}</p>
                    </div>
 
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tournament.status === 'completed' ? 'bg-white/5 text-gray-500' :
                        tournament.status === 'live' ? 'bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse' :
                          'bg-orange-500/10 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                        }`}>
                        {tournament.status === 'completed' ? 'Done' :
                          tournament.status === 'live' ? 'Live' : 'Soon'}
                    </div>
                  </div>
 
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    {tournament.placement ? (
                      <div className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-tight">
                        <span className="text-gray-500">Placement:</span>
                        <span className={getPlacementBadge(tournament.placement).color}>{getPlacementBadge(tournament.placement).text}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-gray-600 uppercase italic">Participated</span>
                    )}
                    <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Target size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Tournaments */}
        {achievements.length === 0 && recentTournaments.length === 0 && (
          <div className="bg-white/[0.02] border border-white/10 border-dashed p-8 sm:p-12 md:p-20 text-center rounded-[2rem] md:rounded-[3rem] shadow-2xl">
            <Trophy className="w-12 h-12 md:w-20 md:h-20 text-gray-800 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-widest">No Tournament History</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-8">This player hasn't participated in any tournaments yet.</p>
            <Link href="/tournament" className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap">
              Browse Tournaments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}