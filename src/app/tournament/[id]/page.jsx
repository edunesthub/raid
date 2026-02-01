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
import { userService } from '@/services/userService';
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
  MessageCircle,
  Loader2,
  Edit2,
  Shuffle,
  Swords
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
  const [enrolledTeams, setEnrolledTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [rosterMemberDetails, setRosterMemberDetails] = useState({});
  const [managerEmail, setManagerEmail] = useState(null);

  useEffect(() => {
    setManagerEmail(localStorage.getItem('managerEmail'));
  }, []);

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

  // Load enrolled teams for squad tournaments
  useEffect(() => {
    const fetchEnrolledTeams = async () => {
      if (tournament?.participant_type !== 'Team' || !tournament?.teams || tournament.teams.length === 0) {
        setEnrolledTeams([]);
        return;
      }

      try {
        setTeamsLoading(true);
        const teamsData = [];
        for (const teamId of tournament.teams) {
          const teamDoc = await getDoc(doc(db, 'teams', teamId));
          if (teamDoc.exists()) {
            teamsData.push({ id: teamDoc.id, ...teamDoc.data() });
          }
        }
        setEnrolledTeams(teamsData);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchEnrolledTeams();
  }, [tournament?.teams, tournament?.participant_type]);

  // Load roster profiles for squad tournaments
  useEffect(() => {
    const fetchRosterProfiles = async () => {
      if (tournament?.participant_type !== 'Team' || (!tournament?.rosters && !tournament?.memberPairings)) {
        setRosterMemberDetails({});
        return;
      }

      const allEmails = new Set();

      // Collect from rosters
      if (tournament.rosters) {
        Object.values(tournament.rosters).forEach(roster => {
          if (Array.isArray(roster)) {
            roster.forEach(email => allEmails.add(email));
          }
        });
      }

      // Also collect from pairings (to be safe and handle newly generated pairings)
      if (tournament.memberPairings) {
        tournament.memberPairings.forEach(pair => {
          if (pair.player1?.email) allEmails.add(pair.player1.email);
          if (pair.player2?.email) allEmails.add(pair.player2.email);
        });
      }

      if (allEmails.size === 0) return;

      try {
        const emailsArray = Array.from(allEmails);
        const profiles = await userService.getUsersByEmails(emailsArray);
        const profileMap = {};
        profiles.forEach(p => {
          profileMap[p.email] = p;
        });
        setRosterMemberDetails(profileMap);
      } catch (err) {
        console.error("Error fetching roster profiles:", err);
      }
    };

    fetchRosterProfiles();
  }, [tournament?.rosters, tournament?.memberPairings, tournament?.participant_type]);

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
                  className={`absolute inset-0 rounded-full blur-xl opacity-40 ${placement === 'first'
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
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-orange-400 text-[10px] sm:text-sm font-semibold">{tournament.game}</span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight tracking-tight">{tournament.title}</h1>
              {tournament.description && (
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">{tournament.description}</p>
              )}

              {tournament.twitch_link && (
                <a
                  href={tournament.twitch_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-[#9146FF]/20 hover:-translate-y-0.5 group"
                >
                  <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white"></span>
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                  <span>Watch Stream</span>
                </a>
              )}
            </div>

            <div className={`${statusConfig.color} px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2 animate-pulse shadow-lg`}>
              <span className="text-base sm:text-xl">{statusConfig.icon}</span>
              <span className="whitespace-nowrap">{statusConfig.text}</span>
            </div>
          </div>

          {/* Tournament Stats Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />
                <TrendingUp className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-400 opacity-50" />
              </div>
              <p className="text-base sm:text-2xl md:text-3xl font-bold text-white leading-none">{tournament.currentPlayers}</p>
              <p className="text-[9px] sm:text-xs text-gray-400 mt-1">{tournament.participant_type === 'Team' ? 'Teams' : 'Players'}</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-400" />
                <Sparkles className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-yellow-400 opacity-50" />
              </div>
              <p className="text-base sm:text-2xl md:text-3xl font-bold text-white leading-none">{formatCurrency(tournament.prizePool)}</p>
              <p className="text-[9px] sm:text-xs text-gray-400 mt-1">Prize Pool</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700/50 hover:border-green-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-400" />
                <Target className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-green-400 opacity-50" />
              </div>
              <p className="text-base sm:text-2xl md:text-3xl font-bold text-white leading-none">{formatCurrency(tournament.entryFee)}</p>
              <p className="text-[9px] sm:text-xs text-gray-400 mt-1">Entry Fee</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:scale-105 transform">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400" />
                <Star className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-purple-400 opacity-50" />
              </div>
              <p className="text-base sm:text-lxl md:text-2xl font-bold text-white leading-none">{tournament.maxPlayers}</p>
              <p className="text-[9px] sm:text-xs text-gray-400 mt-1">{tournament.participant_type === 'Team' ? 'Max Teams' : 'Max Players'}</p>
            </div>
          </div>

          {/* Enrolled Squads / Teams list */}
          {tournament.participant_type === 'Team' && (
            <div className="mt-6 sm:mt-8 mb-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl sm:rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                    <Users size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white uppercase tracking-tighter leading-none">Mobilized Squads</h3>
                    <p className="text-[8px] sm:text-[10px] text-blue-500/60 font-black uppercase tracking-widest mt-0.5 sm:mt-1">
                      {tournament.squad_size ? `${tournament.squad_size} Players per Squad` : 'Tournament Entry Roster'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {tournament.squad_size && (
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg mr-2">
                        <Users size={12} className="text-orange-500" />
                        <span className="text-[10px] font-black text-orange-500 uppercase">{tournament.squad_size} PI</span>
                      </div>
                    )}
                    <span className="text-lg sm:text-xl font-black text-white leading-none">
                      {enrolledTeams.length} <span className="text-gray-600">/ {tournament.maxPlayers}</span>
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-500 mt-0.5 sm:mt-1">Active Batallions</span>
                </div>
              </div>

              {teamsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] animate-pulse">Scanning Grid for Teams...</p>
                </div>
              ) : enrolledTeams.length === 0 ? (
                <div className="py-16 text-center bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800 group hover:border-blue-500/20 transition-all">
                  <Shield size={48} className="text-gray-800 mx-auto mb-4 opacity-30 group-hover:text-blue-500/30 transition-colors" />
                  <h4 className="text-gray-500 font-black uppercase tracking-tight text-lg">No Squads Mobilized</h4>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">The battlefield is currently vacant</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {enrolledTeams.map((team) => (
                    <div key={team.id} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl sm:rounded-3xl hover:border-blue-500/40 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />

                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden group-hover:scale-105 transition-transform shadow-2xl relative z-10">
                        {team.avatarUrl ? (
                          <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl sm:text-2xl font-black text-gray-700 uppercase">{team.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 relative z-10">
                        <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
                          {team.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                          <div className="flex -space-x-1.5 sm:-space-x-2 overflow-hidden">
                            {(tournament.rosters?.[team.id] || []).map((email, i) => {
                              const profile = rosterMemberDetails[email];
                              return (
                                <div key={i} title={profile?.username || email} className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-[#0f0f10] bg-gray-800 overflow-hidden border border-white/5 shadow-2xl transition-transform hover:scale-110 hover:z-20 relative">
                                  {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile?.username || email} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] font-black text-gray-500 bg-gray-700">
                                      {(profile?.username || email).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {(tournament.rosters?.[team.id]?.length || 0) === 0 && (
                              <div className="text-[9px] sm:text-[10px] text-gray-600 italic font-bold">No lineup selected</div>
                            )}
                          </div>
                          <span className="text-[7px] sm:text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/5">
                            {tournament.rosters?.[team.id]?.length || 0} OPERS
                          </span>
                        </div>
                      </div>

                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Random Member Pairings Section */}
              {tournament.memberPairings && tournament.memberPairings.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-500/10 rounded-2xl text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                        <Swords size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg sm:text-xl text-white uppercase tracking-tighter leading-none">Member Matchups</h3>
                        <p className="text-[8px] sm:text-[10px] text-orange-500/60 font-black uppercase tracking-widest mt-0.5 sm:mt-1">Randomized Squad Duels</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">
                        {tournament.memberPairings.length} Duels Generated
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.memberPairings.map((pair, idx) => {
                      const p1 = rosterMemberDetails[pair.player1.email];
                      const p2 = pair.player2 ? rosterMemberDetails[pair.player2.email] : null;

                      return (
                        <div key={idx} className="bg-gradient-to-br from-gray-900/40 to-black/40 border border-gray-800/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-between group hover:border-orange-500/30 transition-all relative overflow-hidden backdrop-blur-sm">
                          {/* Player 1 */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <div className="relative">
                              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shadow-2xl relative z-10 group-hover:scale-105 transition-transform">
                                {p1?.avatarUrl ? (
                                  <img src={p1.avatarUrl} alt={p1.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs font-black text-gray-500 bg-gray-700 uppercase">
                                    {(p1?.username || pair.player1.email).charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-blue-500 rounded flex items-center justify-center border-2 border-[#0a0a0b] z-20">
                                <Shield size={7} className="text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-black text-white uppercase truncate tracking-tight">{p1?.username || pair.player1.email.split('@')[0]}</p>
                              <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase truncate">{enrolledTeams.find(t => t.id === pair.player1.teamId)?.name || 'Squad A'}</p>
                            </div>
                          </div>

                          {/* VS Divider */}
                          <div className="flex flex-col items-center px-2 sm:px-4 relative z-10">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/5">
                              <span className="text-[8px] sm:text-[10px] font-black uppercase italic">VS</span>
                            </div>
                          </div>

                          {/* Player 2 */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end text-right">
                            <div className="min-w-0">
                              {pair.isBye ? (
                                <p className="text-[10px] sm:text-sm font-black text-gray-600 uppercase tracking-widest italic">BYE</p>
                              ) : (
                                <>
                                  <p className="text-xs sm:text-sm font-black text-white uppercase truncate tracking-tight">{p2?.username || pair.player2.email.split('@')[0]}</p>
                                  <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase truncate">{enrolledTeams.find(t => t.id === pair.player2.teamId)?.name || 'Squad B'}</p>
                                </>
                              )}
                            </div>
                            <div className="relative">
                              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shadow-2xl relative z-10 group-hover:scale-105 transition-transform ${pair.isBye ? 'opacity-30' : ''}`}>
                                {pair.isBye ? (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <X size={14} className="text-gray-700" />
                                  </div>
                                ) : p2?.avatarUrl ? (
                                  <img src={p2.avatarUrl} alt={p2.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs font-black text-gray-500 bg-gray-700 uppercase">
                                    {(p2?.username || pair.player2.email).charAt(0)}
                                  </div>
                                )}
                              </div>
                              {!pair.isBye && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-purple-500 rounded flex items-center justify-center border-2 border-[#0a0a0b] z-20">
                                  <Shield size={7} className="text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Background Glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tournament.status === 'live' && (!tournament.memberPairings || tournament.memberPairings.length === 0) && (
                <div className="mt-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl text-center">
                  <Swords size={32} className="text-orange-500 mx-auto mb-3 opacity-50" />
                  <p className="text-orange-400 font-bold uppercase tracking-tight text-sm">Member Matchups Pending</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Waiting for admin to generate randomized squad duels</p>
                </div>
              )}
            </div>
          )}

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
              tournament.participant_type === 'Team' ? null : (
                isParticipant ? (
                  <div className="space-y-3">
                    <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-4 text-center">
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold text-base sm:text-lg">You're Registered!</p>
                      <p className="text-gray-300 text-xs sm:text-sm mt-1">Get ready for the tournament</p>
                    </div>

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
                ) : tournament.participant_type === 'Team' ? (
                  managerEmail ? (
                    (() => {
                      const managedTeam = enrolledTeams.find(t => t.manager === managerEmail);
                      return managedTeam ? (
                        <div className="space-y-3 w-full">
                          <div className="bg-blue-600/20 border border-blue-600/50 rounded-xl p-4 text-center">
                            <p className="text-blue-400 font-bold text-sm">Your team <span className="text-white">{managedTeam.name}</span> is mobilized!</p>
                          </div>
                          <Link
                            href="/team-manager/dashboard"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
                          >
                            <Edit2 className="w-5 h-5" />
                            Manage Squad / Withdraw
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/team-manager/dashboard"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 text-sm sm:text-base"
                        >
                          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          Mobilize your Squad
                        </Link>
                      );
                    })()
                  ) : (
                    <Link
                      href="/team-manager/login"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2"
                    >
                      <Shield className="w-5 h-5 text-orange-500" />
                      Login as Manager to Join
                    </Link>
                  )
                ) : (
                  <button
                    onClick={handleJoinTournament}
                    disabled={actionLoading || spotsLeft === 0}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Join - {formatCurrency(tournament.entryFee)}</span>
                      </>
                    )}
                  </button>
                )
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
      {
        tournament.status === 'completed' && placementData.first && (
          <WinnerPodium />
        )
      }

      {/* Tabs for Details and Bracket */}
      {
        showBracket && (
          <div className="mb-6">
            <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base ${activeTab === 'details'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Details</span>
              </button>
              <button
                onClick={() => setActiveTab('bracket')}
                className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base ${activeTab === 'bracket'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Bracket</span>
              </button>
            </div>
          </div>
        )
      }

      {/* Content based on active tab */}
      {
        activeTab === 'bracket' && showBracket ? (
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

            {tournament.entryFee > 0 && tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
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
        )
      }

      {/* Results Submission Modal */}
      {
        showResultsModal && (
          <MatchResultSubmission
            tournamentId={tournament.id}
            tournamentName={tournament.title}
            onClose={() => setShowResultsModal(false)}
            onSubmitted={() => {
              setShowResultsModal(false);
            }}
          />
        )
      }

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
    </div >
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