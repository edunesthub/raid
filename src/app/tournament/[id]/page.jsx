'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useTournament } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';

export default function TournamentPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { tournament, loading, error, joinTournament, leaveTournament } = useTournament(resolvedParams?.id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleJoinTournament = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await joinTournament(user.id);
      // Success message could be shown here
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTournament = async () => {
    if (!isAuthenticated) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await leaveTournament(user.id);
    } catch (err) {
      setActionError(err.message);
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
          <Link href="/" className="text-blue-400 hover:text-blue-300">
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'registration-open': return 'bg-blue-600';
      case 'upcoming': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'LIVE NOW';
      case 'registration-open': return 'REGISTRATION OPEN';
      case 'upcoming': return 'UPCOMING';
      default: return status.toUpperCase();
    }
  };

  const progressPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;
  const isParticipant = tournament.participants?.includes(user?.id);

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
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

      {/* Tournament Header */}
      <div className="card-raid p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{tournament.title}</h1>
              <p className="text-gray-400">{tournament.game}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(tournament.status)}`}>
            {getStatusText(tournament.status)}
          </div>
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
          <p className="text-gray-400 text-sm">
            {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Tournament is full!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {tournament.status === 'registration-open' && spotsLeft > 0 ? (
            isParticipant ? (
              <button 
                onClick={handleLeaveTournament}
                disabled={actionLoading}
                className="btn-raid w-full bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Processing...' : 'Leave Tournament'}
              </button>
            ) : (
              <button 
                onClick={handleJoinTournament}
                disabled={actionLoading}
                className="btn-raid w-full"
              >
                {actionLoading ? 'Processing...' : `Join Tournament - ${formatCurrency(tournament.entryFee, tournament.currency)}`}
              </button>
            )
          ) : tournament.status === 'live' ? (
            <button className="btn-raid w-full bg-green-600 hover:bg-green-700">
              <span className="mr-2">📺</span>
              Watch Live
            </button>
          ) : (
            <button className="btn-raid w-full opacity-50 cursor-not-allowed" disabled>
              Registration Closed
            </button>
          )}
        </div>
      </div>

      {/* Tournament Schedule */}
      <div className="card-raid p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Schedule</h2>
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
          <h2 className="text-xl font-bold text-white mb-4">Rules</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {tournament.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {tournament.requirements && tournament.requirements.length > 0 && (
        <div className="card-raid p-6">
          <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {tournament.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prize Distribution */}
      {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
        <div className="card-raid p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Prize Distribution</h2>
          <div className="space-y-3">
            {tournament.prizeDistribution.map((prize, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                <span className="text-gray-300">{prize.rank}</span>
                <span className="text-white font-bold">{prize.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}