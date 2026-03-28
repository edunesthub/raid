"use client";

import React, { useState, useEffect } from "react";
import { 
  Swords, 
  Send, 
  Users, 
  Shield, 
  Youtube, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Zap, 
  Skull, 
  Flame,
  ChevronLeft
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { arenaService } from "@/services/arenaService";
import { chatService } from "@/services/chatService"; 
import { userService } from "@/services/userService";
import { useAuth } from "@/app/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function ChallengeRoomPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    let unsubscribe;

    const setupChallenge = async () => {
      setLoading(true);
      try {
        // Automatically join the challenge if not already a participant
        const challengeData = await arenaService.joinChallenge(user.uid, id);
        setChallenge(challengeData);

        // Subscribe to real-time updates
        unsubscribe = arenaService.subscribeToChallenge(id, (updatedChallenge) => {
          if (updatedChallenge) {
            setChallenge(updatedChallenge);
          }
        });
      } catch (error) {
        console.error("Error setting up challenge:", error);
        toast.error(error.message || "Failed to join arena");
      } finally {
        setLoading(false);
      }
    };

    setupChallenge();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, user]);

  useEffect(() => {
    if (challenge?.participants?.length > 0) {
      const fetchParticipants = async () => {
        try {
          const profiles = await userService.getUsersByIds(challenge.participants);
          // Ensure we preserve the order of participants as they joined
          const orderedProfiles = challenge.participants.map(uid => 
            profiles.find(p => p.id === uid)
          ).filter(Boolean);
          setParticipants(orderedProfiles);
        } catch (error) {
          console.error("Error fetching participants:", error);
        }
      };
      fetchParticipants();
    }
  }, [challenge?.participants]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: user?.displayName || 'Me', text: newMessage, time: 'Now' }]);
    setNewMessage("");
  };

  const copyCode = () => {
    if (!challenge?.code) return;
    navigator.clipboard.writeText(challenge.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied!");
  };

  if (loading) return <div className="min-h-screen bg-black flex center justify-center items-center"><LoadingSpinner /></div>;
  if (!challenge) return <div className="min-h-screen bg-black flex center justify-center items-center">Arena not found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row h-screen overflow-hidden">
      
      {/* 1. Main View (Stream or Battle Info) */}
      <div className="flex-1 overflow-y-auto lg:h-full p-4 lg:p-8 space-y-8 no-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a1a1d] via-black to-black">
        
        {/* Top Navigation */}
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="text-orange-500" />
            Back
          </button>
        </div>

        {/* Header: Title & Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-orange-500 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                {challenge.status === 'open' ? '🔴 Waiting' : '🔥 Active'}
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{challenge.game}</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">
              {challenge.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
             {challenge.code && (
               <button 
                 onClick={copyCode}
                 className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
               >
                 <span className="text-xs font-black tracking-[0.2em]">{challenge.code}</span>
                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />}
               </button>
             )}
             <button className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-110 transition-transform active:scale-95">
               <Share2 size={16} />
             </button>
          </div>
        </div>

        {/* Battle Arena View */}
        <div className="relative aspect-video w-full max-w-5xl mx-auto bg-[#0f0f10] border border-white/5 rounded-[40px] overflow-hidden group shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)]">
           {/* Mock Stream Placeholder */}
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-20 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-40 scale-110 group-hover:scale-100"></div>
           
           <div className="relative z-10 text-center space-y-4 max-w-md mx-auto p-6 md:p-12 bg-black/60 backdrop-blur-3xl rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center gap-6 md:gap-12">
              {/* Player 1 (Creator) */}
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border-2 md:border-4 border-orange-500 p-1 mb-2 md:mb-4 shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden">
                  <img 
                    src={participants[0]?.avatarUrl || '/assets/avatar-placeholder.png'} 
                    className="w-full h-full object-cover" 
                    alt={participants[0]?.username || 'Player 1'}
                  />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase text-white">
                  {participants[0]?.username?.split(' ')[0] || 'Player 1'}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <span className="text-xl md:text-3xl font-black italic text-orange-500">VS</span>
                <Skull size={20} className="text-gray-700 animate-pulse md:hidden" />
                <Skull size={32} className="text-gray-700 animate-pulse hidden md:block" />
              </div>

              {/* Player 2 (Challenger) */}
              <div className="text-center group-hover:scale-110 transition-transform duration-500 delay-75">
                <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border-2 md:border-4 ${participants[1] ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'border-gray-800'} p-1 mb-2 md:mb-4 bg-gray-900 flex items-center justify-center overflow-hidden`}>
                  {participants[1] ? (
                    <img 
                      src={participants[1]?.avatarUrl || '/assets/avatar-placeholder.png'} 
                      className="w-full h-full object-cover" 
                      alt={participants[1]?.username || 'Player 2'}
                    />
                  ) : (
                    <>
                      <Users size={24} className="text-gray-700 md:hidden" />
                      <Users size={40} className="text-gray-700 hidden md:block" />
                    </>
                  )}
                </div>
                <span className={`text-[10px] md:text-xs font-black uppercase ${participants[1] ? 'text-white' : 'text-gray-500'}`}>
                  {participants[1]?.username?.split(' ')[0] || 'Waiting...'}
                </span>
              </div>
            </div>
            
            <div className="pt-4 md:pt-8">
              <button 
                disabled={challenge.status !== 'active'}
                className={`px-8 md:px-12 py-3 md:py-5 font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-full transition-all shadow-xl ${
                  challenge.status === 'active' 
                  ? 'bg-orange-500 text-white hover:bg-white hover:text-black shadow-orange-500/20' 
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                }`}
              >
                {challenge.status === 'active' ? 'START BATTLE' : 'WAITING FOR OPPONENT'}
              </button>
            </div>
           </div>

           {/* Live Label */}
           <div className="absolute top-4 md:top-8 right-4 md:right-8 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 z-20">
             <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full animate-ping"></div>
             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic tracking-tighter">Arena Live</span>
           </div>
        </div>

        {/* Room Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 relative z-10 pb-10 md:pb-0">
          <div className="bg-[#0f0f10] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:border-orange-500/20 transition-all flex flex-col gap-1 md:gap-2">
            <span className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-widest">Rounds</span>
            <span className="text-sm md:text-2xl font-black text-white italic uppercase tracking-tighter">B.O.{challenge.rounds}</span>
          </div>
          <div className="bg-[#0f0f10] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:border-orange-500/20 transition-all flex flex-col gap-1 md:gap-2">
            <span className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-widest">Rewards</span>
            <span className="text-sm md:text-2xl font-black text-orange-500 italic uppercase tracking-tighter flex items-center gap-1">XP <Zap size={14} fill="currentColor" /></span>
          </div>
          <div className="bg-[#0f0f10] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:border-orange-500/20 transition-all flex flex-col gap-1 md:gap-2 col-span-2 md:col-span-1">
            <span className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-widest">Visibility</span>
            <span className="text-sm md:text-2xl font-black text-white italic uppercase tracking-tighter">{challenge.visibility?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* 2. Sidebar Chat */}
      <div className="w-full lg:w-96 bg-[#0f0f10]/95 backdrop-blur-3xl border-l border-white/5 flex flex-col h-[50dvh] lg:h-full relative overflow-hidden">
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
         
         <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
            <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <MessageSquare size={20} className="text-orange-500" />
              Arena Chat
            </h3>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2 py-1 bg-white/5 rounded-lg flex items-center gap-1.5">
              <Users size={12} /> {challenge.currentParticipants}
            </span>
         </div>

         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative z-10">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'System' ? 'items-center opacity-40' : ''}`}>
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#555]">{msg.time}</span>
                   <span className={`text-[11px] font-black italic uppercase tracking-tighter ${msg.sender === 'System' ? 'text-white' : 'text-orange-500'}`}>
                     {msg.sender === 'Me' ? 'You' : msg.sender}
                   </span>
                 </div>
                 <div className={`text-xs font-medium px-4 py-2.5 rounded-2xl rounded-tl-none border ${
                    msg.sender === 'System' ? 'bg-transparent border-white/10 italic text-center text-[10px]' : 'bg-white/5 border-white/10 text-white'
                 }`}>
                   {msg.text}
                 </div>
              </div>
            ))}
         </div>

         {/* Chat Input */}
         <div className="p-6 bg-black/40 border-t border-white/5 relative z-10">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                 type="text" 
                 placeholder="Type your message..."
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="w-full bg-[#151516] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-xs font-medium focus:border-orange-500/50 outline-none transition-all placeholder:text-gray-700 shadow-2xl"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
         </div>
      </div>
    </div>
  );
}
