// src/components/TournamentChat.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Loader, AlertCircle, Users as UsersIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import DirectMessageModal from './DirectMessageModal';
import Image from 'next/image';
import UserAvatar from './UserAvatar';

export default function TournamentChat({ tournamentId, isOpen, onClose, participants = [] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!tournamentId || !isOpen) return;

    setLoading(true);
    const unsubscribe = chatService.subscribeToChat(
      tournamentId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tournamentId, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      setError(null);

      await chatService.sendMessage(
        tournamentId,
        user.id,
        user.username || user.email,
        user.avatarUrl,
        newMessage
      );

      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      setDeletingMessageId(messageId);
      await chatService.deleteMessage(messageId);
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
    } finally {
      setDeletingMessageId(null);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Tournament Chat</h3>
            <p className="text-gray-400 text-xs">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg relative"
        >
          <UsersIcon className="w-5 h-5" />
          {participants.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {participants.length}
            </span>
          )}
        </button>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute top-16 right-0 w-72 h-[calc(100%-4rem)] bg-gray-900 border-l border-gray-800 z-10 overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Participants ({participants.length})
            </h4>
          </div>
          <div className="p-2 space-y-1">
            {participants
              .filter(p => p.id !== user?.id) // Don't show yourself
              .map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => {
                    setSelectedRecipient(participant);
                    setShowParticipants(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <UserAvatar
                    user={participant}
                    size="sm"
                    className="border-2 border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{participant.username}</p>
                    <p className="text-gray-400 text-xs">Click to message</p>
                  </div>
                </button>
              ))}
            {participants.filter(p => p.id !== user?.id).length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No other participants yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-gray-600" />
            </div>
            <h4 className="text-white font-semibold mb-2">No messages yet</h4>
            <p className="text-gray-400 text-sm">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwn = msg.userId === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <UserAvatar
                      user={{ id: msg.userId, username: msg.username, avatarUrl: msg.avatarUrl }}
                      size="xs"
                      className="border-2 border-gray-700"
                    />
                  </div>

                  {/* Message */}
                  <div className={`flex-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwn && (
                        <span className="text-xs font-semibold text-gray-300">
                          {msg.username}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className={`inline-flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl break-words max-w-[80%] ${isOwn
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                            : 'bg-gray-800 text-white'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={deletingMessageId === msg.id}
                          className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg group"
                          title="Delete message"
                        >
                          {deletingMessageId === msg.id ? (
                            <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900/50 pb-safe">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {newMessage.length}/500 characters
        </p>
      </form>

      {/* Direct Message Modal */}
      <DirectMessageModal
        recipient={selectedRecipient}
        tournamentId={tournamentId}
        isOpen={!!selectedRecipient}
        onClose={() => setSelectedRecipient(null)}
      />
    </div>
  );
}
