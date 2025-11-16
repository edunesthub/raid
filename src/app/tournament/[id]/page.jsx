// src/app/tournament/[id]/page.jsx - ENHANCED WITH WINNER DISPLAY
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
import { Trophy, Medal, Award, Crown, Star, Users, Calendar, Clock, Target } from 'lucide-react';

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
  const [winnerData, setWinnerData] = useState(null);
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
        // Load winner
        if (tournament.winnerId) {
          const winnerDoc = await getDoc(doc(db, 'users', tournament.winnerId));
          if (winnerDoc.exists()) {
            setWinnerData({ id: winnerDoc.id, ...winnerDoc.data() });
          }
        }

        // Load placements
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

  const formatCurrency = (amount, currency = 'GHS') => {
    if (currency === 'GHS') {
      return `₵${amount.toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'registration-open':
        return {
          color: 'bg-blue-600',
          text: 'REGISTRATION OPEN',
          icon: '🔥',
          description: 'Join now!'
        };
      case 'upcoming':
        return {
          color: 'bg-yellow-600',
          text: 'UPCOMING',
          icon: '⏰',
          description: 'Starting soon'
        };
      case 'live':
        return {
          color: 'bg-green-600',
          text: 'LIVE NOW',
          icon: '🔴',
          description: 'Tournament in progress'
        };
      case 'completed':
        return {
          color: 'bg-gray-600',
          text: 'COMPLETED',
          icon: '✅',
          description: 'Tournament ended'
        };
      default:
        return {
          color: 'bg-gray-600',
          text: status?.toUpperCase() || 'UNKNOWN',
          icon: '❓',
          description: ''
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
      <div className="mb-8">
        <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent rounded-2xl p-8 border border-yellow-500/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Tournament Champions
              <Trophy className="w-8 h-8 text-yellow-400" />
            </h2>
            <p className="text-gray-400">The best of the best</p>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 2nd Place */}
            {placementData.second && (
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-400 shadow-2xl">
                    {placementData.second.avatarUrl ? (
                      <img 
                        src={placementData.second.avatarUrl} 
                        alt={placementData.second.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-gray-600 to-gray-400 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {placementData.second.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-900">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{placementData.second.username}</h3>
                <p className="text-gray-400 text-sm mb-2">2nd Place</p>
                <div className="bg-gray-400/20 px-4 py-2 rounded-full">
                  <Medal className="w-5 h-5 text-gray-400 inline mr-2" />
                  <span className="text-gray-300 font-semibold">Silver</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            <div className="order-1 md:order-2 flex flex-col items-center transform md:scale-110">
              <div className="relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                  {placementData.first.avatarUrl ? (
                    <img 
                      src={placementData.first.avatarUrl} 
                      alt={placementData.first.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {placementData.first.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-12 h-12 text-yellow-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-gray-900">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{placementData.first.username}</h3>
              <p className="text-yellow-400 text-sm mb-2 font-semibold">🏆 CHAMPION</p>
              <div className="bg-yellow-400/20 px-6 py-3 rounded-full border-2 border-yellow-400/50">
                <Trophy className="w-6 h-6 text-yellow-400 inline mr-2" />
                <span className="text-yellow-400 font-bold text-lg">Winner</span>
              </div>
            </div>

            {/* 3rd Place */}
            {placementData.third && (
              <div className="order-3 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-600 shadow-2xl">
                    {placementData.third.avatarUrl ? (
                      <img 
                        src={placementData.third.avatarUrl} 
                        alt={placementData.third.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-orange-700 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {placementData.third.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-900">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{placementData.third.username}</h3>
                <p className="text-gray-400 text-sm mb-2">3rd Place</p>
                <div className="bg-orange-600/20 px-4 py-2 rounded-full">
                  <Medal className="w-5 h-5 text-orange-600 inline mr-2" />
                  <span className="text-orange-400 font-semibold">Bronze</span>
                </div>
              </div>
            )}
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
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Tournaments
        </Link>
      </div>

      {actionError && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {isParticipant && tournament.status !== 'completed' && (
        <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm flex items-center">
            <span className="mr-2">✅</span>
            You are registered for this tournament!
          </p>
        </div>
      )}

      {/* Winner Announcement */}
      {tournament.status === 'completed' && placementData.first && (
        <WinnerPodium />
      )}

      {/* Tournament Header */}
      <div className="card-raid p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{tournament.title}</h1>
              <p className="text-gray-400">{tournament.game}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold text-white ${statusConfig.color} flex items-center gap-2 animate-pulse`}>
            <span>{statusConfig.icon}</span>
            {statusConfig.text}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <p className="text-gray-300 text-sm">{statusConfig.description}</p>
        </div>

        <p className="text-gray-300 mb-6">{tournament.description}</p>

        {/* Tournament Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{tournament.currentPlayers}</p>
            <p className="text-gray-400 text-sm">Players</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatCurrency(tournament.prizePool)}</p>
            <p className="text-gray-400 text-sm">Prize Pool</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatCurrency(tournament.entryFee)}</p>
            <p className="text-gray-400 text-sm">Entry Fee</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{tournament.format}</p>
            <p className="text-gray-400 text-sm">Format</p>
          </div>
        </div>

        {tournament.status !== 'completed' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Players Registered</span>
              <span className="text-white font-semibold">
                {tournament.currentPlayers} / {tournament.maxPlayers}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-black to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {spotsLeft > 0 ? (
              <p className="text-gray-400 text-sm">
                🔥 {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining!
              </p>
            ) : (
              <p className="text-red-400 text-sm">❌ Tournament is full!</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center">
          {tournament.status === 'completed' ? (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-400 font-semibold">This tournament has ended</p>
              <p className="text-gray-500 text-sm mt-1">Thanks to all participants!</p>
            </div>
          ) : tournament.status === 'live' ? (
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Tournament is Live!
              </p>
              {isParticipant ? (
                <>
                  <p className="text-gray-300 text-sm mb-3">Good luck! Check the bracket below for your matches.</p>
                  
                  <button
                    onClick={() => setShowResultsModal(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg mt-2 flex items-center justify-center gap-2"
                  >
                    <span>📸</span>
                    Submit Match Results
                  </button>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Registration is closed</p>
              )}
            </div>
          ) : canJoin ? (
            isParticipant ? (
              <div className="space-y-3">
                <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">✅ You're In!</p>
                  <p className="text-gray-300 text-sm mt-1">You're registered for this tournament</p>
                </div>
                <button 
                  onClick={handleLeaveTournament}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Leave Tournament'}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleJoinTournament}
                disabled={actionLoading || spotsLeft === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  `Join Tournament - ${formatCurrency(tournament.entryFee, tournament.currency)}`
                )}
              </button>
            )
          ) : (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400">
                {spotsLeft === 0 ? '❌ Tournament is full' : '🔒 Registration is closed'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs for Details and Bracket */}
      {showBracket && (
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'bracket'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
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
          <div className="card-raid p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" />
              Schedule
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Start Date</h3>
                <p className="text-white">{formatDate(tournament.startDate)}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">End Date</h3>
                <p className="text-white">{formatDate(tournament.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Tournament Rules */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="card-raid p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">📜 Rules</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {tournament.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {tournament.requirements && tournament.requirements.length > 0 && (
            <div className="card-raid p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">✅ Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {tournament.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prize Distribution */}
          {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
            <div className="card-raid p-6">
              <h2 className="text-xl font-bold text-white mb-4">🏆 Prize Distribution</h2>
              <div className="space-y-3">
                {tournament.prizeDistribution.map((prize, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg">
                    <span className="text-gray-300 font-semibold">{prize.rank}</span>
                    <span className="text-white font-bold text-lg">{prize.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
}