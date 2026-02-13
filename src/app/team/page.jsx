"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Linkedin, Instagram, Mail } from 'lucide-react';
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
                            className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:bg-gray-900/60 transition-all group flex flex-col"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Users className="w-24 h-24 text-gray-700" />
                                    </div>
                                )}
                                {/* Overlay effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                    <span className="text-white text-sm font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Profile</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 flex-grow">
                                <div>
                                    <h3 className="text-white font-bold text-xl mb-1 group-hover:text-orange-500 transition-colors">{member.name}</h3>
                                    <p className="text-orange-500 font-medium text-sm">{member.role}</p>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {member.bio}
                                </p>

                                {/* Social Links (prevent default to allow independent clicking if needed, but better to keep it clean) */}
                                <div className="flex gap-3 pt-2" onClick={(e) => e.preventDefault()}>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Instagram className="w-4 h-4" />
                                    </div>
                                    <div className="p-2 bg-gray-800 rounded-lg hover:bg-orange-500 transition-colors">
                                        <Mail className="w-4 h-4" />
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
