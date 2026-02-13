"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Linkedin, Instagram, Mail, ExternalLink } from 'lucide-react';
import { teamMembers } from '@/data/team';

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-orange-500/30">

            {/* Header Section */}
            <div className="relative py-20 px-6 sm:px-12 border-b border-gray-800">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
                        Meet the <span className="text-orange-500">RAID</span> Team
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        The passionate individuals building Africa's premier esports platform
                    </p>
                </div>
            </div>

            {/* Team Grid */}
            <div className="max-w-6xl mx-auto px-6 sm:px-12 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member) => (
                        <Link
                            key={member.slug}
                            href={`/team/${member.slug}`}
                            className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:bg-gray-900/60 lg:hover:-translate-y-2 transition-transform duration-200 group flex flex-col relative cursor-pointer shadow-xl hover:shadow-orange-500/10 active:scale-[0.98]"
                        >
                            {/* Interactive Indicator */}
                            <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-orange-500 transition-all backdrop-blur-sm shadow-xl">
                                <ExternalLink className="w-4 h-4 text-white" />
                            </div>

                            {/* Image */}
                            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 lg:group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Users className="w-24 h-24 text-gray-700" />
                                    </div>
                                )}
                                {/* Overlay effect - simplified for mobile to avoid blocking navigation */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-6">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 bg-orange-500 px-4 py-1.5 rounded-full shadow-lg">View Profile</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 flex-grow">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-bold text-xl group-hover:text-orange-500 transition-colors uppercase tracking-tight">{member.name}</h3>
                                    </div>
                                    <p className="text-orange-500 font-medium text-xs uppercase tracking-widest">{member.role}</p>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                    {member.bio}
                                </p>

                                {/* Social Links - Using div to stop propagation if needed, but here simple layout */}
                                <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Linkedin className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Instagram className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Mail className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Join Team CTA */}
                <div className="mt-16 text-center bg-gray-900/40 border border-gray-800 rounded-2xl p-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Want to Join Our Team?</h2>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        We're always looking for talented individuals who share our passion for esports and gaming in Africa.
                    </p>
                    <a
                        href="mailto:careers@raidarena.com"
                        className="inline-block bg-orange-500 text-black px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-orange-600 transition-colors"
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </div>
    );
}
