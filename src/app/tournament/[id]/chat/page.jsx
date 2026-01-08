// src/app/tournament/[id]/chat/page.jsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader, AlertCircle, Users as UsersIcon, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
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
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [tournamentName, setTournamentName] = useState('');

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
    if (!resolvedParams?.id || !isParticipant) return;
    
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
      } catch (error) {
        console.error('Error loading participants:', error);
      }
    };
    
    loadParticipants();
  }, [resolvedParams?.id, isParticipant]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !user) return;

    setSending(true);
    setError(null);

    try {
      await chatService.sendMessage(resolvedParams.id, {
        senderId: user.id,
        senderName: user.username || user.email,
        senderAvatar: user.avatarUrl || null,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
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

  const handleOpenDM = (recipient) => {
    if (recipient.id === user?.id) return; // Can't message yourself
    setSelectedRecipient(recipient);
    setShowParticipants(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
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
            <h3 className="text-white font-semibold mb-3 text-sm">Participants ({participants.length})</h3>
            <div className="space-y-1.5">
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => handleOpenDM(participant)}
                  disabled={participant.id === user?.id}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${
                    participant.id === user?.id
                      ? 'bg-orange-500/10 cursor-default'
                      : 'hover:bg-orange-500/20 cursor-pointer active:bg-orange-500/30'
                  }`}
                >
                  {participant.avatarUrl ? (
                    <Image
                      src={participant.avatarUrl}
                      alt={participant.username}
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {participant.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white font-medium text-sm truncate">{participant.username}</p>
                    {participant.id === user?.id && (
                      <p className="text-xs text-orange-400">You</p>
                    )}
                  </div>
                </button>
              ))}
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
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {msg.senderAvatar ? (
                  <Image
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0 w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {msg.senderName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                  <div className={`flex items-baseline gap-1.5 mb-0.5 ${isOwn ? 'justify-end' : ''}`}>
                    <span className="text-xs font-medium text-orange-400 truncate">{msg.senderName}</span>
                  </div>
                  <div className="group relative inline-block max-w-[85%] sm:max-w-[75%]">
                    <div
                      className={`inline-block px-3 py-2 rounded-2xl text-sm break-words ${
                        isOwn
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
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
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-black/40 backdrop-blur-md border-t border-gray-800/50 p-3 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-gray-900/50 text-white placeholder-gray-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-800/50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex-shrink-0"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
