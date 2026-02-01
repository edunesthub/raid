import React, { useRef, useState } from 'react';
import { X, Copy, MessageCircle, Trophy, Swords, Zap, Star, Shield, Target, TrendingUp, Check, Share2 } from 'lucide-react';

export default function MatchPosterModal({ isOpen, onClose, match, tournament, mode = 'match' }) {
    const modalRef = useRef(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !match) return null;

    const p1 = match.player1 || { username: 'TBD' };
    const p2 = match.player2 || { username: 'TBD' };
    const isBye = !match.player2Id;

    // Enhanced details
    const p1Team = match.player1Team || match.team1 || null;
    const p2Team = match.player2Team || match.team2 || null;

    const handleCopy = async () => {
        const shareText = mode === 'match'
            ? `🔥 MATCH ALERT: ${p1.username} VS ${p2.username} in ${tournament?.title || 'the tournament'}! 🏆 Check it out on RAID Arena: ${window.location.href}`
            : `🏆 TOURNAMENT ALERT: ${tournament?.title} is LIVE! 🎮 Prize Pool: ${tournament?.prizePool} ${tournament?.currency}! join the raid: ${window.location.href}`;

        try {
            await navigator.clipboard.writeText(`${shareText}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.warn('Copy failed', err);
        }
    };

    const handleShare = async () => {
        const shareText = mode === 'match'
            ? `🔥 MATCH ALERT: ${p1.username} VS ${p2.username} in ${tournament?.title || 'the tournament'}! 🏆 Check it out on RAID Arena: ${window.location.href}`
            : `🏆 TOURNAMENT ALERT: ${tournament?.title} is LIVE! 🎮 Prize Pool: ${tournament?.prizePool} ${tournament?.currency}! join the raid: ${window.location.href}`;

        // Try to use native sharing
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'RAID Arena Matchup',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Sharing failed', err);
                    // Fallback if sharing fails technically
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                    window.open(whatsappUrl, '_blank');
                }
            }
        } else {
            // Fallback for browsers without navigator.share
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto sm:overflow-hidden">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-[2rem] overflow-hidden border border-orange-500/40 shadow-[0_0_80px_rgba(249,115,22,0.3)] my-auto">
                {/* Visual Artifacts */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-30" />
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-30" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 bg-black/60 hover:bg-orange-600 rounded-full transition-all text-white border border-white/10 hover:scale-110 active:scale-95"
                >
                    <X size={20} className="sm:w-[22px] sm:h-[22px]" />
                </button>

                {/* Poster Content */}
                <div className="relative aspect-[4/5] sm:aspect-video w-full overflow-hidden flex items-center justify-center bg-black">
                    {/* Background Layer with Scanlines effect */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-[0.1]" />

                        {/* Tournament Flyer Watermark */}
                        {tournament?.image && (
                            <img
                                src={tournament.image}
                                alt=""
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover opacity-[0.05] scale-150 blur-sm"
                            />
                        )}

                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        {/* Scanlines logic */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
                    </div>

                    {/* Animated Particles/Glows */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[30%] h-[60%] bg-orange-600/30 blur-[120px] animate-pulse rounded-full" />
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[30%] h-[60%] bg-blue-600/30 blur-[120px] animate-pulse delay-1000 rounded-full" />

                    <div className="relative z-20 w-full flex flex-col sm:flex-row items-center justify-center h-full py-10 sm:py-0">
                        {/* Player 1 Side */}
                        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 translate-y-2 order-1">
                            <div className="relative group">
                                {/* Stats Badge Left */}
                                <div className="absolute -left-6 top-0 z-30 space-y-2 hidden sm:block">
                                    <div className="bg-black/80 border border-orange-500/50 rounded-lg p-1.5 backdrop-blur-sm transform -rotate-12 animate-slide-in">
                                        <Target size={14} className="text-orange-500" />
                                    </div>
                                    <div className="bg-black/80 border border-orange-500/50 rounded-lg p-1.5 backdrop-blur-sm transform -rotate-12 animate-slide-in delay-150">
                                        <TrendingUp size={14} className="text-green-500" />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative w-24 h-24 sm:w-48 sm:h-48 rounded-2xl border-4 border-orange-500/60 overflow-hidden transform sm:rotate-2 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                                    {p1.avatarUrl ? (
                                        <img src={p1.avatarUrl} alt={p1.username} className="w-full h-full object-cover grayscale-[0.2]" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-4xl sm:text-5xl font-black text-gray-700 select-none">{p1.username?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    {/* Player Name Overlay */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-600 to-transparent p-2">
                                        <div className="flex items-center gap-1">
                                            <Shield size={10} className="text-white fill-white/20" />
                                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-white tracking-widest leading-none">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-xl sm:text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none truncate max-w-[120px] sm:max-w-none">
                                    {p1.username}
                                </h3>
                                {p1Team && (
                                    <p className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mt-1 italic truncate">
                                        {p1Team.name || p1Team}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* VS Center */}
                        <div className="relative z-30 flex flex-col items-center justify-center w-full sm:w-40 py-4 sm:py-0 order-2">
                            <div className="relative transform hover:scale-110 transition-transform duration-500 cursor-default">
                                <span className="text-6xl sm:text-9xl font-[1000] text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-500 to-red-800 italic leading-none drop-shadow-[0_0_25px_rgba(249,115,22,1)] select-none">
                                    VS
                                </span>
                                <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10">
                                    <Zap size={30} className="sm:w-[50px] sm:h-[50px] text-yellow-400 fill-yellow-400 animate-bounce" />
                                </div>
                                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <div className="px-3 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-xs skew-x-[-15deg] shadow-lg shadow-red-600/30">
                                        MAIN EVENT
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Player 2 Side */}
                        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 translate-y-2 order-3">
                            <div className="relative group">
                                {/* Stats Badge Right */}
                                <div className="absolute -right-6 top-0 z-30 space-y-2 hidden sm:block">
                                    <div className="bg-black/80 border border-blue-500/50 rounded-lg p-1.5 backdrop-blur-sm transform rotate-12 animate-slide-in">
                                        <Star size={14} className="text-blue-500" />
                                    </div>
                                    <div className="bg-black/80 border border-blue-500/50 rounded-lg p-1.5 backdrop-blur-sm transform rotate-12 animate-slide-in delay-150">
                                        <Trophy size={14} className="text-purple-500" />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative w-24 h-24 sm:w-48 sm:h-48 rounded-2xl border-4 border-blue-500/60 overflow-hidden transform sm:-rotate-2 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                                    {isBye ? (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-xl sm:text-3xl font-[1000] text-gray-700 italic block">BYE</span>
                                                <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">ADVANCE</span>
                                            </div>
                                        </div>
                                    ) : p2.avatarUrl ? (
                                        <img src={p2.avatarUrl} alt={p2.username} className="w-full h-full object-cover grayscale-[0.2]" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-4xl sm:text-5xl font-black text-gray-700 select-none">{p2.username?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    {/* Player Name Overlay */}
                                    {!isBye && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-600 to-transparent p-2">
                                            <div className="flex items-center gap-1">
                                                <Shield size={10} className="text-white fill-white/20" />
                                                <span className="text-[8px] sm:text-[10px] font-black uppercase text-white tracking-widest leading-none">READY</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-xl sm:text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none truncate max-w-[120px] sm:max-w-none">
                                    {p2.username || (isBye ? 'BYE' : 'TBD')}
                                </h3>
                                {p2Team && (
                                    <p className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mt-1 italic truncate">
                                        {p2Team.name || p2Team}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Overlays */}
                    <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 w-full px-4">
                        <div className="px-4 sm:px-6 py-1.5 bg-white text-black font-[1000] uppercase text-[10px] sm:text-sm skew-x-[-15deg] shadow-[5px_5px_0px_rgba(249,115,22,1)] border border-black/10 truncate max-w-full text-center">
                            {tournament?.title || 'RAID ARENA CHAMPIONSHIP'}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-transparent to-white/40" />
                            <span className="text-[8px] sm:text-[9px] font-black text-white/60 uppercase tracking-[0.4em] italic mb-1">PROMOTION ONLY</span>
                            <div className="h-px w-4 sm:w-8 bg-gradient-to-l from-transparent to-white/40" />
                        </div>
                    </div>

                    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 w-full text-center px-4">
                        <div className="inline-flex items-center justify-center gap-2 sm:gap-3 text-white font-black italic uppercase text-[10px] sm:text-xs tracking-[0.2em] bg-black/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/20 shadow-2xl">
                            <Swords size={14} className="sm:w-[18px] sm:h-[18px] text-orange-500 animate-pulse" />
                            <span className="truncate">{mode === 'match' ? `ROUND ${match.round} • LIVE` : 'REGISTRATION OPEN'}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-8 bg-[#0a0a0b] border-t border-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-2 flex items-center justify-center sm:justify-start gap-2">
                                <Share2 size={12} className="text-orange-500" />
                                Mobilize the Fans
                            </h4>
                            <p className="text-white/80 text-sm font-medium tracking-tight hidden sm:block">
                                {mode === 'match'
                                    ? `Broadcast this epic matchup to your status and groups!`
                                    : `Invite the community to join the ${tournament?.title}!`
                                }
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleCopy}
                                className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10 hover:border-orange-500/50 group active:scale-95"
                            >
                                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="group-hover:rotate-12 transition-transform" />}
                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-95 group"
                            >
                                <Share2 size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Styles */}
            <style jsx>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-10px) rotate(-12deg); }
                    to { opacity: 1; transform: translateX(0) rotate(-12deg); }
                }
            `}</style>
        </div>
    );
}
