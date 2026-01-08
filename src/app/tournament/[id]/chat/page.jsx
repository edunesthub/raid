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
        onClose={() => setSelectedRecipient(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-orange-500/20 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/tournament/${resolvedParams.id}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-400" />
            <div>
              <h1 className="text-white font-semibold">Tournament Chat</h1>
              <p className="text-xs text-gray-400">{tournamentName}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <UsersIcon className="w-5 h-5 text-white" />
          {participants.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {participants.length}
            </span>
          )}
        </button>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute top-16 right-0 w-72 bg-black/90 backdrop-blur-md border-l border-orange-500/20 h-[calc(100vh-4rem)] z-20 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">Participants ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => handleOpenDM(participant)}
                  disabled={participant.id === user?.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    participant.id === user?.id
                      ? 'bg-orange-500/10 cursor-default'
                      : 'hover:bg-orange-500/20 cursor-pointer'
                  }`}
                >
                  {participant.avatarUrl ? (
                    <Image
                      src={participant.avatarUrl}
                      alt={participant.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {participant.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{participant.username}</p>
                    {participant.id === user?.id && (
                      <p className="text-xs text-orange-400">You</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
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
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {msg.senderAvatar ? (
                  <Image
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {msg.senderName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-orange-400">{msg.senderName}</span>
                  </div>
                  <div className="group relative inline-block">
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
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
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {deletingMessageId === msg.id ? (
                          <Loader className="w-4 h-4 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-400" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-orange-500/20 p-4 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
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
