// src/components/DirectMessageModal.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, Loader, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { directMessageService } from '@/services/directMessageService';
import Image from 'next/image';

export default function DirectMessageModal({ recipient, tournamentId, isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Subscribe to direct messages
  useEffect(() => {
    if (!recipient?.id || !user?.id || !isOpen) return;

    setLoading(true);
    const unsubscribe = directMessageService.subscribeToDirectMessages(
      user.id,
      recipient.id,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        
        // Mark messages as read
        if (newMessages.length > 0) {
          const conversationId = directMessageService.getConversationId(user.id, recipient.id);
          directMessageService.markMessagesAsRead(conversationId, user.id);
        }
      }
    );

    return () => unsubscribe();
  }, [recipient?.id, user?.id, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !recipient) return;

    try {
      setSending(true);
      setError(null);

      await directMessageService.sendDirectMessage(
        user.id,
        user.username || user.email,
        user.avatarUrl,
        recipient.id,
        recipient.username,
        newMessage,
        tournamentId
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
      await directMessageService.deleteDirectMessage(messageId);
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
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 flex-1">
          {/* Recipient Avatar */}
          {recipient?.avatarUrl ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
              <Image
                src={recipient.avatarUrl}
                alt={recipient.username}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-700">
              <span className="text-white text-sm font-bold">
                {recipient?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-white font-bold">{recipient?.username || 'User'}</h3>
            <p className="text-gray-400 text-xs">Direct Message</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              {recipient?.avatarUrl ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={recipient.avatarUrl}
                    alt={recipient.username}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-gray-600 text-3xl font-bold">
                  {recipient?.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <h4 className="text-white font-semibold mb-2">Start a conversation</h4>
            <p className="text-gray-400 text-sm">
              Say hello to {recipient?.username || 'your teammate'}!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {(isOwn ? user?.avatarUrl : recipient?.avatarUrl) ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700">
                        <Image
                          src={isOwn ? user.avatarUrl : recipient.avatarUrl}
                          alt={isOwn ? user.username : recipient.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-2 border-gray-700">
                        <span className="text-white text-xs font-bold">
                          {(isOwn ? user?.username : recipient?.username)?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`inline-flex items-center gap-2 group relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl break-words max-w-[80%] ${
                            isOwn
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        {isOwn && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={deletingMessageId === msg.id}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg"
                            title="Delete message"
                          >
                            {deletingMessageId === msg.id ? (
                              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            )}
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
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
            placeholder={`Message ${recipient?.username || 'user'}...`}
            disabled={sending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
}
