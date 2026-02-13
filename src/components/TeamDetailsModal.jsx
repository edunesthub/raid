"use client";
import React, { useEffect } from 'react';
import { X, Shield, Users, UserCircle, Trophy, Globe, Twitter, Instagram, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function TeamDetailsModal({ isOpen, onClose, team, memberDetails }) {
    const { user } = useAuth();

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !team) return null;

    const isManager = team.manager === user?.email;
    const isMember = team.members?.includes(user?.email);
    const isAdmin = user?.role === 'admin' || user?.adminRole || user?.email === 'admin@raidarena.com';
    const canChat = isManager || isMember || isAdmin;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 animate-fade-in overflow-hidden">
            <div className="h-[100dvh] w-full bg-zinc-950 overflow-y-auto custom-scrollbar flex flex-col relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[120] p-3 bg-zinc-900/90 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-xl border border-white/10 shadow-2xl active:scale-90"
                >
                    <X size={20} />
                </button>

                {/* Header/Cover Image Section */}
                <div className="relative h-32 sm:h-48 bg-gradient-to-br from-orange-600 to-orange-900 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <div className="absolute -top-12 -left-12 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
                </div>

                {/* Team Profile Section */}
                <div className="relative flex-1 px-4 sm:px-12 md:px-24 pb-20 -mt-10 sm:-mt-16 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10 mb-8 sm:mb-12">
                        <div className="relative self-start sm:self-auto">
                            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden">
                                {team.avatarUrl ? (
                                    <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Shield className="text-orange-500" size={32} />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-zinc-950 shadow-lg" title="Active" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-tighter mb-1 truncate">{team.name}</h2>
                            <p className="text-orange-500 font-bold text-[10px] sm:text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                                {team.slogan || "RAID Arena Competitor"}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] sm:text-xs font-bold text-gray-300">
                                    <Users size={12} className="text-orange-500" />
                                    <span>{team.members?.length || 0} Members</span>
                                </div>
                                {team.createdAt && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] sm:text-xs font-bold text-gray-300">
                                        <Trophy size={12} className="text-orange-500" />
                                        <span>Established {new Date(team.createdAt).getFullYear()}</span>
                                    </div>
                                )}
                                {canChat && (
                                    <Link
                                        href={`/team-chat/${team.id}`}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                                    >
                                        <MessageSquare size={12} />
                                        <span>Chat with Squad</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Roster Section */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2">Team Members</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                                {/* Manager */}
                                <div className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {memberDetails[team.manager]?.avatarUrl ? (
                                                <img src={memberDetails[team.manager].avatarUrl} alt="Manager" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="text-orange-500" size={20} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white leading-none mb-1 truncate">
                                                {memberDetails[team.manager]?.username || team.manager?.split('@')[0]}
                                            </p>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Team Manager</p>
                                        </div>
                                    </div>
                                    <Mail size={14} className="text-white/20 flex-shrink-0" />
                                </div>

                                {/* Members */}
                                {team.members?.map((email, idx) => {
                                    if (email === team.manager) return null;
                                    const member = memberDetails[email];
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {member?.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-500">
                                                            {member?.username?.charAt(0).toUpperCase() || email.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white leading-none truncate">
                                                        {member?.username || email.split('@')[0]}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Player</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* About Section - Only show if description exists to avoid mock content */}
                        {team.description && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2">About Team</h3>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {team.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 88, 12, 0.3);
        }
      `}</style>
        </div>
    );
}
