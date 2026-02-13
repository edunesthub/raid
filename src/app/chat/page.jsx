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
        setTournaments(tournamentsData.filter(t => t !== null).sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)));

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
        setTeams(teamsWithUnreads);

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
        setLeagues(leaguesWithUnreads);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-orange-900/10 to-black border-b border-orange-500/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                <MessageCircle className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Arena <span className="text-orange-500">Chats</span></h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Connect with your squads & rivals</p>
              </div>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start overflow-x-auto scrollbar-hide max-w-full">
              <button
                onClick={() => setActiveTab("tournaments")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                <Trophy size={14} /> Tournaments
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                <Users size={14} /> My Teams
              </button>
              <button
                onClick={() => setActiveTab("leagues")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leagues' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                <Trophy size={14} /> Leagues
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'tournaments' ? (
          tournaments.length === 0 ? (
            <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white uppercase mb-2">No active tournaments</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Join a tournament to unlock its exclusive chat room and coordinate with other players.</p>
              <Link href="/tournament" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                <Trophy className="w-4 h-4" />
                <span>Explore Tournaments</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournament/${tournament.id}/chat`}
                  className="group relative bg-gray-900/40 border border-white/5 rounded-3xl p-5 hover:bg-white/5 hover:border-orange-500/30 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-800 border border-white/5">
                      {tournament.tournament_flyer ? (
                        <Image src={tournament.tournament_flyer} alt={tournament.tournament_name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-900/40">
                          <Trophy className="w-8 h-8 text-orange-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md">Live Chat</span>
                        {tournament.unreadCount > 0 && (
                          <span className="text-[10px] font-black text-white bg-orange-600 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                            {tournament.unreadCount} New
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors truncate uppercase italic tracking-tight">
                        {tournament.tournament_name || tournament.title || 'Unknown Tournament'}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{tournament.participantCount || 0} participants</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{tournament.status || 'Active'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:text-orange-500 group-hover:bg-orange-500/10 transition-all">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'leagues' ? (
          leagues.length === 0 ? (
            <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white uppercase mb-2">No leagues found</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Engage in competitive leagues to unlock community chat rooms and stay updated with standings.</p>
              <Link href="/leagues" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                <Trophy className="w-4 h-4" />
                <span>Join a League</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/league-chat/${league.id}`}
                  className="group relative bg-gray-900/40 border border-white/5 rounded-3xl p-5 hover:bg-white/5 hover:border-orange-500/30 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-800 border border-white/5">
                      {league.league_flyer ? (
                        <Image src={league.league_flyer} alt={league.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/20 to-green-900/40">
                          <Trophy className="w-8 h-8 text-green-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-md">Pro League</span>
                        {league.unreadCount > 0 && (
                          <span className="text-[10px] font-black text-white bg-orange-600 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                            {league.unreadCount} New
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-green-400 transition-colors truncate uppercase italic tracking-tight">
                        {league.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Trophy className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{league.prize_pool || 'Exclusive Rewards'}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[200px]">{league.season || 'LIVE SEASON'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:text-green-400 group-hover:bg-green-400/10 transition-all">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          teams.length === 0 ? (
            <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <Users className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white uppercase mb-2">No team squads yet</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">You haven't joined any teams yet. Create a team or get invited to one to start chatting with your squad.</p>
              <Link href="/team-manager" className="inline-flex items-center space-x-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                <Users className="w-4 h-4" />
                <span>Go to Team Manager</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team-chat/${team.id}`}
                  className="group relative bg-gray-900/40 border border-white/5 rounded-3xl p-5 hover:bg-white/5 hover:border-orange-500/30 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-800 border border-white/5">
                      {team.avatarUrl ? (
                        <Image src={team.avatarUrl} alt={team.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-900/40">
                          <Users className="w-8 h-8 text-blue-500/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">Squad Chat</span>
                        {team.unreadCount > 0 && (
                          <span className="text-[10px] font-black text-white bg-orange-600 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                            {team.unreadCount} New
                          </span>
                        )}
                        {team.manager === user.email && (
                          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-md">Owner</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors truncate uppercase italic tracking-tight">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{(team.members?.length || 0) + 1} members</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[200px]">{team.slogan || 'RAID ARENA SQUAD'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all">
                      <MessageCircle className="w-6 h-6" />
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

