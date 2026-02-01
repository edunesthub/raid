import React, { useRef, useState, useEffect } from 'react';
import { X, Trophy, Zap, Shield, Share2, Loader2, User, Download } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { userService } from '@/services/userService';

// --- GLOBAL HELPERS (Outside Component to prevent Initialization Errors) ---
function getPlayerData(baseData, fetchedData, fallback = 'TBD') {
    const data = fetchedData || baseData;
    if (!data) return { username: fallback };
    if (typeof data === 'string') {
        if (data.includes('@')) return { username: data.split('@')[0] };
        return { username: data };
    }
    const username = data.username || data.displayName || data.name || (data.email ? data.email.split('@')[0] : fallback);
    return {
        ...data,
        name: username,
        username: username,
        avatarUrl: data.avatarUrl || data.photoURL || null
    };
}

function getTeamName(teamData) {
    if (!teamData) return null;
    if (typeof teamData === 'string') return teamData;
    return teamData.name || teamData.username || teamData.title || null;
}

function formatDisplayName(name) {
    if (!name || typeof name !== 'string') return name;
    const words = name.trim().split(/\s+/);
    if (words.length <= 1) return name;
    return (
        <span className="flex flex-col items-center leading-[0.8] tracking-tighter">
            <span className="block">{words.slice(0, -1).join(' ')}</span>
            <span className="block text-[0.9em] opacity-90 mt-1">{words[words.length - 1]}</span>
        </span>
    );
}

export default function MatchPosterModal({ isOpen, onClose, match, tournament, mode = 'match' }) {
    const modalRef = useRef(null);
    const posterRef = useRef(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [extraData, setExtraData] = useState({ p1: null, p2: null });
    const [base64Avatars, setBase64Avatars] = useState({ p1: null, p2: null });
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);

    // PREVENT BODY SCROLL
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // FETCH MISSING PLAYER DATA
    useEffect(() => {
        if (!isOpen || !match) return;

        const fetchMissingInfo = async () => {
            setIsFetchingInfo(true);
            try {
                const newData = { p1: null, p2: null };

                const resolvePlayer = async (source, idFallback) => {
                    if (!source && !idFallback) return null;

                    // 1. If source is an email string
                    if (typeof source === 'string' && source.includes('@')) {
                        const profiles = await userService.getUsersByEmails([source]);
                        return profiles.length > 0 ? profiles[0] : null;
                    }

                    // 2. If source is an ID string
                    if (typeof source === 'string') {
                        return await userService.getUserProfile(source);
                    }

                    // 3. If source is an object
                    if (source && typeof source === 'object') {
                        // If it's a member object {email, teamId}
                        if (source.email) {
                            const profiles = await userService.getUsersByEmails([source.email]);
                            return profiles.length > 0 ? profiles[0] : null;
                        }
                        // If it has an ID but missing critical info
                        if (source.id && (!source.username || !source.avatarUrl)) {
                            return await userService.getUserProfile(source.id);
                        }
                        // If it's already a full profile, use it as is (or fetch fresh if missing avatar)
                        if (source.username && !source.avatarUrl && (source.id || idFallback)) {
                            return await userService.getUserProfile(source.id || idFallback);
                        }
                    }

                    // 4. Fallback to ID
                    if (idFallback) {
                        return await userService.getUserProfile(idFallback);
                    }

                    return null;
                };

                newData.p1 = await resolvePlayer(match.player1, match.player1Id);
                newData.p2 = await resolvePlayer(match.player2, match.player2Id);

                setExtraData(newData);
            } catch (err) {
                console.error("Error fetching poster extra data:", err);
            } finally {
                setIsFetchingInfo(false);
            }
        };

        fetchMissingInfo();
    }, [isOpen, match?.id, match?.player1Id, match?.player2Id]);

    // CONVERT AVATARS TO BASE64 FOR MOBILE RENDERING
    useEffect(() => {
        if (!isOpen || !match) return;
        const p1Url = getPlayerData(match.player1, extraData.p1).avatarUrl;
        const p2Url = getPlayerData(match.player2, extraData.p2).avatarUrl;

        const toBase64 = async (url) => {
            if (!url) return null;
            try {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error("Base64 conversion failed", e);
                return null; // Return null so img src fallback can work
            }
        };

        const loadAvatars = async () => {
            const [b1, b2] = await Promise.all([
                toBase64(p1Url),
                toBase64(p2Url)
            ]);
            setBase64Avatars({ p1: b1, p2: b2 });
        };

        if (isOpen) loadAvatars();
    }, [isOpen, extraData, match?.player1, match?.player2]);

    if (!isOpen || !match) return null;

    const p1 = getPlayerData(match.player1, extraData.p1, 'PLAYER 1');
    const p2 = getPlayerData(match.player2, extraData.p2, 'PLAYER 2');
    const isBye = !match.player2Id && !match.player2;

    const p1TeamName = getTeamName(match.player1Team || match.team1);
    const p2TeamName = getTeamName(match.player2Team || match.team2);

    const getShareUrl = () => {
        const url = new URL(window.location.origin + window.location.pathname);
        const origin = window.location.origin;

        const getAbsoluteUrl = (path) => {
            if (!path) return null;
            if (path.startsWith('http')) return path;
            return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
        };

        if (mode === 'match') {
            if (p1.username) url.searchParams.set('p1Name', p1.username);
            if (p2.username) url.searchParams.set('p2Name', p2.username);

            const p1AvatarAbs = getAbsoluteUrl(p1.avatarUrl);
            const p2AvatarAbs = getAbsoluteUrl(p2.avatarUrl);

            if (p1AvatarAbs) url.searchParams.set('p1Avatar', p1AvatarAbs);
            if (p2AvatarAbs) url.searchParams.set('p2Avatar', p2AvatarAbs);
            if (match.round) url.searchParams.set('round', match.round);
        } else {
            url.searchParams.set('mode', 'tournament');
        }
        if (tournament?.title) url.searchParams.set('tName', tournament.title);
        return url.toString();
    };

    const getShareText = () => {
        const url = 'https://raidarena.vercel.app';
        if (mode === 'match') {
            return `👊 ${p1.username} vs ${p2.username}\n🏆 ${tournament?.title || 'RAID Tournament'}\n🔴 LIVE NOW on RAID\n\n🔗 Join RAID Arena: ${url}`;
        }
        return `🏆 ${tournament?.title}\n💰 Prize Pool: ${tournament?.prizePool} ${tournament?.currency}\n🎮 Join the Fight\n\n🔗 Join RAID Arena: ${url}`;
    }

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            if (posterRef.current) {
                // Wait for all assets to be ready
                await new Promise(r => setTimeout(r, 1000));

                const blob = await toBlob(posterRef.current, {
                    cacheBust: true,
                    pixelRatio: 2, // 2 is safer for mobile memory limits
                    backgroundColor: '#050505',
                    useCORS: true,
                    allowTaint: false, // Don't allow tainting as it breaks blob creation
                    skipFonts: false,
                });

                if (blob) {
                    const fileName = `raid-match-${p1.username.toLowerCase()}-vs-${p2.username.toLowerCase()}.png`;
                    const file = new File([blob], fileName, { type: 'image/png' });
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'RAID Match Poster',
                            });
                        } catch (sErr) {
                            triggerDirectDownload(blob, fileName);
                        }
                    } else {
                        triggerDirectDownload(blob, fileName);
                    }
                }
            }
        } catch (err) {
            console.error("Download failed:", err);
            alert("Capture failed. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const triggerDirectDownload = (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        setIsSharing(true);
        const text = getShareText();
        try {
            let file = null;
            if (posterRef.current) {
                // Give the browser a moment to ensure all high-res assets are painted
                await new Promise(r => setTimeout(r, 1000));

                try {
                    const blob = await toBlob(posterRef.current, {
                        cacheBust: true,
                        pixelRatio: 2,
                        backgroundColor: '#050505',
                        useCORS: true,
                        allowTaint: false,
                        skipFonts: false,
                    });
                    if (blob) {
                        file = new File([blob], 'raid-match-card.png', { type: 'image/png' });
                    }
                } catch (e) {
                    console.error("Image generation failed", e);
                }
            }

            const shareData = {
                title: 'RAID Match Card',
                text: text,
            };

            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
            } else {
                shareData.url = getShareUrl();
            }

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error("No native share support");
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank');
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-3xl animate-fade-in overflow-y-auto py-8">
            <div className="relative w-full max-w-xl bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] my-auto select-none">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[60] p-3 bg-black/40 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-xl border border-white/5"
                >
                    <X size={20} />
                </button>

                {/* THE POSTER CONTAINER */}
                <div ref={posterRef} className="relative aspect-[4/5] w-full bg-black text-white overflow-hidden flex flex-col font-sans">

                    {/* Entry Loader (Prevent Mock Data Flash) */}
                    {isFetchingInfo && (!extraData.p1 || !extraData.p2) && (
                        <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center">
                            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Initializing Arena...</p>
                        </div>
                    )}

                    {/* --- CINEMATIC BACKGROUND --- */}
                    <div className="absolute inset-0 bg-[#050505]">
                        {/* 1. Base Gradient Glows */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(234,88,12,0.15),transparent_50%)]" />
                        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(37,99,235,0.15),transparent_50%)]" />

                        {/* 2. Hexagonal Pattern (Cyberpunk Feel) */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />

                        {/* 3. Central Light Streak */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-white/10 rotate-[15deg] blur-sm" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-white/5 rotate-[-15deg] blur-sm" />

                        {/* 4. Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                    </div>

                    {/* --- HEADER: RAID ARENA --- */}
                    <div className="relative z-50 pt-8 px-8 flex flex-col items-center">
                        <div className="flex items-center gap-3 text-white">
                            <div className="h-[2px] w-6 bg-gradient-to-r from-transparent to-orange-500" />
                            <h1 className="text-xl sm:text-2xl font-[1000] italic tracking-[0.3em] uppercase flex items-center gap-2">
                                RAID <span className="text-orange-500">ARENA</span>
                            </h1>
                            <div className="h-[2px] w-6 bg-gradient-to-l from-transparent to-blue-500" />
                        </div>
                    </div>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="relative flex-1 w-full flex flex-col justify-center items-center px-6 mt-8">

                        {/* THE BIG VS */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 select-none">
                            <span className="text-[10rem] sm:text-[12rem] font-[1000] italic text-white/[0.04] leading-none transform -skew-x-12">
                                VS
                            </span>
                        </div>

                        {/* PLAYER CARDS CONTAINER */}
                        <div className="relative w-full grid grid-cols-2 gap-4 items-center z-20">

                            {/* PLAYER 1 (LEFT) */}
                            <div className="flex flex-col items-center">
                                <div className="relative group flex-shrink-0">
                                    {/* Permanent Outer Glow */}
                                    <div className="absolute -inset-4 bg-orange-600/40 blur-2xl rounded-full opacity-100 transition-opacity" />

                                    {/* Avatar Frame - FALLBACKS ADDED */}
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-orange-500/50 overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.6)] transform hover:scale-105 transition-transform duration-500 flex items-center justify-center bg-zinc-900">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/40 to-transparent z-10" />
                                        {isFetchingInfo && !p1.avatarUrl ? (
                                            <Loader2 size={32} className="animate-spin text-orange-500/50" />
                                        ) : (
                                            <img
                                                src={base64Avatars.p1 || p1.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p1.username || 'P1'}`}
                                                className="w-full h-full object-cover"
                                                alt={p1.username}
                                                crossOrigin="anonymous"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                </div>

                                {/* FLEXIBLE HEIGHT TEXT CONTAINER */}
                                <div className="relative z-30 -mt-4 text-center min-h-[6rem] w-full px-2 flex flex-col justify-start">
                                    <h2 className="text-2xl sm:text-3xl font-[1000] italic leading-[0.9] text-white uppercase tracking-tighter mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                                        {formatDisplayName(p1.username)}
                                    </h2>
                                    {p1TeamName && (
                                        <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-[10px] tracking-widest uppercase opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                            <Shield size={9} className="flex-shrink-0" />
                                            <span>{p1TeamName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PLAYER 2 (RIGHT) */}
                            <div className="flex flex-col items-center">
                                <div className="relative group flex-shrink-0">
                                    {/* Permanent Outer Glow */}
                                    <div className="absolute -inset-4 bg-blue-600/40 blur-2xl rounded-full opacity-100 transition-opacity" />

                                    {/* Avatar Frame */}
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500/50 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.6)] transform hover:scale-105 transition-transform duration-500 flex items-center justify-center bg-zinc-900">
                                        <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/40 to-transparent z-10" />
                                        {isBye ? (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                <Trophy className="text-blue-500/50 w-12 h-12" />
                                            </div>
                                        ) : isFetchingInfo && !p2.avatarUrl ? (
                                            <Loader2 size={32} className="animate-spin text-blue-500/50" />
                                        ) : (
                                            <img
                                                src={base64Avatars.p2 || p2.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p2.username || 'P2'}`}
                                                className="w-full h-full object-cover"
                                                alt={p2.username}
                                                crossOrigin="anonymous"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                </div>

                                {/* FLEXIBLE HEIGHT TEXT CONTAINER */}
                                <div className="relative z-30 -mt-4 text-center min-h-[6rem] w-full px-2 flex flex-col justify-start">
                                    <h2 className="text-2xl sm:text-3xl font-[1000] italic leading-[0.9] text-white uppercase tracking-tighter mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                                        {isBye ? 'AUTO-WIN' : formatDisplayName(p2.username)}
                                    </h2>
                                    {p2TeamName && !isBye && (
                                        <div className="flex items-center justify-center gap-1 text-blue-400 font-bold text-[10px] tracking-widest uppercase opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                            <Shield size={9} className="flex-shrink-0" />
                                            <span>{p2TeamName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* CENTRAL VS OVERLAY (SHARPER) */}
                        <div className="absolute top-[45%] left-[49%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-50" />
                                <span className="relative block px-8 text-5xl sm:text-6xl font-[1000] italic bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-400 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] transform -skew-x-12">
                                    VS
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* --- FOOTER: TOURNAMENT INFO --- */}
                    <div className="relative z-50 pb-6 px-8">
                        <div className="flex flex-col items-center">
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4" />

                            <div className="flex flex-wrap justify-center mb-3 w-full">
                                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900/90 border border-white/20 rounded-full max-w-[90%] sm:max-w-full">
                                    <Trophy size={14} className="text-orange-500 flex-shrink-0" />
                                    <span className="text-[10px] sm:text-[11px] font-[1000] tracking-[0.2em] uppercase text-white drop-shadow-sm truncate min-w-0">
                                        {tournament?.title || 'CHAMPIONS LEAGUE'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-4 py-1.5 bg-zinc-900/90 border border-white/20 rounded-full">
                                <span className="text-[8px] font-black tracking-[0.4em] text-orange-400 uppercase">
                                    #RAIDARENA-MATCH-CARD
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- CINEMATIC LIGHT LEAK --- */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* --- DECORATIVE SCANLINES & GRAIN --- */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
                </div>

                {/* CONTROLS (Glassmorphic) */}
                <div className="p-6 sm:p-8 bg-zinc-950 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading || isSharing}
                        className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] sm:text-[11px] transition-all active:scale-95 disabled:opacity-50 order-2 sm:order-1"
                    >
                        {isDownloading ? <Loader2 size={18} className="animate-spin text-orange-500" /> : <Download size={18} />}
                        {isDownloading ? 'Processing...' : 'Download Image'}
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isSharing || isDownloading}
                        className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 font-black uppercase tracking-widest text-[10px] sm:text-[11px] transition-all shadow-[0_10px_30px_rgba(234,88,12,0.3)] active:scale-95 disabled:opacity-50 order-1 sm:order-2"
                    >
                        {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                        {isSharing ? 'Capturing...' : 'Share Poster'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');

                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                :global(.font-sans) {
                    font-family: 'Outfit', sans-serif !important;
                }
            `}</style>
        </div>
    );
}
