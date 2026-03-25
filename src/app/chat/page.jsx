"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MessageCircle, Users, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ChatSkeleton = () => (
  <div className="group relative bg-white/5 border border-white/5 rounded-3xl p-4 md:p-5 overflow-hidden animate-pulse">
    <div className="flex items-center gap-3 md:gap-5 relative z-10">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="w-16 h-4 bg-white/5 rounded-full mb-2" />
        <div className="w-48 h-6 bg-white/5 rounded-lg mb-2" />
        <div className="flex gap-2">
          <div className="w-12 h-3 bg-white/5 rounded-full" />
          <div className="w-12 h-3 bg-white/5 rounded-full" />
        </div>
      </div>
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5" />
    </div>
  </div>
);

export default function ChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tournaments"); // tournaments, teams, leagues

  useEffect(() => {
    const fetchChatData = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
        setLoading(false);
        return;
      }

      const userId = user.id || user.uid;
      const userEmail = user.email;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        const isAdmin = userData?.role === 'admin' || userData?.adminRole || user.email === 'admin@raidarena.com';

        // --- FETCH TOURNAMENTS ---
        let tournamentIds = [];
        if (isAdmin) {
          const allTournamentsSnapshot = await getDocs(collection(db, "tournaments"));
          tournamentIds = allTournamentsSnapshot.docs.map(doc => doc.id);
        } else {
          const participantsQuery = query(
            collection(db, "tournament_participants"),
            where("userId", "==", userId)
          );
          const participantsSnapshot = await getDocs(participantsQuery);
          tournamentIds = [...new Set(
            participantsSnapshot.docs.map(doc => doc.data().tournamentId)
          )];
        }

        const tournamentsData = await Promise.all(
          tournamentIds.map(async (tournamentId) => {
            const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
            if (!tournamentDoc.exists()) return null;
            const tData = tournamentDoc.data();
            if (tData.status === "completed") return null;

            const lastRead = localStorage.getItem(`chat_last_read_${tournamentId}_${userId}`);
            const lastReadTimestamp = lastRead ? parseInt(lastRead) : 0;

            const messagesQuery = query(
              collection(db, "tournament_chats"),
              where("tournamentId", "==", tournamentId),
              where("createdAt", ">", new Date(lastReadTimestamp))
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const unreadCount = messagesSnapshot.docs.filter(doc => doc.data().senderId !== userId).length;

            return { id: tournamentDoc.id, ...tData, unreadCount };
          })
        );
        setTournaments(tournamentsData.filter(t => t !== null).sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        }));

        // --- FETCH TEAMS ---
        let fetchedTeams = [];
        if (isAdmin) {
          const allTeamsSnapshot = await getDocs(collection(db, "teams"));
          fetchedTeams = allTeamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
          // Teams where user is manager
          const managerTeamsQuery = query(collection(db, "teams"), where("manager", "==", userEmail));
          const managerTeamsSnapshot = await getDocs(managerTeamsQuery);

          // Teams where user is member
          const memberTeamsQuery = query(collection(db, "teams"), where("members", "array-contains", userEmail));
          const memberTeamsSnapshot = await getDocs(memberTeamsQuery);

          const combinedTeams = [...managerTeamsSnapshot.docs, ...memberTeamsSnapshot.docs];
          const seenIds = new Set();
          combinedTeams.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              fetchedTeams.push({ id: doc.id, ...doc.data() });
            }
          });
        }

        const teamsWithUnreads = await Promise.all(
          fetchedTeams.map(async (team) => {
            const lastRead = localStorage.getItem(`team_chat_last_read_${team.id}_${userId}`);
            const lastReadTimestamp = lastRead ? parseInt(lastRead) : 0;

            const messagesQuery = query(
              collection(db, "team_chats"),
              where("teamId", "==", team.id),
              where("createdAt", ">", new Date(lastReadTimestamp))
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const unreadCount = messagesSnapshot.docs.filter(doc => doc.data().senderId !== userId).length;

            return { ...team, unreadCount };
          })
        );
        setTeams(teamsWithUnreads.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        }));

        // --- FETCH LEAGUES ---
        let fetchedLeagues = [];
        const allLeaguesSnapshot = await getDocs(collection(db, "league_seasons"));
        const allLeagues = allLeaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (isAdmin) {
          fetchedLeagues = allLeagues;
        } else {
          // Find leagues where user's teams are participating
          const userTeamNames = fetchedTeams.map(t => t.name.toLowerCase());

          for (const league of allLeagues) {
            const leagueTeamsSnapshot = await getDocs(collection(db, `league_seasons/${league.id}/teams`));
            const leagueTeams = leagueTeamsSnapshot.docs.map(d => d.data().name.toLowerCase());

            if (leagueTeams.some(lt => userTeamNames.includes(lt))) {
              fetchedLeagues.push(league);
            }
          }
        }

        const leaguesWithUnreads = await Promise.all(
          fetchedLeagues.map(async (league) => {
            const lastRead = localStorage.getItem(`league_chat_last_read_${league.id}_${userId}`);
            const lastReadTimestamp = lastRead ? parseInt(lastRead) : 0;

            const messagesQuery = query(
              collection(db, "league_chats"),
              where("leagueId", "==", league.id),
              where("createdAt", ">", new Date(lastReadTimestamp))
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const unreadCount = messagesSnapshot.docs.filter(doc => doc.data().senderId !== userId).length;

            return { ...league, unreadCount };
          })
        );
        setLeagues(leaguesWithUnreads.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        }));

        // Auto-switch logic
        if (tournamentsData.filter(t => t !== null).length === 0) {
          if (fetchedTeams.length > 0) setActiveTab("teams");
          else if (fetchedLeagues.length > 0) setActiveTab("leagues");
        }

      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [user, isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-[88px] md:pt-[100px] pb-32 md:pb-16">
      {/* Header */}
      <div className="border-b border-white/5 pb-8 px-6 md:px-10 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 md:p-3 bg-orange-500/10 rounded-xl md:rounded-2xl border border-orange-500/20">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Arena <span className="text-orange-500">Chats</span></h1>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-1.5 transition-all">Connect with squads</p>
              </div>
            </div>

            <div className="flex w-full md:w-auto bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 mt-4 md:mt-0">
              <button
                onClick={() => setActiveTab("tournaments")}
                className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 md:gap-2 px-1 md:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Trophy className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'tournaments' ? 'text-orange-500' : ''}`} />
                <span className="truncate">Tourneys</span>
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 md:gap-2 px-1 md:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Users className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'teams' ? 'text-orange-500' : ''}`} />
                <span className="truncate">Squads</span>
              </button>
              <button
                onClick={() => setActiveTab("leagues")}
                className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 md:gap-2 px-1 md:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leagues' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Trophy className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'leagues' ? 'text-orange-500' : ''}`} />
                <span className="truncate">Leagues</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 pt-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ChatSkeleton key={i} />
            ))}
          </div>
        ) : activeTab === 'tournaments' ? (
          tournaments.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No active tournaments</h3>
              <p className="text-gray-400 text-sm md:text-base font-medium mb-8 max-w-sm mx-auto leading-relaxed">Join a tournament to unlock its exclusive chat room and coordinate with other players.</p>
              <Link href="/tournament" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-2xl w-full md:w-auto justify-center">
                <Trophy className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-xs">Explore Tournaments</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournament/${tournament.id}/chat`}
                  className={`group relative bg-white/[0.03] border ${
                    tournament.unreadCount > 0 ? 'border-orange-500/30' : 'border-white/10'
                  } rounded-3xl p-4 md:p-5 hover:bg-white/[0.06] hover:border-orange-500/40 transition-all overflow-hidden`}
                >
                  {/* Unread left-edge accent */}
                  {tournament.unreadCount > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 rounded-l-3xl" />
                  )}

                  <div className="flex items-center gap-3 md:gap-5 relative z-10">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10 shadow-lg">
                      {tournament.tournament_flyer ? (
                        <Image src={tournament.tournament_flyer} alt={tournament.tournament_name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                          <Trophy className="w-7 md:w-8 h-7 md:h-8 text-orange-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span className="text-[8px] md:text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">LIVE</span>
                      </div>
                      <h3 className={`text-base md:text-xl font-black truncate uppercase italic tracking-tighter ${
                        tournament.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                      }`}>
                        {tournament.tournament_name || tournament.title || 'Unknown Tournament'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{tournament.participantCount || 0}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{tournament.status || 'Active'}</span>
                      </div>
                    </div>

                    <div className={`relative p-2.5 md:p-3 rounded-2xl transition-all border ${
                      tournament.unreadCount > 0
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                        : 'bg-white/5 text-gray-500 border-white/5 group-hover:bg-orange-500/10 group-hover:text-orange-500 group-hover:border-orange-500/20'
                    }`}>
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                      {tournament.unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[9px] font-black rounded-full shadow-sm">
                          {tournament.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'leagues' ? (
          leagues.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No leagues found</h3>
              <p className="text-gray-400 text-sm md:text-base font-medium mb-8 max-w-sm mx-auto leading-relaxed">Engage in competitive leagues to unlock community chat rooms and stay updated.</p>
              <Link href="/leagues" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-2xl w-full md:w-auto justify-center">
                <Trophy className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-xs">Join a League</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/league-chat/${league.id}`}
                  className={`group relative bg-white/[0.03] border ${
                    league.unreadCount > 0 ? 'border-orange-500/30' : 'border-white/10'
                  } rounded-3xl p-4 md:p-5 hover:bg-white/[0.06] hover:border-orange-500/40 transition-all overflow-hidden`}
                >
                  {/* Unread left-edge accent */}
                  {league.unreadCount > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 rounded-l-3xl" />
                  )}

                  <div className="flex items-center gap-3 md:gap-5 relative z-10">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10 shadow-lg">
                      {league.league_flyer ? (
                        <Image src={league.league_flyer} alt={league.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                          <Trophy className="w-7 md:w-8 h-7 md:h-8 text-orange-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span className="text-[8px] md:text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">PRO LEAGUE</span>
                      </div>
                      <h3 className={`text-base md:text-xl font-black truncate uppercase italic tracking-tighter ${
                        league.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                      }`}>
                        {league.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{league.prize_pool || 'Rewards'}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{league.season || 'Live'}</span>
                      </div>
                    </div>

                    <div className={`relative p-2.5 md:p-3 rounded-2xl transition-all border ${
                      league.unreadCount > 0
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                        : 'bg-white/5 text-gray-500 border-white/5 group-hover:bg-orange-500/10 group-hover:text-orange-500 group-hover:border-orange-500/20'
                    }`}>
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                      {league.unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[9px] font-black rounded-full shadow-sm">
                          {league.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          teams.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No squads yet</h3>
              <p className="text-gray-400 text-sm md:text-base font-medium mb-8 max-w-sm mx-auto leading-relaxed">Create a team or get invited to one to start chatting with your squad.</p>
              <Link href="/team-manager" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors rounded-2xl w-full md:w-auto justify-center">
                <Users className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-xs">Go to Manager</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team-chat/${team.id}`}
                  className={`group relative bg-white/[0.03] border ${
                    team.unreadCount > 0 ? 'border-orange-500/30' : 'border-white/10'
                  } rounded-3xl p-4 md:p-5 hover:bg-white/[0.06] hover:border-orange-500/40 transition-all overflow-hidden`}
                >
                  {/* Unread left-edge accent */}
                  {team.unreadCount > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 rounded-l-3xl" />
                  )}

                  <div className="flex items-center gap-3 md:gap-5 relative z-10">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10 shadow-lg">
                      {team.avatarUrl ? (
                        <Image src={team.avatarUrl} alt={team.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                          <Users className="w-7 md:w-8 h-7 md:h-8 text-orange-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span className="text-[8px] md:text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">SQUAD</span>
                        {team.manager === user.email && (
                          <span className="text-[8px] md:text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">OWNER</span>
                        )}
                      </div>
                      <h3 className={`text-base md:text-xl font-black truncate uppercase italic tracking-tighter ${
                        team.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                      }`}>
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{(team.members?.length || 0) + 1} Members</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{team.slogan || 'RAID Squad'}</span>
                      </div>
                    </div>

                    <div className={`relative p-2.5 md:p-3 rounded-2xl transition-all border ${
                      team.unreadCount > 0
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                        : 'bg-white/5 text-gray-500 border-white/5 group-hover:bg-orange-500/10 group-hover:text-orange-500 group-hover:border-orange-500/20'
                    }`}>
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                      {team.unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[9px] font-black rounded-full shadow-sm">
                          {team.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

