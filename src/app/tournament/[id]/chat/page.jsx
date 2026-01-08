// src/app/tournament/[id]/chat/page.jsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader, AlertCircle, Users as UsersIcon, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { directMessageService } from '@/services/directMessageService';
import DirectMessageModal from '@/components/DirectMessageModal';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function TournamentChatPage({ params }) {
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
  const [isParticipant, setIsParticipant] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [participantUnreads, setParticipantUnreads] = useState({}); // Track unread per participant
  const [lastMessages, setLastMessages] = useState({}); // Track last message per participant
  const [pendingMessages, setPendingMessages] = useState([]);

  // Check if user is participant and load tournament details
  useEffect(() => {
    const checkParticipant = async () => {
      if (!user?.id || !resolvedParams?.id) {
        router.push(`/tournament/${resolvedParams?.id}`);
        return;
      }

      try {
        const participantRef = doc(db, 'tournament_participants', `${resolvedParams.id}_${user.id}`);
        const participantSnap = await getDoc(participantRef);
        
        if (!participantSnap.exists()) {
          router.push(`/tournament/${resolvedParams.id}`);
          return;
        }
        
        setIsParticipant(true);

        // Load tournament name
        const tournamentRef = doc(db, 'tournaments', resolvedParams.id);
        const tournamentSnap = await getDoc(tournamentRef);
        if (tournamentSnap.exists()) {
          setTournamentName(tournamentSnap.data().name || 'Tournament');
        }
      } catch (error) {
        console.error('Error checking participant:', error);
        router.push(`/tournament/${resolvedParams?.id}`);
      }
    };

    checkParticipant();
  }, [user, resolvedParams?.id, router]);

  // Load participants
  useEffect(() => {
    if (!resolvedParams?.id || !isParticipant || !user?.id) return;
    
    const loadParticipants = async () => {
      try {
        const participantsRef = collection(db, 'tournament_participants');
        const q = query(participantsRef, where('tournamentId', '==', resolvedParams.id));
        const snapshot = await getDocs(q);
        
        const participantsList = [];
        const userPromises = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.userId) {
            userPromises.push(
              getDoc(doc(db, 'users', data.userId)).then(userDoc => {
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    id: data.userId,
                    username: userData.username || userData.email,
                    avatarUrl: userData.avatarUrl || null
                  };
                }
                return null;
              })
            );
          }
        });
        
        const users = await Promise.all(userPromises);
        users.forEach(u => u && participantsList.push(u));
        
        setParticipants(participantsList);
        
        // Subscribe to DMs with each participant
        const unsubscribers = [];
        users.forEach(participant => {
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
                  
                  // Count unread messages (messages from them that we haven't seen)
                  const unreadFromParticipant = messages.filter(
                    msg => msg.senderId === participant.id && !msg.read
                  ).length;
                  
                  setParticipantUnreads(prev => {
                    const oldUnread = prev[participant.id] || 0;
                    const updated = { ...prev, [participant.id]: unreadFromParticipant };
                    setUnreadCount(prevUnread => prevUnread - oldUnread + unreadFromParticipant);
                    return updated;
                  });
                }
              }
            );
            unsubscribers.push(unsubscribe);
          }
        });
        
        return () => {
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('Error loading participants:', error);
      }
    };
    
    loadParticipants();
  }, [resolvedParams?.id, isParticipant, user?.id]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!resolvedParams?.id || !isParticipant) return;

    setLoading(true);
    const unsubscribe = chatService.subscribeToChat(
      resolvedParams.id,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [resolvedParams?.id, isParticipant]);

  const handleOpenDM = (recipient) => {
    if (recipient.id === user?.id) return; // Can't message yourself
    // Clear unread for this participant
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

  const sendChatMessage = async (messageText, tempId) => {
    try {
      await chatService.sendMessage(resolvedParams.id, {
        senderId: user.id,
        senderName: user.username || user.email,
        senderAvatar: user.avatarUrl || null,
        message: messageText,
      });
      // Remove pending placeholder once sent; real message will arrive via subscription
      setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setPendingMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, status: 'error' } : msg));
    }
  };

  const handleSendMessage = async (e, retryMessageText = null) => {
    if (e?.preventDefault) e.preventDefault();
    const messageText = (retryMessageText ?? newMessage).trim();
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

    // Clear input immediately and show pending bubble
    setNewMessage('');
    setPendingMessages(prev => [...prev, optimisticMessage]);
    setError(null);

    await sendChatMessage(messageText, tempId);
  };

  const handleRetryPending = (msg) => {
    // Remove errored placeholder before retrying
    setPendingMessages(prev => prev.filter(m => m.id !== msg.id));
    handleSendMessage(null, msg.message);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    setDeletingMessageId(messageId);
    try {
      await chatService.deleteMessage(messageId);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
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
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated || !isParticipant) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Show direct message modal
  if (selectedRecipient) {
    return (
      <DirectMessageModal
        tournamentId={resolvedParams.id}
        recipient={selectedRecipient}
        isOpen={true}
        onClose={() => setSelectedRecipient(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 px-3 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => router.push(`/tournament/${resolvedParams.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-sm truncate">Tournament Chat</h1>
              <p className="text-xs text-gray-400 truncate">{tournamentName}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        >
          <UsersIcon className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setShowParticipants(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute top-14 right-0 w-64 sm:w-72 bg-[#0a0a0a]/98 backdrop-blur-xl border-l border-gray-800/50 h-[calc(100vh-3.5rem)] z-20 overflow-y-auto">
            <div className="p-3">
            <h3 className="text-white font-semibold mb-2 text-sm">Participants ({participants.length})</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-lg px-2.5 py-2 mb-2">
              <MessageCircle className="w-4 h-4 text-orange-400" />
              <span>Tap a player to start a direct message.</span>
            </div>
            <div className="space-y-1.5">
              {participants
                .sort((a, b) => {
                  // Always push the current user to the bottom of the list
                  if (a.id === user?.id) return 1;
                  if (b.id === user?.id) return -1;
                  
                  // Sort by most recent DM timestamp
                  const aLast = lastMessages[a.id]?.timestamp?.toMillis ? lastMessages[a.id].timestamp.toMillis() : lastMessages[a.id]?.timestamp || 0;
                  const bLast = lastMessages[b.id]?.timestamp?.toMillis ? lastMessages[b.id].timestamp.toMillis() : lastMessages[b.id]?.timestamp || 0;
                  if (bLast !== aLast) return bLast - aLast;
                  // Then by unread count (descending)
                  const aUnread = participantUnreads[a.id] || 0;
                  const bUnread = participantUnreads[b.id] || 0;
                  if (bUnread !== aUnread) return bUnread - aUnread;
                  // Finally alphabetical
                  return a.username.localeCompare(b.username);
                })
                .map((participant) => {
                const unreadForParticipant = participantUnreads[participant.id] || 0;
                return (
                <button
                  key={participant.id}
                  onClick={() => handleOpenDM(participant)}
                  disabled={participant.id === user?.id}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${
                    participant.id === user?.id
                      ? 'cursor-default'
                      : 'hover:bg-orange-500/20 cursor-pointer active:bg-orange-500/30'
                  }`}
                >
                  {participant.avatarUrl ? (
                    <Image
                      src={participant.avatarUrl}
                      alt={participant.username}
                      width={36}
                      height={36}
                      className="rounded-full flex-shrink-0 w-9 h-9 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {participant.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white font-medium text-sm truncate">{participant.username}</p>
                    {participant.id === user?.id ? (
                      <p className="text-xs text-orange-400">You</p>
                    ) : lastMessages[participant.id] ? (
                      <p className={`text-xs truncate ${unreadForParticipant > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {lastMessages[participant.id].isFromMe && <span className="text-gray-500">You: </span>}
                        {lastMessages[participant.id].message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">No messages yet</p>
                    )}
                  </div>
                  {unreadForParticipant > 0 && (
                    <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                      {unreadForParticipant > 9 ? '9+' : unreadForParticipant}
                    </div>
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : [...messages, ...pendingMessages].length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          [...messages, ...pendingMessages]
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
              const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
              return aTime - bTime;
            })
            .map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {msg.senderAvatar ? (
                  <Image
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0 w-9 h-9 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {msg.senderName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                  <div className={`flex items-baseline gap-1.5 mb-0.5 ${isOwn ? 'justify-end' : ''}`}>
                    <span className="text-xs font-medium text-orange-400 truncate">{msg.senderName}</span>
                  </div>
                  <div className="group relative inline-block max-w-[96%] sm:max-w-[88%]">
                    <div
                      className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                      style={{ 
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        hyphens: 'none',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.message}
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingMessageId === msg.id}
                        className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {deletingMessageId === msg.id ? (
                          <Loader className="w-3.5 h-3.5 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-400" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] mt-0.5">
                    <span className="text-gray-500">{formatTime(msg.createdAt)}</span>
                    {msg.status === 'sending' && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <Loader className="w-3 h-3 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    )}
                    {msg.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        <button
                          className="underline text-red-300"
                          onClick={() => handleRetryPending(msg)}
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-black/40 backdrop-blur-md border-t border-gray-800/50 p-3 pb-5 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900/50 text-white placeholder-gray-500 rounded-full px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-800/50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
