// src/app/tournament/[id]/page.jsx - ENHANCED MOBILE-FRIENDLY VERSION
'use client';

import Link from 'next/link';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { use, useState, useEffect, Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import TournamentBracket from '@/components/TournamentBracket';
import PaystackPaymentModal from '@/components/PaystackPaymentModal';
import PaymentSuccessHandler from '@/components/PaymentSuccessHandler';
import { useTournament } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { paystackService } from '@/services/paystackService';
import MatchResultSubmission from '@/components/MatchResultSubmission';
import InGameNameModal from '@/components/InGameNameModal';
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
  Zap,
  ChevronRight,
  MessageCircle
} from 'lucide-react';

function TournamentPageContent({ resolvedParams }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { tournament, loading, error, joinTournament, leaveTournament } = useTournament(resolvedParams?.id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasUserPaid, setHasUserPaid] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [placementData, setPlacementData] = useState({ first: null, second: null, third: null });
  const [winnerStats, setWinnerStats] = useState({ first: null, second: null, third: null });
  const [participantData, setParticipantData] = useState(null);
  const [showIgnModal, setShowIgnModal] = useState(false);
  const [ignPrompted, setIgnPrompted] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Show payment success handler if payment=success in URL
  const isPaymentSuccess = searchParams.get('payment') === 'success';
  if (isPaymentSuccess) {
    return <PaymentSuccessHandler tournamentId={resolvedParams?.id} />;
  }

  useEffect(() => {
    if (!user || !resolvedParams?.id) return;
    const participantRef = doc(db, 'tournament_participants', `${resolvedParams.id}_${user.id}`);
    const unsub = onSnapshot(participantRef, (snap) => {
      const exists = snap.exists();
      setIsParticipant(exists);
      const data = exists ? snap.data() : null;
      setParticipantData(data);
      if (exists && (!data?.inGameName) && !ignPrompted) {
        setShowIgnModal(true);
        setIgnPrompted(true);
      }
    }, (err) => {
      console.error('Participant realtime error:', err);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user, resolvedParams?.id, ignPrompted]);

  const handleSaveIgn = async (ign) => {
    const participantRef = doc(db, 'tournament_participants', `${resolvedParams.id}_${user.id}`);
    await updateDoc(participantRef, { inGameName: ign, inGameNameUpdatedAt: serverTimestamp() });
  };

  // Recovery: if user has paid but isn't joined yet, auto-join idempotently
  useEffect(() => {
    const recoverJoinIfPaid = async () => {
      try {
        if (!user?.id || !resolvedParams?.id) return;
        if (isParticipant) return;

        const paid = await paystackService.hasUserPaidForTournament(user.id, resolvedParams.id);
        if (!paid) return;

        // Attempt join; treat 'already joined' as success
        try {
          await joinTournament(user.id);
        } catch (e) {
          const msg = String(e?.message || '').toLowerCase();
          if (!msg.includes('already joined')) {
            console.warn('Auto-join after payment failed:', e?.message);
          }
        }

        // Mark participant as paid if doc exists now
        try {
          const partRef = doc(db, 'tournament_participants', `${resolvedParams.id}_${user.id}`);
          await updateDoc(partRef, {
            paymentStatus: 'completed',
            paidAt: serverTimestamp(),
          });
        } catch {}
      } catch (err) {
        console.warn('Recover join check failed:', err?.message);
      }
    };

    recoverJoinIfPaid();
  }, [user?.id, resolvedParams?.id, isParticipant, joinTournament]);

  // Load winner and placement data with stats
  useEffect(() => {
    const loadWinnerData = async () => {
      if (!tournament) return;
      
      if (tournament.status !== 'completed') {
        setPlacementData({ first: null, second: null, third: null });
        setWinnerStats({ first: null, second: null, third: null });
        return;
      }
      try {
        const placements = { first: null, second: null, third: null };
        const stats = { first: null, second: null, third: null };
        
        const tournamentRef = doc(db, 'tournaments', resolvedParams.id);
        const tournamentSnap = await getDoc(tournamentRef);
        
        if (!tournamentSnap.exists()) return;
        
        const rawData = tournamentSnap.data();
        
        // Load first place with stats
        if (rawData.winnerId) {
          const [firstDoc, firstStatsDoc] = await Promise.all([
            getDoc(doc(db, 'users', rawData.winnerId)),
            getDoc(doc(db, 'userStats', rawData.winnerId))
          ]);
          
          if (firstDoc.exists()) {
            placements.first = { id: firstDoc.id, ...firstDoc.data() };
            stats.first = firstStatsDoc.exists() ? firstStatsDoc.data() : {
              tournamentsPlayed: 0,
              tournamentsWon: 0,
              totalEarnings: 0,
              winRate: 0
            };
          }
        }

        // Load second place with stats
        if (rawData.secondPlaceId) {
          const [secondDoc, secondStatsDoc] = await Promise.all([
            getDoc(doc(db, 'users', rawData.secondPlaceId)),
            getDoc(doc(db, 'userStats', rawData.secondPlaceId))
          ]);
          
          if (secondDoc.exists()) {
            placements.second = { id: secondDoc.id, ...secondDoc.data() };
            stats.second = secondStatsDoc.exists() ? secondStatsDoc.data() : {
              tournamentsPlayed: 0,
              tournamentsWon: 0,
              totalEarnings: 0,
              winRate: 0
            };
          }
        }

        // Load third place with stats
        if (rawData.thirdPlaceId) {
          const [thirdDoc, thirdStatsDoc] = await Promise.all([
            getDoc(doc(db, 'users', rawData.thirdPlaceId)),
            getDoc(doc(db, 'userStats', rawData.thirdPlaceId))
          ]);
          
          if (thirdDoc.exists()) {
            placements.third = { id: thirdDoc.id, ...thirdDoc.data() };
            stats.third = thirdStatsDoc.exists() ? thirdStatsDoc.data() : {
              tournamentsPlayed: 0,
              tournamentsWon: 0,
              totalEarnings: 0,
              winRate: 0
            };
          }
        }

        setPlacementData(placements);
        setWinnerStats(stats);
      } catch (err) {
        console.error('Error loading winner data:', err);
      }
    };

    loadWinnerData();
  }, [tournament, resolvedParams.id]);

  // Subscribe to chat unread counts (DMs only)
  useEffect(() => {
    if (!user?.id || !resolvedParams?.id || !isParticipant) return;

    const unsubscribers = [];
    const unreadCountsRef = { counts: {} };

    // Subscribe to DMs with all participants
    const loadDMUnreads = async () => {
      try {
        const participantsRef = collection(db, 'tournament_participants');
        const q = query(participantsRef, where('tournamentId', '==', resolvedParams.id));
        const snapshot = await getDocs(q);
        
        const participants = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.userId && data.userId !== user.id) {
            participants.push(data.userId);
            unreadCountsRef.counts[data.userId] = 0;
          }
        });

        // For each participant, subscribe to their unread DMs
        participants.forEach((otherUserId) => {
          const conversationId = [user.id, otherUserId].sort().join('_');
          const dmQuery = query(
            collection(db, 'direct_messages', conversationId, 'messages'),
            where('recipientId', '==', user.id),
            where('read', '==', false)
          );
          
          const dmUnsub = onSnapshot(dmQuery, (dmSnapshot) => {
            // Update count for this specific user
            unreadCountsRef.counts[otherUserId] = dmSnapshot.size;
            
            // Recalculate total from all users
            const total = Object.values(unreadCountsRef.counts).reduce((sum, count) => sum + count, 0);
            setChatUnreadCount(total);
          });
          unsubscribers.push(dmUnsub);
        });
      } catch (err) {
        console.error('Error loading DM unreads:', err);
      }
    };
    
    loadDMUnreads();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user?.id, resolvedParams?.id, isParticipant]);

  const handleJoinTournament = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Always go to success page (whether payment needed or not)
    // This allows users to input IGN and phone number
    if (tournament.entryFee && tournament.entryFee > 0) {
      // Payment required - show payment modal
      setShowPaymentModal(true);
    } else {
      // Free tournament - go directly to success page for IGN/phone input
      router.push(`/payment/success?tournamentId=${tournament.id}`);
    }
  };

  const handlePaymentError = (error) => {
    setActionError(error.message || 'Payment failed');
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

  const formatCurrency = (amount) => {
    // tournament.currency is now a symbol (₦ or ₵)
    const symbol = tournament.currency || '₵';
    return `${symbol}${amount.toLocaleString()}`;
  };

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

// Winners Podium - Enhanced & More User Friendly
const WinnerPodium = () => {
  if (!placementData.first) return null;

  const WinnerCard = ({ player, stats, placement }) => {
    const configs = {
      first: {
        icon: Crown,
        color: 'text-yellow-400',
        bg: 'from-yellow-500/25 to-yellow-600/10',
        border: 'border-yellow-500/40',
        ring: 'ring-yellow-500/30',
        title: 'CHAMPION',
        emoji: '🥇',
        position: '1st'
      },
      second: {
        icon: Medal,
        color: 'text-gray-300',
        bg: 'from-gray-500/25 to-gray-600/10',
        border: 'border-gray-500/40',
        ring: 'ring-gray-500/30',
        title: '2nd Place',
        emoji: '🥈',
        position: '2nd'
      },
      third: {
        icon: Medal,
        color: 'text-orange-400',
        bg: 'from-orange-500/25 to-orange-600/10',
        border: 'border-orange-500/40',
        ring: 'ring-orange-500/30',
        title: '3rd Place',
        emoji: '🥉',
        position: '3rd'
      }
    };

    const config = configs[placement];
    const Icon = config.icon;

    return (
      <Link href={`/users/${player.id}`}>
        <div
          className={`bg-gradient-to-br ${config.bg} rounded-2xl p-4 pb-8 border ${config.border} hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-xl`}
        >
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className={`w-6 h-6 ${config.color}`} />
              <span className={`${config.color} font-bold`}>{config.title}</span>
            </div>
            <span className="text-2xl">{config.emoji}</span>
          </div>

{/* Avatar + Crown (Champion Only) */}
<div className="flex justify-center mb-4 relative">
 {placement === 'first' && (
  <div className="absolute -top-8 right-24 animate-bounce transform rotate-25">
    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
  </div>
)}


  <div className="relative w-24 h-24">
    <div
      className={`absolute inset-0 rounded-full blur-xl opacity-40 ${
        placement === 'first'
          ? 'bg-yellow-500'
          : placement === 'second'
          ? 'bg-gray-400'
          : 'bg-orange-400'
      }`}
    ></div>

    <div
      className={`relative w-full h-full rounded-full overflow-hidden border-4 ${config.border} ring-4 ${config.ring}`}
    >
      {player.avatarUrl ? (
        <img
          src={player.avatarUrl}
          alt={player.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <span className="text-white text-xl font-bold">
            {player.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  </div>
</div>


          {/* Username */}
          <h3 className="text-center font-bold text-lg text-white truncate">
            {player.username}
          </h3>
          <p className="text-center text-gray-400 text-xs mb-5">
            {player.firstName} {player.lastName}
          </p>

          {/* Stats Section */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <div className="text-center">
                <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{stats.tournamentsWon || 0}</p>
                <p className="text-gray-400 text-xs">Wins</p>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{stats.tournamentsPlayed || 0}</p>
                <p className="text-gray-400 text-xs">Played</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{stats.winRate?.toFixed(0) || 0}%</p>
                <p className="text-gray-400 text-xs">Rate</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5 flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors">
            <span className="text-xs font-medium">View Profile</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="mb-10 animate-fade-in">
      <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-3xl p-5 border border-orange-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-white">
              🏆 Champions
            </h2>
            <p className="text-gray-400 text-sm">
              The top players of this tournament
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6">
            {placementData.second && <WinnerCard player={placementData.second} stats={winnerStats.second} placement="second" />}
            <WinnerCard player={placementData.first} stats={winnerStats.first} placement="first" />
            {placementData.third && <WinnerCard player={placementData.third} stats={winnerStats.third} placement="third" />}
          </div>

          {/* Mobile Layout – stacked with bigger spacing */}
          <div className="sm:hidden space-y-8">
            <WinnerCard player={placementData.first} stats={winnerStats.first} placement="first" />
            {placementData.second && (
              <div className="mt-4">
                <WinnerCard player={placementData.second} stats={winnerStats.second} placement="second" />
              </div>
            )}
            {placementData.third && (
              <div className="mt-2">
                <WinnerCard player={placementData.third} stats={winnerStats.third} placement="third" />
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

      {/* Tournament Hero Section */}
      <div className={`card-raid p-4 sm:p-6 mb-6 bg-gradient-to-br ${statusConfig.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 animate-shimmer"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-orange-400 text-xs sm:text-sm font-semibold">{tournament.game}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{tournament.title}</h1>
              {tournament.description && (
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{tournament.description}</p>
              )}
            </div>
            
            <div className={`${statusConfig.color} px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2 animate-pulse shadow-lg`}>
              <span className="text-base sm:text-xl">{statusConfig.icon}</span>
              <span className="whitespace-nowrap">{statusConfig.text}</span>
            </div>
          </div>

          {/* Tournament Stats Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 opacity-50" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{tournament.currentPlayers}</p>
              <p className="text-gray-400 text-xs mt-1">Players</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 opacity-50" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{formatCurrency(tournament.prizePool)}</p>
              <p className="text-gray-400 text-xs mt-1">Prize Pool</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50 hover:border-green-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 opacity-50" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{formatCurrency(tournament.entryFee)}</p>
              <p className="text-gray-400 text-xs mt-1">Entry Fee</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 opacity-50" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{tournament.maxPlayers}</p>
              <p className="text-gray-400 text-xs mt-1">Max Players</p>
            </div>
          </div>

          {/* Progress Bar */}
          {tournament.status !== 'completed' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  Registration Progress
                </span>
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {tournament.currentPlayers} / {tournament.maxPlayers}
                </span>
              </div>
              <div className="relative w-full bg-gray-800 rounded-full h-3 sm:h-4 overflow-hidden border border-gray-700">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer-fast"></div>
                </div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 flex items-center gap-2">
                {spotsLeft > 0 ? (
                  <>
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="text-orange-400 font-semibold">{spotsLeft} spots remaining!</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    <span className="text-red-400 font-semibold">Tournament is full!</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="mt-6">
            {tournament.status === 'completed' ? (
              <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 text-center border border-gray-600">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-gray-300 font-semibold text-base sm:text-lg mb-1">Tournament Ended</p>
                <p className="text-gray-500 text-xs sm:text-sm">Thanks to all participants!</p>
              </div>
            ) : tournament.status === 'live' ? (
              <div className="space-y-3">
                <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 sm:p-6">
                  <p className="text-green-400 font-semibold mb-2 flex items-center justify-center gap-2 text-base sm:text-lg">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Tournament is Live!
                  </p>
                  {isParticipant && (
                    <>
                      <p className="text-gray-300 text-xs sm:text-sm mb-4 text-center">Check your matches and submit results below</p>
                      
                      <button
                        onClick={() => setShowResultsModal(true)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 text-sm sm:text-base"
                      >
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold text-base sm:text-lg">You're Registered!</p>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1">Get ready for the tournament</p>
                  </div>
                  
                  {/* Chat Button */}
                  <button
                    onClick={() => {
                      if (actionLoading) return;
                      setActionLoading(true);
                      router.push(`/tournament/${resolvedParams.id}/chat`);
                    }}
                    disabled={actionLoading}
                    className="relative w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                        <span>Opening Chat...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Tournament Chat</span>
                        {chatUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold">
                            {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleLeaveTournament}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm sm:text-base"
                  >
                    {actionLoading ? 'Processing...' : 'Leave Tournament'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleJoinTournament}
                  disabled={actionLoading || spotsLeft === 0}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Join Tournament - {formatCurrency(tournament.entryFee)}</span>
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 text-center border border-gray-600">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold text-sm sm:text-base">
                  {spotsLeft === 0 ? '❌ Tournament is Full' : '🔒 Registration Closed'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {tournament.status === 'completed' && placementData.first && (
        <WinnerPodium />
      )}

      {/* Tabs for Details and Bracket */}
      {showBracket && (
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base ${
                activeTab === 'details'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Details</span>
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base ${
                activeTab === 'bracket'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Bracket</span>
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
            <div className="card-raid p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                Tournament Schedule
              </h2>
              <div className="space-y-4">
                {tournament.startDate && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Start Date</h3>
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{new Date(tournament.startDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tournament.endDate && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-gray-400 text-xs sm:text-sm">End Date</h3>
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{new Date(tournament.endDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of the existing content - Rules, Prize Distribution, etc. */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="card-raid p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                Rules & Guidelines
              </h2>
              <div className="space-y-3">
                {tournament.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-orange-500/50 transition-all">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-400 font-bold text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
            <div className="card-raid p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
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
                    <div key={index} className={`flex items-center justify-between ${config.bg} p-3 sm:p-4 rounded-xl border ${config.border} hover:scale-102 transition-transform`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.color}`} />
                        <span className="text-white font-bold text-sm sm:text-base">{prize.rank}</span>
                      </div>
                      <div className="text-right">
                        <p className={`${config.color} font-bold text-lg sm:text-xl`}>{prize.percentage}%</p>
                        <p className="text-gray-400 text-xs">of prize pool</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Prize Pool</p>
                    <p className="text-green-400 font-bold text-xl sm:text-2xl">{formatCurrency(tournament.prizePool)}</p>
                  </div>
                </div>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Tournament Info Card */}
          <div className="card-raid p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              Tournament Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Game</p>
                <p className="text-white font-semibold text-base sm:text-lg">{tournament.game}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Region</p>
                <p className="text-white font-semibold text-base sm:text-lg">{tournament.region}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Organizer</p>
                <p className="text-white font-semibold text-base sm:text-lg">{tournament.organizer}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${statusConfig.color} animate-pulse`}></div>
                  <p className="text-white font-semibold text-sm sm:text-base">{statusConfig.text}</p>
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

      {/* Paystack Payment Modal */}
      <PaystackPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        tournament={tournament}
        user={user}
        onPaymentError={handlePaymentError}
      />

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

export default function TournamentPage({ params }) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={
      <div className="container-mobile min-h-screen py-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <TournamentPageContent resolvedParams={resolvedParams} />
    </Suspense>
  );
}