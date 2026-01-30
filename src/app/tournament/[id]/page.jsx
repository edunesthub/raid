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
        } catch { }
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
          text: 'UPLINK_OPEN',
          icon: '💠',
          gradient: 'from-blue-500/20 to-blue-600/5'
        };
      case 'upcoming':
        return {
          color: 'bg-purple-600',
          text: 'SCHEDULED',
          icon: '⏳',
          gradient: 'from-purple-500/20 to-purple-600/5'
        };
      case 'live':
        return {
          color: 'bg-pink-600',
          text: 'NODE_LIVE',
          icon: '📡',
          gradient: 'from-pink-500/20 to-pink-600/5'
        };
      case 'completed':
        return {
          color: 'bg-gray-800',
          text: 'ARCHIVED',
          icon: '📁',
          gradient: 'from-gray-500/10 to-gray-600/5'
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
            className={`bg-black/60 backdrop-blur-md rounded-none p-5 pb-8 border ${config.border} hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden group`}
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rotate-45 translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors"></div>

            {/* Title Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${config.color} shadow-[0_0_10px_currentColor]`} />
                <span className={`${config.color} font-black text-[10px] uppercase tracking-widest`}>{config.title}</span>
              </div>
              <span className="text-xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{config.emoji}</span>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-6 relative">
              <div className="relative w-24 h-24">
                <div className={`absolute inset-0 rounded-none blur-xl opacity-20 ${config.color.replace('text-', 'bg-')}`}></div>
                <div className={`relative w-full h-full rounded-none overflow-hidden border-2 ${config.border}`} style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center font-black text-2xl text-gray-500">
                      {player.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <h3 className="text-center font-black text-white italic truncate uppercase tracking-tighter text-lg mb-1 group-hover:text-blue-400 transition-colors">
              {player.username}
            </h3>
            <p className="text-center text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
              TERMINAL_ID: {player.id?.slice(0, 8)}
            </p>

            {/* Stats Section */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
                <div className="text-center">
                  <p className="text-white font-black italic text-base">{stats.tournamentsWon || 0}</p>
                  <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">WINS</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-black italic text-base">{stats.tournamentsPlayed || 0}</p>
                  <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">TRIALS</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-black italic text-base">{stats.winRate?.toFixed(0) || 0}%</p>
                  <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">RATIO</p>
                </div>
              </div>
            )}
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
      <div className={`card-raid p-6 sm:p-8 mb-8 bg-black/40 border-blue-500/30 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-2 h-20 bg-blue-500 shadow-[0_0_15px_#00f3ff]"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-blue-400" />
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">// {tournament.game}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
                {tournament.title}
              </h1>
              {tournament.description && (
                <p className="text-blue-300/60 text-xs sm:text-sm font-bold uppercase tracking-wide mb-6 max-w-2xl leading-relaxed">
                  [REMARK]: {tournament.description}
                </p>
              )}

              {tournament.twitch_link && (
                <a
                  href={tournament.twitch_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_#9146FF] group"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </div>
                  <span>LIVE_FEED</span>
                </a>
              )}
            </div>

            <div className={`${statusConfig.color} px-6 py-3 text-[10px] font-black text-white italic tracking-tighter flex items-center gap-3 shadow-lg`} style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}>
              <span className="text-lg">{statusConfig.icon}</span>
              <span className="whitespace-nowrap tracking-[0.2em]">{statusConfig.text}</span>
            </div>
          </div>

          {/* Tournament Stats Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-black/40 border border-blue-500/20 p-5 group hover:border-blue-500/50 transition-all shadow-[0_0_15px_rgba(0,243,255,0.05)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-blue-400 opacity-50" />
                <div className="w-1 h-3 bg-blue-500"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter group-hover:text-blue-400 transition-colors">{tournament.currentPlayers}</p>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">OPERATIVES_CON</p>
            </div>

            <div className="bg-black/40 border border-pink-500/20 p-5 group hover:border-pink-500/50 transition-all shadow-[0_0_15px_rgba(255,0,255,0.05)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-4 h-4 text-pink-400 opacity-50" />
                <div className="w-1 h-3 bg-pink-500"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter group-hover:text-pink-400 transition-colors">{formatCurrency(tournament.prizePool)}</p>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">CREDIT_REWARD</p>
            </div>

            <div className="bg-black/40 border border-cyan-500/20 p-5 group hover:border-cyan-500/50 transition-all shadow-[0_0_15px_rgba(0,243,255,0.05)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-cyan-400 opacity-50" />
                <div className="w-1 h-3 bg-cyan-500"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter group-hover:text-cyan-400 transition-colors">{formatCurrency(tournament.entryFee)}</p>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">UPLINK_COST</p>
            </div>

            <div className="bg-black/40 border border-purple-500/20 p-5 group hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(157,0,255,0.05)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-4 h-4 text-purple-400 opacity-50" />
                <div className="w-1 h-3 bg-purple-500"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-black italic text-white tracking-tighter group-hover:text-purple-400 transition-colors">{tournament.maxPlayers}</p>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">CAPACITY_LIMIT</p>
            </div>
          </div>

          {/* Progress Bar */}
          {tournament.status !== 'completed' && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-blue-500"></div>
                  REGISTRATION_FLOW
                </span>
                <span className="text-white font-black italic text-xs tracking-widest bg-blue-500/10 px-3 py-1 border border-blue-500/20">
                  {tournament.currentPlayers} / {tournament.maxPlayers} UNIT_SYNC
                </span>
              </div>
              <div className="relative w-full bg-blue-900/10 border border-blue-500/20 h-4 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 1% 100%, 0 70%)' }}>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer-fast"></div>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">
                {spotsLeft > 0 ? (
                  <span className="text-cyan-400 animate-pulse">// {spotsLeft} NODES_AVAILABLE_FOR_LINK</span>
                ) : (
                  <span className="text-pink-500">// ALL_NODES_OCCUPIED</span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="mt-10">
            {tournament.status === 'completed' ? (
              <div className="bg-blue-600/5 border border-white/10 p-8 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 15%, 100% 100%, 5% 100%, 0 85%)' }}>
                <Trophy className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-40 shadow-[0_0_15px_rgba(0,243,255,0.4)]" />
                <p className="text-white font-black italic uppercase tracking-widest text-lg mb-2">Tournament Terminated</p>
                <p className="text-blue-500/40 text-[10px] font-black uppercase tracking-[0.4em]">// SESSION_RECORDS_STORED</p>
              </div>
            ) : tournament.status === 'live' ? (
              <div className="space-y-6">
                <div className="bg-pink-600/10 border border-pink-500/30 p-8" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
                  <p className="text-pink-500 font-black flex items-center justify-center gap-3 text-xl italic uppercase tracking-tighter mb-4 animate-pulse">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                    </span>
                    ARENA_STATUS: ACTIVE
                  </p>
                  {isParticipant && (
                    <>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center">// TRANSMIT_COMBAT_LOGS_BELOW</p>
                      <button
                        onClick={() => setShowResultsModal(true)}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black italic uppercase tracking-[0.2em] py-5 transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)] active:scale-95"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                      >
                        SUBMIT_TACTICAL_RESULT
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : canJoin ? (
              isParticipant ? (
                <div className="space-y-6">
                  <div className="bg-blue-600/10 border border-blue-500/30 p-8 text-center" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
                    <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-pulse opacity-50" />
                    <p className="text-white font-black italic uppercase tracking-tighter text-2xl mb-2">ACCESS_GRANTED</p>
                    <p className="text-blue-500/40 text-[10px] font-black uppercase tracking-[0.4em]">// PREPARING_FOR_UPLINK</p>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => {
                      if (actionLoading) return;
                      setActionLoading(true);
                      router.push(`/tournament/${resolvedParams.id}/chat`);
                    }}
                    disabled={actionLoading}
                    className="relative w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.2em] py-5 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-95 disabled:opacity-50"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                  >
                    {actionLoading ? (
                      <span>INITIALIZING_COMM...</span>
                    ) : (
                      <>
                        <span>ENTER_COMM_NODE</span>
                        {chatUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-black h-6 min-w-[24px] px-1 blur-none shadow-[0_0_10px_#ff00ff] flex items-center justify-center">
                            {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleLeaveTournament}
                    disabled={actionLoading}
                    className="w-full bg-transparent border-2 border-red-500/40 text-red-500/40 hover:text-red-500 hover:border-red-500 font-black italic uppercase tracking-[0.2em] py-4 transition-all active:scale-95 disabled:opacity-50"
                    style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}
                  >
                    {actionLoading ? 'SHUTTING_DOWN...' : 'ABORT_UPLINK'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoinTournament}
                  disabled={actionLoading || spotsLeft === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.2em] py-6 transition-all shadow-[0_0_30px_rgba(0,243,255,0.4)] active:scale-95 disabled:opacity-40"
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-5 h-5 border-2 border-white/50 border-t-white animate-spin"></div>
                      <span>SYNCING_DATA...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <Trophy className="w-6 h-6" />
                      <span>INITIALIZE_UPLINK - {formatCurrency(tournament.entryFee)}</span>
                    </div>
                  )}
                </button>
              )
            ) : (
              <div className="bg-white/5 border border-white/10 p-10 text-center" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
                <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-black italic uppercase tracking-[0.3em] text-lg">
                  {spotsLeft === 0 ? 'CAPACITY_REACHED' : 'SIGNAL_CLOSED'}
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
        <div className="mb-8">
          <div className="flex gap-2 bg-black/40 border border-blue-500/20 p-1.5" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-6 font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 text-sm ${activeTab === 'details'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'text-gray-500 hover:text-blue-400'
                }`}
              style={activeTab === 'details' ? { clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' } : {}}
            >
              <Award className="w-4 h-4" />
              <span>Module_Data</span>
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`flex-1 py-3 px-6 font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 text-sm ${activeTab === 'bracket'
                ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]'
                : 'text-gray-500 hover:text-pink-400'
                }`}
              style={activeTab === 'bracket' ? { clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' } : {}}
            >
              <Trophy className="w-4 h-4" />
              <span>Tactical_Grid</span>
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
            <div className="card-raid p-6 mb-8 relative">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">CHRONOS_SCHEDULE</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {tournament.startDate && (
                  <div className="bg-black/40 border border-blue-500/20 p-5 group hover:border-blue-500/40 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
                        <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-blue-500/50 text-[9px] font-black uppercase tracking-[0.3em] mb-1">INITIAL_BOOT_TIME</h3>
                        <p className="text-white font-black italic text-base uppercase tracking-tight">{new Date(tournament.startDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {tournament.endDate && (
                  <div className="bg-black/40 border border-pink-500/20 p-5 group hover:border-pink-500/40 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 flex items-center justify-center" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
                        <Clock className="w-6 h-6 text-pink-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-pink-500/50 text-[9px] font-black uppercase tracking-[0.3em] mb-1">FINAL_SHUTDOWN</h3>
                        <p className="text-white font-black italic text-base uppercase tracking-tight">{new Date(tournament.endDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rules & Guidelines */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="card-raid p-6 mb-8 relative">
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">ENGAGEMENT_PROTOCOLS</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {tournament.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 bg-black/40 border border-white/5 p-4 hover:border-pink-500/30 transition-all group">
                    <div className="w-6 h-6 bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 font-black text-[10px] text-pink-500 group-hover:bg-pink-500 group-hover:text-black transition-all">
                      {index + 1}
                    </div>
                    <p className="text-gray-500 font-bold text-xs leading-relaxed group-hover:text-gray-300 transition-colors">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prize Distribution */}
          {tournament.entryFee > 0 && tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
            <div className="card-raid p-6 mb-8 relative">
              <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">BOUNTY_REQUISITION</h2>
              </div>
              <div className="grid gap-4 mb-8">
                {tournament.prizeDistribution.map((prize, index) => {
                  const configs = [
                    { color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
                    { color: 'text-gray-300', border: 'border-gray-500/30', bg: 'bg-gray-500/5' },
                    { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5' }
                  ];
                  const cfg = configs[index] || configs[2];
                  return (
                    <div key={index} className={`flex items-center justify-between p-5 border ${cfg.border} ${cfg.bg} relative overflow-hidden group hover:scale-[1.01] transition-transform`} style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-8 ${cfg.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`}></div>
                        <span className="text-white font-black italic uppercase tracking-tight">{prize.rank}</span>
                      </div>
                      <div className="text-right">
                        <p className={`${cfg.color} font-black text-2xl tracking-tighter italic`}>{prize.percentage}%</p>
                        <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest">STATION_TOTAL</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 flex items-center justify-between relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)' }}>
                <div className="absolute top-0 right-0 w-24 h-full bg-cyan-500/5 skew-x-[-20deg] translate-x-12"></div>
                <div className="flex items-center gap-6">
                  <DollarSign className="w-10 h-10 text-cyan-500 opacity-50" />
                  <div>
                    <h3 className="text-cyan-500/50 text-[10px] font-black uppercase tracking-[0.4em] mb-1">TOTAL_CREDIT_POOL</h3>
                    <p className="text-white font-black italic text-3xl tracking-tighter">{formatCurrency(tournament.prizePool)}</p>
                  </div>
                </div>
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Tournament Info Card */}
          <div className="card-raid p-6 border-blue-500/30 bg-black/40 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-5 h-5 text-blue-500 shadow-[0_0_10px_#00f3ff]" />
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">NODE_SPECIFICATIONS</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-blue-500/10 p-4 transition-all hover:border-blue-500/30">
                <p className="text-blue-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">MODULE_IDENTIFIER</p>
                <p className="text-white font-black italic text-lg uppercase tracking-tight">{tournament.game}</p>
              </div>
              <div className="bg-black/40 border border-blue-500/10 p-4 transition-all hover:border-blue-500/30">
                <p className="text-blue-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">NETWORK_ZONE</p>
                <p className="text-white font-black italic text-lg uppercase tracking-tight">{tournament.region}</p>
              </div>
              <div className="bg-black/40 border border-blue-500/10 p-4 transition-all hover:border-blue-500/30">
                <p className="text-blue-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">SYSTEM_ADMIN</p>
                <p className="text-white font-black italic text-lg uppercase tracking-tight">{tournament.organizer}</p>
              </div>
              <div className="bg-black/40 border border-blue-500/10 p-4 transition-all hover:border-blue-500/30">
                <p className="text-blue-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">OPERATIONAL_STATE</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className={`w-2 h-2 ${statusConfig.color} shadow-[0_0_8px_currentColor] animate-pulse`}></div>
                  <p className="text-white font-black italic text-lg uppercase tracking-tight">{statusConfig.text}</p>
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