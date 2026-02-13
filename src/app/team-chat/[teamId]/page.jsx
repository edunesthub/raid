// src/app/team-chat/[teamId]/page.jsx
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader, AlertCircle, Users as UsersIcon, Trash2, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { directMessageService } from '@/services/directMessageService';
import DirectMessageModal from '@/components/DirectMessageModal';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function TeamChatPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [canChat, setCanChat] = useState(false);
    const [teamData, setTeamData] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [participantUnreads, setParticipantUnreads] = useState({});
    const [lastMessages, setLastMessages] = useState({});
    const [pendingMessages, setPendingMessages] = useState([]);
    const [navigatingBack, setNavigatingBack] = useState(false);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(null);

    const unreadSeparatorRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Check access and load team details
    useEffect(() => {
        const checkAccess = async () => {
            if (!user?.email || !resolvedParams?.teamId) {
                if (!authLoading && !isAuthenticated) router.push('/auth/login');
                return;
            }

            try {
                const teamRef = doc(db, 'teams', resolvedParams.teamId);
                const teamSnap = await getDoc(teamRef);

                if (!teamSnap.exists()) {
                    router.push('/chat');
                    return;
                }

                const data = teamSnap.data();
                setTeamData(data);

                // Check if user is admin, manager, or member
                const userDoc = await getDoc(doc(db, 'users', user.id));
                const userData = userDoc.data();
                const isAdmin = userData?.role === 'admin' || userData?.adminRole || user.email === 'admin@raidarena.com';

                const isManager = data.manager === user.email;
                const isMember = data.members?.includes(user.email);

                if (!isAdmin && !isManager && !isMember) {
                    router.push('/chat');
                    return;
                }

                setCanChat(true);

                // Load participants (members + manager)
                const emails = [...new Set([data.manager, ...(data.members || [])])];
                const participantList = [];

                for (const email of emails) {
                    // Find user by email
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', email));
                    const userSnap = await getDocs(q);

                    if (!userSnap.empty) {
                        const uData = userSnap.docs[0].data();
                        participantList.push({
                            id: userSnap.docs[0].id,
                            username: uData.username || uData.firstName || email.split('@')[0],
                            avatarUrl: uData.avatarUrl || null,
                            email: email,
                            role: email === data.manager ? 'Manager' : 'Member'
                        });
                    } else {
                        // Placeholder for users not registered yet
                        participantList.push({
                            id: email,
                            username: email.split('@')[0],
                            avatarUrl: null,
                            email: email,
                            role: email === data.manager ? 'Manager' : 'Member'
                        });
                    }
                }
                setParticipants(participantList);

            } catch (error) {
                console.error('Error checking access:', error);
                router.push('/chat');
            }
        };

        checkAccess();
    }, [user, resolvedParams?.teamId, router]);

    // Handle DMs logic (similar to tournament chat)
    useEffect(() => {
        if (!canChat || !user?.id || participants.length === 0) return;

        const unsubscribers = [];
        participants.forEach(participant => {
            if (participant.id !== user.id) {
                const unsubscribe = directMessageService.subscribeToDirectMessages(
                    user.id,
                    participant.id,
                    (messages) => {
                        if (messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            setLastMessages(prev => ({
                                ...prev,
                                [participant.id]: {
                                    message: lastMsg.message,
                                    timestamp: lastMsg.timestamp,
                                    isFromMe: lastMsg.senderId === user.id
                                }
                            }));

                            const unreadFromParticipant = messages.filter(
                                msg => msg.senderId === participant.id && !msg.read
                            ).length;

                            setParticipantUnreads(prev => {
                                const oldUnread = prev[participant.id] || 0;
                                const updated = { ...prev, [participant.id]: unreadFromParticipant };
                                setUnreadCount(prevUnread => Math.max(0, prevUnread - oldUnread + unreadFromParticipant));
                                return updated;
                            });
                        }
                    }
                );
                unsubscribers.push(unsubscribe);
            }
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [canChat, user?.id, participants]);

    // Subscribe to team chat messages
    useEffect(() => {
        if (!canChat || !resolvedParams?.teamId || !user?.id) return;

        // Load last read
        const lastRead = localStorage.getItem(`team_chat_last_read_${resolvedParams.teamId}_${user.id}`);
        if (lastRead) setLastReadTimestamp(parseInt(lastRead));

        setLoading(true);
        const unsubscribe = chatService.subscribeToTeamChat(
            resolvedParams.teamId,
            (newMessages) => {
                setMessages(newMessages);
                setLoading(false);

                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);

                if (newMessages.length > 0) {
                    const latest = newMessages[newMessages.length - 1];
                    const ts = latest.createdAt?.toMillis ? latest.createdAt.toMillis() : (latest.createdAt ? new Date(latest.createdAt).getTime() : Date.now());
                    localStorage.setItem(`team_chat_last_read_${resolvedParams.teamId}_${user.id}`, ts.toString());
                }
            }
        );

        return () => unsubscribe();
    }, [canChat, resolvedParams?.teamId, user?.id]);

    const handleSendMessage = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        const msg = newMessage.trim();
        if (!msg || !user) return;

        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            senderId: user.id,
            senderName: user.username || user.email,
            senderAvatar: user.avatarUrl || null,
            message: msg,
            createdAt: new Date(),
            status: 'sending'
        };

        setNewMessage('');
        setPendingMessages(prev => [...prev, optimistic]);

        try {
            await chatService.sendTeamMessage(resolvedParams.teamId, {
                senderId: user.id,
                senderName: user.username || user.email,
                senderAvatar: user.avatarUrl || null,
                message: msg,
            });
            setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        } catch (err) {
            console.error(err);
            setPendingMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete message?')) return;
        setDeletingMessageId(messageId);
        try {
            await chatService.deleteTeamMessage(messageId);
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingMessageId(null);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading && !canChat) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (selectedRecipient) {
        return (
            <DirectMessageModal
                recipient={selectedRecipient}
                isOpen={true}
                onClose={() => setSelectedRecipient(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
            {/* Header */}
            <div className="bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                            {teamData?.avatarUrl ? (
                                <Image src={teamData.avatarUrl} alt={teamData.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-500/20 text-blue-500">
                                    <Shield size={20} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-white font-black uppercase italic tracking-tight truncate">{teamData?.name || 'Squad Chat'}</h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Squad Channel</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="relative flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2.5 rounded-2xl transition-all border border-blue-500/20 group"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Squad</span>
                    <UsersIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-black">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Participants Drawer (Mobile style) */}
            {showParticipants && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowParticipants(false)} />
                    <div className="relative w-80 bg-zinc-950 border-l border-white/10 h-full overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-white uppercase italic">Squad Members</h2>
                                <button onClick={() => setShowParticipants(false)} className="text-gray-500 hover:text-white"><ArrowLeft className="rotate-180" /></button>
                            </div>

                            <div className="space-y-2">
                                {participants.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            if (p.id !== user.id) {
                                                setSelectedRecipient(p);
                                                setShowParticipants(false);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${p.id === user.id ? 'bg-white/5 border border-white/5' : 'hover:bg-blue-500/10 border border-transparent'}`}
                                    >
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800 border border-white/10">
                                            {p.avatarUrl ? (
                                                <Image src={p.avatarUrl} alt={p.username} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-gray-500">
                                                    {p.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-bold text-white truncate">{p.username}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${p.role === 'Manager' ? 'text-orange-500' : 'text-gray-500'}`}>{p.role}</p>
                                        </div>
                                        {participantUnreads[p.id] > 0 && (
                                            <div className="ml-auto bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                                {participantUnreads[p.id]}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing encrypted secure line...</p>
                    </div>
                ) : [...messages, ...pendingMessages].length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <MessageCircle size={64} className="mb-4 text-gray-600" />
                        <h3 className="text-xl font-black text-white uppercase italic">Ghost Channel</h3>
                        <p className="text-xs font-bold uppercase tracking-widest mt-2">{teamData?.name} secure chat initialized.</p>
                    </div>
                ) : (
                    [...messages, ...pendingMessages]
                        .sort((a, b) => (a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime()) - (b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime()))
                        .map((msg, idx) => {
                            const isOwn = msg.senderId === user.id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 border border-white/5 self-end">
                                        {msg.senderAvatar ? (
                                            <Image src={msg.senderAvatar} alt={msg.senderName} width={32} height={32} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-gray-500">
                                                {msg.senderName[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`max-w-[75%] lg:max-w-[50%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {!isOwn && <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">{msg.senderName}</span>}
                                        <div className={`relative group px-4 py-3 rounded-2xl text-sm font-medium ${isOwn ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                            {isOwn && (
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{formatTime(msg.createdAt)}</span>
                                            {msg.status === 'sending' && <Loader size={8} className="animate-spin text-orange-500" />}
                                            {msg.status === 'error' && <span className="text-[9px] text-red-500 font-bold uppercase">Failed</span>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 max-w-4xl mx-auto w-full">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Secure transmission..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all placeholder:text-gray-600 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-orange-600/20 active:scale-90 flex-shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
