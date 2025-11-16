// src/app/tournament/[id]/page.jsx - ENHANCED WITH WINNERS DISPLAY
'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import TournamentBracket from '@/components/TournamentBracket';
import { useTournament } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MatchResultSubmission from '@/components/MatchResultSubmission';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  Zap
} from 'lucide-react';

export default function TournamentPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { tournament, loading, error, joinTournament, leaveTournament } = useTournament(resolvedParams?.id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [placementData, setPlacementData] = useState({ first: null, second: null, third: null });

  useEffect(() => {
    const checkParticipation = async () => {
      if (!user || !resolvedParams?.id) return;
      
      try {
        const participantRef = doc(db, 'tournament_participants', `${resolvedParams.id}_${user.id}`);
        const participantDoc = await getDoc(participantRef);
        setIsParticipant(participantDoc.exists());
      } catch (err) {
        console.error('Error checking participation:', err);
      }
    };

    checkParticipation();
  }, [user, resolvedParams?.id, tournament]);

  // Load winner and placement data
  useEffect(() => {
    const loadWinnerData = async () => {
      if (!tournament || tournament.status !== 'completed') return;

      try {
        const placements = { first: null, second: null, third: null };
        
        if (tournament.winnerId) {
          const firstDoc = await getDoc(doc(db, 'users', tournament.winnerId));
          if (firstDoc.exists()) {
            placements.first = { id: firstDoc.id, ...firstDoc.data() };
          }
        }

        if (tournament.secondPlaceId) {
          const secondDoc = await getDoc(doc(db, 'users', tournament.secondPlaceId));
          if (secondDoc.exists()) {
            placements.second = { id: secondDoc.id, ...secondDoc.data() };
          }
        }

        if (tournament.thirdPlaceId) {
          const thirdDoc = await getDoc(doc(db, 'users', tournament.thirdPlaceId));
          if (thirdDoc.exists()) {
            placements.third = { id: thirdDoc.id, ...thirdDoc.data() };
          }
        }

        setPlacementData(placements);
      } catch (err) {
        console.error('Error loading winner data:', err);
      }
    };

    loadWinnerData();
  }, [tournament]);

  const handleJoinTournament = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await joinTournament(user.id);
      setIsParticipant(true);

      const notifRef = collection(db, 'notifications');
      await addDoc(notifRef, {
        userId: user.id,
        title: 'Tournament Joined 🎮',
        message: `You successfully joined "${tournament.title}". Good luck!`,
        tournamentId: tournament.id,
        timestamp: serverTimestamp(),
        read: false,
      });

    } catch (err) {
      setActionError(err.message);
      alert(err.message || 'Failed to join tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTournament = async () => {
    if (!isAuthenticated) return;

    if (!confirm('Are you sure you want to leave this tournament?')) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await leaveTournament(user.id);
      setIsParticipant(false);
    } catch (err) {
      setActionError(err.message);
      alert(err.message || 'Failed to leave tournament');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-mobile min-h-screen py-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container-mobile min-h-screen py-6">
        <div className="card-raid p-6 text-center">
          <p className="text-red-500 mb-4">{error || 'Tournament not found'}</p>
          <Link href="/tournament" className="text-blue-400 hover:text-blue-300">
            Return to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => `₵${amount.toLocaleString()}`;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'registration-open':
        return {
          color: 'bg-blue-600',
          text: 'REGISTRATION OPEN',
          icon: '🔥',
          gradient: 'from-blue-500/20 to-blue-600/5'
        };
      case 'upcoming':
        return {
          color: 'bg-yellow-600',
          text: 'UPCOMING',
          icon: '⏰',
          gradient: 'from-yellow-500/20 to-yellow-600/5'
        };
      case 'live':
        return {
          color: 'bg-green-600',
          text: 'LIVE NOW',
          icon: '🔴',
          gradient: 'from-green-500/20 to-green-600/5'
        };
      case 'completed':
        return {
          color: 'bg-gray-600',
          text: 'COMPLETED',
          icon: '✅',
          gradient: 'from-gray-500/20 to-gray-600/5'
        };
      default:
        return {
          color: 'bg-gray-600',
          text: status?.toUpperCase() || 'UNKNOWN',
          icon: '❓',
          gradient: 'from-gray-500/20 to-gray-600/5'
        };
    }
  };

  const statusConfig = getStatusConfig(tournament.status);
  const progressPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;
  const canJoin = (tournament.status === 'registration-open' || tournament.status === 'upcoming') && spotsLeft > 0;
  const showBracket = tournament.bracketGenerated && (tournament.status === 'live' || tournament.status === 'completed');

  // Winner Podium Component
  const WinnerPodium = () => {
    if (!placementData.first) return null;

    return (
      <div className="mb-8 animate-fade-in">
        <div className={`bg-gradient-to-br ${statusConfig.gradient} rounded-3xl p-6 sm:p-8 border border-orange-500/30 shadow-2xl relative overflow-hidden`}>
          {/* Animated background sparkles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-150"></div>
            <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Champions</h2>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-gray-300 text-sm">The best of the best in {tournament.game}</p>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* 2nd Place */}
              {placementData.second && (
                <div className="order-2 sm:order-1 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-gray-400 shadow-2xl">
                      {placementData.second.avatarUrl ? (
                        <img 
                          src={placementData.second.avatarUrl} 
                          alt={placementData.second.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-600 to-gray-400 flex items-center justify-center">
                          <span className="text-white text-2xl sm:text-3xl font-bold">
                            {placementData.second.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-900 shadow-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{placementData.second.username}</h3>
                  <p className="text-gray-400 text-sm mb-2">2nd Place</p>
                  <div className="bg-gray-400/20 px-4 py-2 rounded-full border border-gray-400/40">
                    <Medal className="w-5 h-5 text-gray-400 inline mr-2" />
                    <span className="text-gray-300 font-semibold text-sm">Silver</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="order-1 sm:order-2 flex flex-col items-center transform sm:scale-110 hover:scale-115 transition-transform duration-300">
                <div className="relative mb-4">
                  <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                    {placementData.first.avatarUrl ? (
                      <img 
                        src={placementData.first.avatarUrl} 
                        alt={placementData.first.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center justify-center">
                        <span className="text-white text-3xl sm:text-4xl font-bold">
                          {placementData.first.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <Crown className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-gray-900 shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{placementData.first.username}</h3>
                <p className="text-yellow-400 text-sm sm:text-base mb-2 font-semibold flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  CHAMPION
                </p>
                <div className="bg-yellow-400/20 px-6 py-3 rounded-full border-2 border-yellow-400/50">
                  <Trophy className="w-6 h-6 text-yellow-400 inline mr-2" />
                  <span className="text-yellow-400 font-bold text-base sm:text-lg">Winner</span>
                </div>
              </div>

              {/* 3rd Place */}
              {placementData.third && (
                <div className="order-3 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-orange-600 shadow-2xl">
                      {placementData.third.avatarUrl ? (
                        <img 
                          src={placementData.third.avatarUrl} 
                          alt={placementData.third.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-orange-700 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-2xl sm:text-3xl font-bold">
                            {placementData.third.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-900 shadow-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{placementData.third.username}</h3>
                  <p className="text-gray-400 text-sm mb-2">3rd Place</p>
                  <div className="bg-orange-600/20 px-4 py-2 rounded-full border border-orange-600/40">
                    <Medal className="w-5 h-5 text-orange-600 inline mr-2" />
                    <span className="text-orange-400 font-semibold text-sm">Bronze</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-mobile min-h-screen py-6">
      <div className="mb-6">
        <Link
          href="/tournament"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Tournaments</span>
        </Link>
      </div>

      {actionError && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4 mb-6 animate-shake">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {isParticipant && tournament.status !== 'completed' && (
        <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4 mb-6 animate-slide-in">
          <p className="text-green-400 text-sm flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            You are registered for this tournament!
          </p>
        </div>
      )}

      {/* Winner Announcement */}
      {tournament.status === 'completed' && placementData.first && (
        <WinnerPodium />
      )}

      {/* Tournament Hero Section */}
      <div className={`card-raid p-6 mb-6 bg-gradient-to-br ${statusConfig.gradient} relative overflow-hidden`}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 animate-shimmer"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-orange-500" />
                <span className="text-orange-400 text-sm font-semibold">{tournament.game}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">{tournament.title}</h1>
              {tournament.description && (
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{tournament.description}</p>
              )}
            </div>
            
            <div className={`${statusConfig.color} px-6 py-3 rounded-full text-sm font-bold text-white flex items-center gap-2 animate-pulse shadow-lg`}>
              <span className="text-xl">{statusConfig.icon}</span>
              <span className="whitespace-nowrap">{statusConfig.text}</span>
            </div>
          </div>

          {/* Tournament Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <TrendingUp className="w-4 h-4 text-blue-400 opacity-50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{tournament.currentPlayers}</p>
              <p className="text-gray-400 text-xs mt-1">Players</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <Sparkles className="w-4 h-4 text-yellow-400 opacity-50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(tournament.prizePool)}</p>
              <p className="text-gray-400 text-xs mt-1">Prize Pool</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-green-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <Target className="w-4 h-4 text-green-400 opacity-50" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(tournament.entryFee)}</p>
              <p className="text-gray-400 text-xs mt-1">Entry Fee</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <Star className="w-4 h-4 text-purple-400 opacity-50" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{tournament.maxPlayers}</p>
              <p className="text-gray-400 text-xs mt-1">Max Players</p>
            </div>
          </div>

          {/* Progress Bar */}
          {tournament.status !== 'completed' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Registration Progress
                </span>
                <span className="text-white font-semibold text-sm">
                  {tournament.currentPlayers} / {tournament.maxPlayers}
                </span>
              </div>
              <div className="relative w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer-fast"></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                {spotsLeft > 0 ? (
                  <>
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-400 font-semibold">{spotsLeft} spots remaining!</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-semibold">Tournament is full!</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6">
            {tournament.status === 'completed' ? (
              <div className="bg-gray-700/50 rounded-xl p-6 text-center border border-gray-600">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-gray-300 font-semibold text-lg mb-1">Tournament Ended</p>
                <p className="text-gray-500 text-sm">Thanks to all participants!</p>
              </div>
            ) : tournament.status === 'live' ? (
              <div className="space-y-3">
                <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 sm:p-6">
                  <p className="text-green-400 font-semibold mb-2 flex items-center justify-center gap-2 text-lg">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Tournament is Live!
                  </p>
                  {isParticipant && (
                    <>
                      <p className="text-gray-300 text-sm mb-4 text-center">Check your matches and submit results below</p>
                      
                      <button
                        onClick={() => setShowResultsModal(true)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <Target className="w-5 h-5" />
                        Submit Match Results
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : canJoin ? (
              isParticipant ? (
                <div className="space-y-3">
                  <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 text-center">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold text-lg">You're Registered!</p>
                    <p className="text-gray-300 text-sm mt-1">Get ready for the tournament</p>
                  </div>
                  <button 
                    onClick={handleLeaveTournament}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {actionLoading ? 'Processing...' : 'Leave Tournament'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleJoinTournament}
                  disabled={actionLoading || spotsLeft === 0}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-5 px-6 rounded-xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-6 h-6" />
                      <span>Join Tournament - {formatCurrency(tournament.entryFee)}</span>
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="bg-gray-700/50 rounded-xl p-6 text-center border border-gray-600">
                <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">
                  {spotsLeft === 0 ? '❌ Tournament is Full' : '🔒 Registration Closed'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Details and Bracket */}
      {showBracket && (
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-5 h-5" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bracket'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Bracket
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'bracket' && showBracket ? (
        <TournamentBracket tournamentId={tournament.id} />
      ) : (
        <>
          {/* Tournament Schedule */}
          {(tournament.startDate || tournament.endDate) && (
            <div className="card-raid p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                Tournament Schedule
              </h2>
              <div className="space-y-4">
                {tournament.startDate && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-sm">Start Date</h3>
                        <p className="text-white font-semibold">{new Date(tournament.startDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tournament.endDate && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-sm">End Date</h3>
                        <p className="text-white font-semibold">{new Date(tournament.endDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tournament Rules */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="card-raid p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-orange-500" />
                Rules & Guidelines
              </h2>
              <div className="space-y-3">
                {tournament.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prize Distribution */}
          {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
            <div className="card-raid p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-orange-500" />
                Prize Distribution
              </h2>
              <div className="space-y-3">
                {tournament.prizeDistribution.map((prize, index) => {
                  const icons = [
                    { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
                    { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40' },
                    { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' }
                  ];
                  const config = icons[index] || icons[2];
                  const Icon = config.icon;
                  
                  return (
                    <div key={index} className={`flex items-center justify-between ${config.bg} p-4 rounded-xl border ${config.border} hover:scale-102 transition-transform`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${config.color}`} />
                        <span className="text-white font-bold">{prize.rank}</span>
                      </div>
                      <div className="text-right">
                        <p className={`${config.color} font-bold text-xl`}>{prize.percentage}%</p>
                        <p className="text-gray-400 text-xs">of prize pool</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Prize Pool Highlight */}
              <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Prize Pool</p>
                    <p className="text-green-400 font-bold text-2xl">{formatCurrency(tournament.prizePool)}</p>
                  </div>
                </div>
                <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Tournament Info Card */}
          <div className="card-raid p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-500" />
              Tournament Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Game</p>
                <p className="text-white font-semibold text-lg">{tournament.game}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Region</p>
                <p className="text-white font-semibold text-lg">{tournament.region}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Organizer</p>
                <p className="text-white font-semibold text-lg">{tournament.organizer}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${statusConfig.color} animate-pulse`}></div>
                  <p className="text-white font-semibold">{statusConfig.text}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Results Submission Modal */}
      {showResultsModal && (
        <MatchResultSubmission
          tournamentId={tournament.id}
          tournamentName={tournament.title}
          onClose={() => setShowResultsModal(false)}
          onSubmitted={() => {
            setShowResultsModal(false);
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        .hover\:scale-115:hover {
          transform: scale(1.15);
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}