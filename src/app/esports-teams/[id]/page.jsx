"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeamById } from "@/services/teamService";
import { userService } from "@/services/userService";
import { useAuth } from "@/app/contexts/AuthContext";
import { Shield, Users, UserCircle, Trophy, Mail, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      if (!params.id) return;
      try {
        const teamData = await getTeamById(params.id);
        if (!teamData) {
          router.push("/esports-teams");
          return;
        }
        setTeam(teamData);

        const allEmails = new Set();
        if (teamData.manager) allEmails.add(teamData.manager);
        teamData.members?.forEach(email => allEmails.add(email));

        if (allEmails.size > 0) {
          const profiles = await userService.getUsersByEmails(Array.from(allEmails));
          const profileMap = {};
          profiles.forEach(p => {
            profileMap[p.email] = p;
          });
          setMemberDetails(profileMap);
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest italic animate-pulse">Initializing Roster...</p>
      </div>
    );
  }

  if (!team) return null;

  const isManager = team.manager === currentUser?.email;
  const isMember = team.members?.includes(currentUser?.email);
  const canChat = isManager || isMember;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] -z-10" />

      {/* Hero Banner Section */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-950 opacity-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Banner Navigation */}
        <div className="absolute top-[100px] md:top-[120px] left-4 md:left-12 z-20">
          <Link
            href="/esports-teams"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            <span>Back to Teams</span>
          </Link>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 relative z-10 -mt-24 md:-mt-32 pb-32">
        {/* Team Identity Card */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-16">
          <div className="relative">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-black border-8 border-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
              {team.avatarUrl ? (
                <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="text-orange-500" size={64} />
              )}
            </div>
            <div className="absolute bottom-4 right-4 bg-green-500 w-8 h-8 rounded-full border-4 border-black shadow-lg shadow-green-500/20" title="Status: Active" />
          </div>

          <div className="flex-1 text-center md:text-left min-w-0">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter italic leading-tight mb-2 drop-shadow-2xl">
              {team.name}
            </h1>
            <p className="text-orange-500 font-black text-sm md:text-xl tracking-[0.2em] uppercase mb-8 italic opacity-90">
              {team.slogan || "RAID Arena Competitor"}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest text-gray-300 backdrop-blur-md">
                <Users size={16} className="text-orange-500" />
                <span>{team.members?.length || 0} Elite Members</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest text-gray-300 backdrop-blur-md">
                <Trophy size={16} className="text-orange-500" />
                <span>Established {team.createdAt ? new Date(team.createdAt).getFullYear() : "2026"}</span>
              </div>
              {canChat && (
                <Link
                  href={`/team-chat/${team.id}`}
                  className="group flex items-center gap-3 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-600/30 active:scale-95 hover:-translate-y-1"
                >
                  <MessageSquare size={16} className="group-hover:rotate-12 transition-transform" />
                  <span>Enter War Room</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Roster Grid Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white/20 whitespace-nowrap">Roster Analysis</h2>
            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {/* Manager Card */}
            <div className="group relative bg-white/[0.05] border border-orange-500/30 rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/[0.08] hover:-translate-y-2 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.1)]">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 duration-500">
                  {memberDetails[team.manager]?.avatarUrl ? (
                    <img src={memberDetails[team.manager].avatarUrl} alt="Manager" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="text-orange-500" size={32} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-1.5 truncate">
                    {memberDetails[team.manager]?.username || team.manager?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest italic leading-none">Squad Commander</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>Direct Access</span>
                <Mail size={14} className="text-white/20" />
              </div>
            </div>

            {/* Members Cards */}
            {team.members?.map((email, idx) => {
              if (email === team.manager) return null;
              const member = memberDetails[email];
              return (
                <div key={idx} className="group relative bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2 hover:border-white/20">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 duration-500">
                      {member?.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-white/40 uppercase italic">
                          {member?.username?.charAt(0) || email.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-1.5 truncate">
                        {member?.username || email.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest italic leading-none">RAID Vanguard</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Active Personnel</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        {team.description && (
          <div className="mt-20 space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white/20 whitespace-nowrap">Tactical Briefing</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="p-8 md:p-12 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-600/30 group-hover:bg-orange-600 transition-colors" />
              <p className="text-sm md:text-lg text-gray-400 leading-relaxed italic font-medium">
                {team.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
