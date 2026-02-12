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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-6 px-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header Card */}
        <div className="card-raid p-6 sm:p-8 mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative">
                <UserAvatar
                  user={user}
                  size="3xl"
                  className="border-4 border-orange-500 ring-4 ring-orange-500/30 shadow-2xl"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {user.username || 'Unknown User'}
                </h1>
                {user.country && (
                  <span className="text-3xl sm:text-4xl" title={user.country}>
                    {getCountryFlag(user.country)}
                  </span>
                )}
                {stats.tournamentsWon > 0 && (
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                )}
              </div>

              {(user.firstName || user.lastName) && (
                <p className="text-xl text-gray-300 mb-4">
                  {user.firstName} {user.lastName}
                </p>
              )}

              {user.bio && (
                <p className="text-gray-400 mb-4 max-w-2xl">
                  {user.bio}
                </p>
              )}

              {user.createdAt && (
                <div className="flex items-center justify-center sm:justify-start text-gray-500 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card-raid p-4 sm:p-6 text-center bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 hover:scale-105 transition-transform">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {stats.tournamentsPlayed || 0}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Tournaments Played</p>
          </div>

          <div className="card-raid p-4 sm:p-6 text-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 hover:scale-105 transition-transform">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {stats.tournamentsWon || 0}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Tournaments Won</p>
          </div>

          <div className="card-raid p-4 sm:p-6 text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 hover:scale-105 transition-transform">
            <div className="text-3xl sm:text-4xl mb-2">💰</div>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {currentUser?.country === 'Nigeria' ? '₦' : '₵'}{(stats.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Total Earnings</p>
          </div>

          <div className="card-raid p-4 sm:p-6 text-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 hover:scale-105 transition-transform">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {stats.winRate?.toFixed(1) || 0}%
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">Win Rate</p>
          </div>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="card-raid p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Achievements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const badge = getPlacementBadge(achievement.placement);
                const Icon = badge.icon;

                return (
                  <div
                    key={index}
                    className={`${badge.bg} border ${badge.border} rounded-xl p-4 hover:scale-105 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 ${badge.bg} border ${badge.border} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${badge.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${badge.color} font-bold text-sm`}>{badge.text}</p>
                        <p className="text-white font-semibold text-xs truncate">{achievement.tournament.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{achievement.tournament.game}</span>
                      <span className="text-gray-500">
                        {achievement.placementAt && new Date(achievement.placementAt.toDate()).toLocaleDateString()}
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
          <div className="card-raid p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              Recent Tournaments
            </h2>

            <div className="space-y-3">
              {recentTournaments.map((tournament, index) => (
                <Link
                  key={index}
                  href={`/tournament/${tournament.id}`}
                  className="block bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition-all hover:scale-102"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate mb-1">{tournament.name}</h3>
                      <p className="text-gray-400 text-sm">{tournament.game}</p>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {tournament.placement && (
                        <div className={`${getPlacementBadge(tournament.placement).bg} px-3 py-1 rounded-full border ${getPlacementBadge(tournament.placement).border}`}>
                          <span className={`${getPlacementBadge(tournament.placement).color} text-sm font-bold`}>
                            {getPlacementBadge(tournament.placement).emoji} {tournament.placement}
                          </span>
                        </div>
                      )}

                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${tournament.status === 'completed' ? 'bg-gray-700 text-gray-300' :
                        tournament.status === 'live' ? 'bg-green-500/20 text-green-400 animate-pulse' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {tournament.status === 'completed' ? '✓ Done' :
                          tournament.status === 'live' ? '🔴 Live' : '⏰ Soon'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Tournaments */}
        {achievements.length === 0 && recentTournaments.length === 0 && (
          <div className="card-raid p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Tournament History</h3>
            <p className="text-gray-400 mb-6">This player hasn't participated in any tournaments yet.</p>
            <Link href="/tournament" className="btn-raid inline-block">
              Browse Tournaments
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}