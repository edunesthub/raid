"use client";

import React, { useState, useEffect, use, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Trophy, Tv, MessageSquare, Send, Copy, Share2, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChallenge } from '@/hooks/useChallenge';
import { challengeService } from '@/services/challengeService';
import { chatService, ChatMessage } from '@/services/chatService';
import { Challenge } from '@/types/challenge';

export default function ChallengeLobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code } = use(params);
  const { user } = useAuth();
  const { findChallengeByCode } = useChallenge();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);
      const data = await findChallengeByCode(code);
      if (data) {
        setChallenge(data);
        // Subscribe to chat if found
        const unsub = chatService.subscribeToChallengeChat(data.id!, (msgs) => {
          setMessages(msgs);
        });
        return () => unsub();
      }
    } catch (err) {
      console.error('Error loading challenge:', err);
    } finally {
      setLoading(false);
    }
  }, [code, findChallengeByCode]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !challenge) return;

    try {
      await chatService.sendChallengeMessage(challenge.id!, {
        senderId: user.id,
        senderName: user.username,
        senderAvatar: user.avatarUrl,
        message: newMessage
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-primary">Loading Arena...</div>;
  if (!challenge) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Challenge not found.</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-24">
      {/* Top Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-4 px-6 flex justify-between items-center">
        <button onClick={() => router.push('/challenges')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Exit Lobby
        </button>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Room Code</span>
            <span className="text-xl font-mono font-bold text-primary tracking-widest">{code}</span>
          </div>
          <button onClick={copyCode} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-primary">
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info & Stream */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#16161a] border border-white/5 rounded-3xl overflow-hidden">
            {challenge.streamUrl ? (
              <div className="aspect-video bg-black relative">
                 <iframe 
                  src={challenge.streamUrl} 
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-black/40 flex flex-col items-center justify-center text-center p-12">
                <Tv size={48} className="text-gray-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-500">Live stream not available</h3>
                <p className="text-gray-600 text-sm">The creator hasn&apos;t added a stream link yet.</p>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30 uppercase tracking-wider">
                      {challenge.game}
                    </span>
                    <span className="text-gray-500 text-xs">• Created by {challenge.creatorUsername}</span>
                  </div>
                  <h1 className="text-3xl font-bold">{challenge.name}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-1">
                    <Trophy size={16} className="text-primary" />
                    {challenge.rounds}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                <div className="flex -space-x-3">
                  {challenge.participants.map((p, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#16161a] bg-gray-800 flex items-center justify-center overflow-hidden">
                      <User size={20} className="text-gray-400" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[#16161a] bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    +{Math.max(0, 10 - challenge.participants.length)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users size={16} />
                  <span>{challenge.participants.length} Active Participants</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Chat */}
        <div className="flex flex-col h-[600px] lg:h-auto max-h-[calc(100vh-160px)]">
          <div className="bg-[#16161a] border border-white/5 rounded-3xl flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MessageSquare size={18} />
                </div>
                <h2 className="font-bold">Lobby Chat</h2>
              </div>
              <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length > 0 ? messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0 flex items-center justify-center">
                    <User size={14} className="text-gray-500" />
                  </div>
                  <div className={`max-w-[80%] ${msg.senderId === user?.id ? 'items-end' : ''} flex flex-col`}>
                    <span className="text-[10px] text-gray-500 mb-1">{msg.senderName}</span>
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === user?.id 
                      ? 'bg-primary text-black font-medium' 
                      : 'bg-white/5 text-gray-300'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
                  <MessageSquare size={40} className="mb-4" />
                  <p className="text-sm">Welcome to the lobby! Say hello to your opponents.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:border-primary/50 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
