
"use client";
import { useEffect, useState } from "react";
import { getTeams } from "@/services/teamService";
import { Users, Info, Trophy, UserCircle, Shield, Briefcase, UserPlus } from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import TeamDetailsModal from "@/components/TeamDetailsModal";

export default function EsportsTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const teamsData = await getTeams();

        // Sort teams: if user is logged in, show their teams first
        const sortedTeams = currentUser ? [...teamsData].sort((a, b) => {
          const aIsMember = a.manager === currentUser.email || a.members?.includes(currentUser.email);
          const bIsMember = b.manager === currentUser.email || b.members?.includes(currentUser.email);
          if (aIsMember && !bIsMember) return -1;
          if (!aIsMember && bIsMember) return 1;
          return 0;
        }) : teamsData;

        setTeams(sortedTeams);

        const allEmails = new Set();
        teamsData.forEach(team => {
          if (team.manager) allEmails.add(team.manager);
          team.members?.forEach(email => allEmails.add(email));
        });

        if (allEmails.size > 0) {
          const profiles = await userService.getUsersByEmails(Array.from(allEmails));
          const profileMap = {};
          profiles.forEach(p => {
            profileMap[p.email] = p;
          });
          setMemberDetails(profileMap);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-black text-white pt-[120px] md:pt-[160px] pb-32 px-4 sm:px-6 md:px-10 lg:px-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16 space-y-4 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link
              href="/team-manager/login"
              className="group/link flex items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-white hover:border-orange-500 hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/10 hover:-translate-y-1 active:scale-95"
            >
              <Briefcase size={14} />
              <span>Access Manager Portal</span>
              <span className="group-hover/link:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/team-manager/signup"
              className="group/link flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-white hover:border-orange-500 hover:bg-orange-500 transition-all shadow-lg hover:-translate-y-1 active:scale-95"
            >
              <UserPlus size={14} />
              <span>Register Team</span>
              <span className="group-hover/link:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic text-white leading-tight">
            eSports <span className="text-orange-500">Teams</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base font-medium uppercase tracking-[0.05em] opacity-80">
            The most formidable teams in the RAID arena. Discover the rosters competing for glory.
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-lg shadow-orange-500/40" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 italic">Scanning rosters...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
            <Trophy className="text-gray-700 mb-4" size={64} />
            <p className="text-xl text-gray-500 font-medium">No teams have been mobilized yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {teams.map((team, index) => (
              <Link
                href={`/esports-teams/${team.id}`}
                key={team.id}
                className="group relative bg-white/[0.03] border border-white/10 hover:border-orange-500/30 rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] overflow-hidden cursor-pointer active:scale-95"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-lg group-hover:border-orange-500/50 group-hover:scale-105 transition-all duration-500 overflow-hidden shrink-0">
                      {team.avatarUrl ? (
                        <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="text-orange-500" size={32} />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {(team.manager === currentUser?.email || team.members?.includes(currentUser?.email)) && (
                        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[9px] rounded-full font-black border border-orange-500/20 uppercase tracking-widest">My Squad</span>
                      )}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-[9px] rounded-full font-black border border-green-500/20 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-1 truncate tracking-tighter group-hover:text-orange-500 transition-colors uppercase italic">{team.name}</h2>
                  {team.slogan && (
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 line-clamp-1 opacity-60 italic">"{team.slogan}"</p>
                  )}

                  <div className="flex items-center gap-3 mb-8 p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {memberDetails[team.manager]?.avatarUrl ? (
                        <img src={memberDetails[team.manager].avatarUrl} alt="Manager" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={18} className="text-orange-500" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Manager</span>
                      <span className="text-[11px] text-white font-black uppercase truncate italic">
                        {memberDetails[team.manager]?.username || team.manager?.split('@')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>Roster</span>
                      <span>{team.members?.length || 0} Members</span>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                      {team.members && team.members.length > 0 ? (
                        team.members.slice(0, 4).map((email, idx) => {
                          const user = memberDetails[email];
                          return (
                            <div key={idx} className="group/member relative w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden hover:border-orange-500/50 transition-all hover:scale-110">
                              {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase italic">
                                  {user?.username?.charAt(0) || email.charAt(0)}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest italic opacity-50">Recruiting talent...</span>
                      )}
                      {team.members?.length > 4 && (
                        <span className="h-8 flex items-center bg-orange-500/10 text-orange-500 px-3 rounded-xl text-[10px] font-black border border-orange-500/20 italic">
                          +{team.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
