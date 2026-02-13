"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teamMembers } from '@/data/team';
import { Users, Linkedin, Instagram, Mail, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function TeamMemberProfile() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const member = teamMembers.find(m => m.slug === slug);

    if (!member) {
        return (
            <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-4">MEMBER NOT FOUND</h1>
                <p className="mb-8">The team member you are looking for does not exist.</p>
                <Link href="/team" className="text-orange-500 hover:text-orange-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Team
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-orange-500/30">
            {/* Navigation Header */}
            <div className="max-w-6xl mx-auto px-6 sm:px-12 py-8">
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-sm">Back</span>
                </button>
            </div>

            <main className="max-w-6xl mx-auto px-6 sm:px-12 pb-24">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column - Image & Socials */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="aspect-square bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden relative">
                            {member.image ? (
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Users className="w-48 h-48 text-gray-800" />
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex justify-around">
                            <a href={member.linkedin} className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
                                <Linkedin size={24} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">LinkedIn</span>
                            </a>
                            <a href={member.instagram} className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
                                <Instagram size={24} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Instagram</span>
                            </a>
                            <a href={`mailto:${member.email}`} className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
                                <Mail size={24} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Email</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Info */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-4">
                            <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest">
                                raid Arena
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter">
                                {member.name.split(' ')[0]} <br />
                                <span className="text-orange-500">{member.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <p className="text-2xl font-bold text-gray-400">{member.role}</p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="w-8 h-px bg-orange-500"></span>
                                Biography
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                                <p className="font-medium text-white italic">"{member.bio}"</p>
                                <div className="whitespace-pre-wrap">{member.longBio}</div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <a
                                href={member.whatsapp || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 bg-[#25D366]/90 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-[#25D366] transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-green-500/10 group active:shadow-none"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.66 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>WhatsApp {member.name.split(' ')[0]}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
