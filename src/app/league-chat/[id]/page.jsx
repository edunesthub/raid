// src/app/league-chat/[id]/page.jsx
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader, AlertCircle, Users as UsersIcon, Trash2, Trophy, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { directMessageService } from '@/services/directMessageService';
import DirectMessageModal from '@/components/DirectMessageModal';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function LeagueChatPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [leagueName, setLeagueName] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [participantUnreads, setParticipantUnreads] = useState({});
    const [lastMessages, setLastMessages] = useState({});
    const [pendingMessages, setPendingMessages] = useState([]);
    const [navigatingBack, setNavigatingBack] = useState(false);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(null);
    const unreadSeparatorRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Check authorization and load league details
    useEffect(() => {
        const checkAuth = async () => {
            if (!user?.id || !resolvedParams?.id) {
                if (!isAuthenticated) router.push('/auth/login');
                return;
            }

            try {
                setLoading(true);
                // Load league details
                const leagueRef = doc(db, 'league_seasons', resolvedParams.id);
                const leagueSnap = await getDoc(leagueRef);

                if (!leagueSnap.exists()) {
                    router.push('/chat');
                    return;
                }

                const leagueData = leagueSnap.data();
                setLeagueName(leagueData.name || 'League Chat');

                // Check if user is admin
                const userDoc = await getDoc(doc(db, 'users', user.id));
                const userData = userDoc.data();
                const isAdmin = userData?.role === 'admin' || userData?.adminRole || user.email === 'admin@raidarena.com';

                if (isAdmin) {
                    setIsAuthorized(true);
                } else {
                    // Check if user is in any team belonging to this league
                    const teamsQuery = query(collection(db, `league_seasons/${resolvedParams.id}/teams`));
                    const teamsSnap = await getDocs(teamsQuery);
                    const leagueTeamNames = teamsSnap.docs.map(d => d.data().name.toLowerCase());

                    // Get user's teams
                    const userTeamsQuery = query(collection(db, 'teams'), where('members', 'array-contains', user.email));
                    const userTeamsSnap = await getDocs(userTeamsQuery);
                    const userManagedTeamsQuery = query(collection(db, 'teams'), where('manager', '==', user.email));
                    const userManagedTeamsSnap = await getDocs(userManagedTeamsQuery);

                    const userTeamNames = [
                        ...userTeamsSnap.docs.map(d => d.data().name.toLowerCase()),
                        ...userManagedTeamsSnap.docs.map(d => d.data().name.toLowerCase())
                    ];

                    if (userTeamNames.some(name => leagueTeamNames.includes(name))) {
                        setIsAuthorized(true);
                    } else {
                        router.push('/chat');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking authorization:', error);
                router.push('/chat');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [user, resolvedParams?.id, router]);

    // Load participants (members of teams in the league)
    useEffect(() => {
        if (!resolvedParams?.id || !isAuthorized || !user?.id) return;

        const loadParticipants = async () => {
            try {
                const leagueTeamsQuery = query(collection(db, `league_seasons/${resolvedParams.id}/teams`));
                const leagueTeamsSnap = await getDocs(leagueTeamsQuery);
                const teamNames = leagueTeamsSnap.docs.map(d => d.data().name);

                if (teamNames.length === 0) return;

                // Fetch teams to get member emails
                // Firestore 'in' query limit is 10, so if there are more teams, we might need multiple queries
                const teamsRef = collection(db, 'teams');
                const teamBatches = [];
                for (let i = 0; i < teamNames.length; i += 10) {
                    const batch = teamNames.slice(i, i + 10);
                    teamBatches.push(query(teamsRef, where('name', 'in', batch)));
                }

                const teamsSnapshots = await Promise.all(teamBatches.map(q => getDocs(q)));
                const allMemberEmails = new Set();

                teamsSnapshots.forEach(snap => {
                    snap.forEach(docSnap => {
                        const data = docSnap.data();
                        if (data.manager) allMemberEmails.add(data.manager);
                        if (data.members) data.members.forEach(email => allMemberEmails.add(email));
                    });
                });

                // Fetch user profiles for these emails
                const emailsArray = Array.from(allMemberEmails);
                const usersList = [];

                for (let i = 0; i < emailsArray.length; i += 10) {
                    const batch = emailsArray.slice(i, i + 10);
                    const usersQuery = query(collection(db, 'users'), where('email', 'in', batch));
                    const usersSnap = await getDocs(usersQuery);
                    usersSnap.forEach(uDoc => {
                        const uData = uDoc.data();
                        usersList.push({
                            id: uDoc.id,
                            username: uData.username || uData.email,
                            avatarUrl: uData.avatarUrl || null,
                            email: uData.email
                        });
                    });
                }

                setParticipants(usersList);

                // Subscribe to DMs with each participant (similar to tournament chat)
                const unsubscribers = [];
                usersList.forEach(participant => {
                    if (participant && participant.id !== user.id) {
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
            } catch (error) {
                console.error('Error loading participants:', error);
            }
        };

        loadParticipants();
    }, [resolvedParams?.id, isAuthorized, user?.id]);

    // Subscribe to chat messages
    useEffect(() => {
        if (!resolvedParams?.id || !isAuthorized || !user?.id) return;

        const lastRead = localStorage.getItem(`league_chat_last_read_${resolvedParams.id}_${user.id}`);
        setLastReadTimestamp(lastRead ? new Date(parseInt(lastRead)) : null);

        const unsubscribe = chatService.subscribeToLeagueChat(
            resolvedParams.id,
            (newMessages) => {
                setMessages(newMessages);

                // Update last read (optimistic)
                if (newMessages.length > 0) {
                    const latest = newMessages[newMessages.length - 1].createdAt;
                    if (latest) {
                        const ts = latest.toMillis ? latest.toMillis() : new Date(latest).getTime();
                        localStorage.setItem(`league_chat_last_read_${resolvedParams.id}_${user.id}`, ts.toString());
                    }
                }

                setTimeout(() => {
                    if (unreadSeparatorRef.current) {
                        unreadSeparatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        );

        return () => unsubscribe();
    }, [resolvedParams?.id, isAuthorized, user?.id]);

    const handleOpenDM = (recipient) => {
        if (recipient.id === user?.id) return;
        setParticipantUnreads(prev => {
            const oldUnread = prev[recipient.id] || 0;
            const updated = { ...prev };
            delete updated[recipient.id];
            setUnreadCount(prevUnread => Math.max(0, prevUnread - oldUnread));
            return updated;
        });
        setSelectedRecipient(recipient);
        setShowParticipants(false);
    };

    const handleSendMessage = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        const messageText = newMessage.trim();
        if (!messageText || !user) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            senderId: user.id,
            senderName: user.username || user.email,
            senderAvatar: user.avatarUrl || null,
            message: messageText,
            createdAt: new Date(),
            status: 'sending'
        };

        setNewMessage('');
        setPendingMessages(prev => [...prev, optimisticMessage]);

        try {
            await chatService.sendLeagueMessage(resolvedParams.id, {
                senderId: user.id,
                senderName: user.username || user.email,
                senderAvatar: user.avatarUrl || null,
                message: messageText,
            });
            setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
        } catch (err) {
            console.error('Error sending message:', err);
            setPendingMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, status: 'error' } : msg));
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await chatService.deleteLeagueMessage(messageId);
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (selectedRecipient) {
        return (
            <DirectMessageModal
                isOpen={true}
                onClose={() => setSelectedRecipient(null)}
                recipient={selectedRecipient}
                leagueId={resolvedParams.id}
            />
        );
    }

    return (
        <div className="h-[100dvh] bg-[#0a0a0a] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 px-3 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                        onClick={() => {
                            setNavigatingBack(true);
                            router.back();
                        }}
                        disabled={navigatingBack}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 disabled:opacity-60"
                    >
                        {navigatingBack ? (
                            <Loader className="w-5 h-5 animate-spin text-white" />
                        ) : (
                            <ArrowLeft className="w-5 h-5 text-white" />
                        )}
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <Trophy className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-white font-semibold text-sm truncate uppercase tracking-tight italic">{leagueName}</h1>
                            <p className="text-[10px] text-green-400/60 font-black uppercase tracking-widest leading-none">Global League Chat</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="relative flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 px-3 py-2 rounded-lg transition-colors border border-green-500/20"
                >
                    <span className="text-[10px] leading-none text-green-400 font-black uppercase tracking-widest hidden sm:block">Players</span>
                    <div className="relative">
                        <UsersIcon className="w-4 h-4 text-green-400" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Participants Sidebar */}
            {showParticipants && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm" onClick={() => setShowParticipants(false)} />
                    <div className="fixed top-0 right-0 bottom-0 w-80 bg-[#0a0a0a] border-l border-white/5 z-30 shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-black uppercase text-sm tracking-widest">League Members</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{participants.length} online talent</p>
                            </div>
                            <button onClick={() => setShowParticipants(false)} className="text-gray-500 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {participants
                                .sort((a, b) => {
                                    if (a.id === user?.id) return -1;
                                    return a.username.localeCompare(b.username);
                                })
                                .map((participant) => {
                                    const unread = participantUnreads[participant.id] || 0;
                                    return (
                                        <button
                                            key={participant.id}
                                            onClick={() => handleOpenDM(participant)}
                                            disabled={participant.id === user?.id}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${participant.id === user?.id ? 'bg-white/5 cursor-default' : 'hover:bg-white/5 group'
                                                }`}
                                        >
                                            <div className="relative">
                                                {participant.avatarUrl ? (
                                                    <Image src={participant.avatarUrl} alt={participant.username} width={40} height={40} className="rounded-xl w-10 h-10 object-cover border border-white/10" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/40 flex items-center justify-center text-green-400 font-bold border border-green-500/20 uppercase">
                                                        {participant.username?.[0]}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{participant.username}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                                    {participant.id === user?.id ? 'You' : 'Tier 1 Talent'}
                                                </p>
                                            </div>
                                            {unread > 0 && (
                                                <div className="bg-orange-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black">
                                                    {unread}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {[...messages, ...pendingMessages].length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                        <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <MessageCircle className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Quiet on the frontlines</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Be the first to rally the teams</p>
                        </div>
                    </div>
                ) : (
                    [...messages, ...pendingMessages]
                        .sort((a, b) => {
                            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
                            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
                            return aTime - bTime;
                        })
                        .map((msg, idx, arr) => {
                            const isOwn = msg.senderId === user?.id;
                            const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : new Date(msg.createdAt).getTime();
                            const lastTime = lastReadTimestamp?.getTime() || 0;
                            const isFirstUnread = !isOwn && lastTime && msgTime > lastTime && (idx === 0 || (arr[idx - 1].createdAt?.toMillis ? arr[idx - 1].createdAt.toMillis() : new Date(arr[idx - 1].createdAt).getTime()) <= lastTime);

                            return (
                                <div key={msg.id} className="space-y-4">
                                    {isFirstUnread && (
                                        <div ref={unreadSeparatorRef} className="flex items-center gap-4 py-2">
                                            <div className="flex-1 h-px bg-green-500/20" />
                                            <span className="text-[9px] font-black text-green-400 uppercase tracking-[0.3em]">New Directives</span>
                                            <div className="flex-1 h-px bg-green-500/20" />
                                        </div>
                                    )}
                                    <div className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                        <div className="relative flex-shrink-0">
                                            {msg.senderAvatar ? (
                                                <Image src={msg.senderAvatar} alt={msg.senderName} width={32} height={32} className="rounded-full w-8 h-8 object-cover border border-white/10" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-white border border-white/10 uppercase">
                                                    {msg.senderName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 px-1">
                                                {msg.senderName} • {formatTime(msg.createdAt)}
                                            </span>
                                            <div className={`relative group px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-green-600 text-white rounded-br-none shadow-lg shadow-green-600/10' : 'bg-gray-900 border border-white/5 text-gray-200 rounded-bl-none'
                                                }`}>
                                                {msg.message}
                                                {isOwn && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-all text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            {msg.status === 'sending' && (
                                                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-1 animate-pulse">Transmitting...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom,1.5rem)] md:pb-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to the league..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 md:px-5 py-3 text-base text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:grayscale text-black rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-green-500/20"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
