import React, { useRef, useState } from 'react';
import { X, Copy, MessageCircle, Trophy, Swords, Zap, Star, Shield, Target, TrendingUp, Check, Share2, Loader2 } from 'lucide-react';
import { toBlob } from 'html-to-image';

export default function MatchPosterModal({ isOpen, onClose, match, tournament, mode = 'match' }) {
    const modalRef = useRef(null);
    const posterRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    if (!isOpen || !match) return null;

    const p1 = match.player1 || { username: 'TBD' };
    const p2 = match.player2 || { username: 'TBD' };
    const isBye = !match.player2Id;

    // Enhanced details
    const p1Team = match.player1Team || match.team1 || null;
    const p2Team = match.player2Team || match.team2 || null;

    // Construct share URL with params for OG Image
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

    // Cleaner Share Text
    const getShareText = () => {
        const url = getShareUrl();
        if (mode === 'match') {
            return `👊 ${p1.username} vs ${p2.username}\n🏆 ${tournament?.title || 'RAID Tournament'}\n🔴 LIVE NOW on RAID\n\n🔗 Watch here: ${url}`;
        }
        return `🏆 ${tournament?.title}\n💰 Prize Pool: ${tournament?.prizePool} ${tournament?.currency}\n🎮 Join the Fight\n\n🔗 Enter here: ${url}`;
    }

    const handleCopy = async () => {
        const text = getShareText();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.warn('Copy failed', err);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const text = getShareText();
        try {
            // Attempt to generate image from DOM
            let file = null;
            if (posterRef.current) {
                try {
                    const blob = await toBlob(posterRef.current, {
                        cacheBust: true,
                        pixelRatio: 2,
                        backgroundColor: '#000', // Ensure black bg
                    });
                    if (blob) {
                        file = new File([blob], 'fight-card.png', { type: 'image/png' });
                    }
                } catch (e) {
                    console.error("Image generation failed", e);
                }
            }

            const shareData = {
                title: 'RAID Fight Card',
                text: text,
            };

            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
            } else {
                shareData.url = getShareUrl(); // Fallback to URL if no file support
            }

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error("No native share support");
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                // Fallback
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank');
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto sm:overflow-hidden">
            <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(234,88,12,0.15)] my-auto select-none">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* THE POSTER */}
                <div ref={posterRef} className="relative aspect-[4/5] w-full bg-black text-white overflow-hidden flex flex-col">

                    {/* Background Ambience */}
                    <div className="absolute inset-0 bg-[#050505]">
                        {/* Subtle grit texture */}
                        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                        {/* Lighting */}
                        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-orange-900/20 to-transparent opacity-60" />
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent opacity-60" />
                    </div>

                    {/* Tournament Header (Compact) */}
                    <div className="relative z-10 pt-6 pb-2 text-center">
                        <h2 className="text-[10px] sm:text-xs font-[900] tracking-[0.3em] text-white/60 uppercase">
                            {tournament?.game || 'RAID ARENA'}
                        </h2>
                        <h1 className="text-xl sm:text-2xl font-[1000] uppercase italic tracking-tighter leading-none mt-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                            {tournament?.title || 'CHAMPIONSHIP'}
                        </h1>
                    </div>

                    {/* FIGHTERS CONTAINER */}
                    <div className="flex-1 relative flex flex-col sm:flex-row items-center justify-center">

                        {/* FIGHTER 1 (Red Corner/Top) */}
                        <div className="relative flex-1 w-full h-full flex flex-col items-center justify-end sm:justify-center pb-8 sm:pb-0 z-10">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 sm:bg-gradient-to-r sm:to-black/80" />

                            {/* Avatar */}
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-2 z-20">
                                <div className="absolute inset-0 bg-orange-600 blur-[60px] opacity-20" />
                                <div className="w-full h-full rounded-full border-2 border-orange-500/50 p-1">
                                    <img
                                        src={p1.avatarUrl || 'https://placehold.co/200x200/1a1a1a/FFF?text=?'}
                                        className="w-full h-full object-cover rounded-full grayscaleContrast"
                                        alt={p1.username}
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div className="relative z-20 text-center">
                                <div className="inline-block px-2 py-0.5 bg-orange-600/20 border border-orange-600/30 rounded text-[10px] font-bold text-orange-500 mb-1 tracking-widest uppercase">
                                    {p1Team?.name?.substring(0, 10) || 'CHALLENGER'}
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-[1000] uppercase italic leading-none tracking-tighter drop-shadow-lg">
                                    {p1.username?.substring(0, 12)}
                                </h3>
                            </div>
                        </div>

                        {/* VS ELEMENT */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white blur-[40px] opacity-10" />
                                <span className="relative z-10 font-[1000] text-5xl sm:text-7xl italic text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                                    VS
                                </span>
                            </div>
                        </div>

                        {/* FIGHTER 2 (Blue Corner/Bottom) */}
                        <div className="relative flex-1 w-full h-full flex flex-col items-center justify-start sm:justify-center pt-8 sm:pt-0 z-10">
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/80 sm:bg-gradient-to-l sm:from-transparent sm:via-transparent sm:to-black/80" />

                            {/* Avatar */}
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-2 z-20 order-last sm:order-first">
                                <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-20" />
                                <div className="w-full h-full rounded-full border-2 border-blue-500/50 p-1">
                                    {isBye ? (
                                        <div className="w-full h-full rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-500/30">
                                            <span className="font-black italic text-blue-500 text-xl">BYE</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={p2.avatarUrl || 'https://placehold.co/200x200/1a1a1a/FFF?text=?'}
                                            className="w-full h-full object-cover rounded-full grayscaleContrast"
                                            alt={p2.username}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="relative z-20 text-center order-first sm:order-last mb-2 sm:mb-0 sm:mt-2">
                                <h3 className="text-3xl sm:text-4xl font-[1000] uppercase italic leading-none tracking-tighter drop-shadow-lg">
                                    {isBye ? 'AUTO ADV' : p2.username?.substring(0, 12)}
                                </h3>
                                {!isBye && (
                                    <div className="inline-block mt-1 px-2 py-0.5 bg-blue-600/20 border border-blue-600/30 rounded text-[10px] font-bold text-blue-500 tracking-widest uppercase">
                                        {p2Team?.name?.substring(0, 10) || 'CONTENDER'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Tale of the tape */}
                    <div className="relative z-10 pb-8 pt-4 flex flex-col items-center gap-2">
                        <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-white/50">
                            <span className="flex items-center gap-1.5 ">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                LIVE ON RAID
                            </span>
                            <span className="text-white/20">•</span>
                            <span>ROUND {match.round || 1}</span>
                        </div>
                    </div>

                </div>

                {/* CONTROLS */}
                <div className="p-4 bg-black border-t border-white/5 grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] transition-all border border-white/5 active:scale-95"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Link Copied' : 'Copy Link'}
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black hover:bg-gray-200 font-[900] uppercase tracking-wider text-[10px] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                        {isSharing ? 'Saving...' : 'Share Image'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .grayscaleContrast {
                    filter: grayscale(100%) contrast(1.2) brightness(1.1);
                }
            `}</style>
        </div>
    );
}
