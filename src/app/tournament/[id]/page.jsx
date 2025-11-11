'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useTournament } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TournamentPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { tournament, loading, error, joinTournament, leaveTournament } = useTournament(resolvedParams?.id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);

  // Check if user is participant
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

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/tournament"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Tournaments
        </Link>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {/* Success Message for Participants */}
      {isParticipant && (
        <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm flex items-center">
            <span className="mr-2">✅</span>
            You are registered for this tournament!
          </p>
        </div>
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

        {/* Status Description */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <p className="text-gray-300 text-sm">{statusConfig.description}</p>
        </div>

        <p className="text-gray-300 mb-6">{tournament.description}</p>

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Prize Pool</h3>
            <p className="text-3xl font-extrabold text-green-400">
              {formatCurrency(tournament.prizePool, tournament.currency)}
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Entry Fee</h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(tournament.entryFee, tournament.currency)}
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Format</h3>
            <p className="text-white font-semibold">{tournament.format}</p>
          </div>
        </div>

        {/* Registration Progress */}
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

        {/* Action Buttons */}
        <div className="text-center">
          {tournament.status === 'completed' ? (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400">This tournament has ended</p>
            </div>
          ) : tournament.status === 'live' ? (
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2">🔴 Tournament is Live!</p>
              {isParticipant ? (
                <p className="text-gray-300 text-sm">Good luck! Check your email for match details.</p>
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

      {/* Tournament Schedule */}
      <div className="card-raid p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 Schedule</h2>
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
    </div>
  );
}