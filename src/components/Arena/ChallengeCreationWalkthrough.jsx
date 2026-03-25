"use client";

import React, { useState } from "react";
import { Swords, Globe, Lock, Trophy, Gamepad2, Users, CheckCircle2, Copy, Check } from "lucide-react";
import { arenaService } from "@/services/arenaService";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

const GAMES = [
  { id: 'codm', name: 'CODM', icon: '🔫' },
  { id: 'free fire', name: 'Free Fire', icon: '🔥' },
  { id: 'pubg', name: 'PUBG', icon: '🍳' },
  { id: 'valorant', name: 'Valorant', icon: '🛡️' },
  { id: 'fifa', name: 'FIFA / FC24', icon: '⚽' },
];

const ROUNDS = [1, 3, 5];

const ChallengeCreationWalkthrough = ({ onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    game: '',
    name: '',
    rounds: 1,
    visibility: 'Public',
    liveStreamLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdChallenge, setCreatedChallenge] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Auth Error: No user session found');
      return;
    }
    
    console.log('[Arena] Creating challenge with data:', formData);
    setLoading(true);
    
    try {
      const result = await arenaService.createChallenge({
        ...formData,
        creatorId: user.id
      });
      
      console.log('[Arena] Challenge created:', result);
      setCreatedChallenge(result);
      setStep(5);
      
      if (onSuccess) onSuccess(result);
      toast.success('Battle Room Ready!');
    } catch (error) {
      console.error('[Arena] Creation failed:', error);
      toast.error(`Arena Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Challenge code copied!');
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6 bg-[#0f0f10]/80 backdrop-blur-2xl border border-white/5 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-orange-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 md:mb-10 px-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
              step >= i ? 'bg-orange-500 w-[24%] shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/5 w-[20%]'
            }`} />
          ))}
        </div>

        {/* Step 1: Select Game */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Select <span className="text-orange-500">Game</span></h2>
            <p className="text-gray-400 text-[10px] md:text-sm mb-6 md:mb-8 font-medium">Choose your competition.</p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {GAMES.map(game => (
                <button
                  key={game.id}
                  onClick={() => { setFormData({...formData, game: game.name}); handleNext(); }}
                  className={`group p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 md:gap-3 ${
                    formData.game === game.name 
                      ? 'bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-300">{game.icon}</span>
                  <span className={`font-black uppercase tracking-widest text-[9px] md:text-xs ${formData.game === game.name ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{game.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Name & Settings */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Match <span className="text-orange-500">Settings</span></h2>
            <p className="text-gray-400 text-[10px] md:text-sm mb-6 md:mb-8 font-medium">Nail down the details.</p>
            
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-orange-500">Challenge Name</label>
                <input 
                  type="text"
                  placeholder="e.g. 1v1 Midnight Slayer"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-sm md:text-white font-bold focus:border-orange-500/50 outline-none transition-colors placeholder:text-gray-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-orange-500">Rounds (Best of)</label>
                <div className="flex gap-3">
                  {ROUNDS.map(r => (
                    <button
                      key={r}
                      onClick={() => setFormData({...formData, rounds: r})}
                      className={`flex-1 py-3 md:py-4 rounded-lg md:rounded-xl font-black border transition-all text-xs ${
                        formData.rounds === r 
                          ? 'bg-orange-500 border-orange-400 text-white' 
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      {r} {r === 1 ? 'Round' : 'Rds'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-colors">Back</button>
                <button 
                  onClick={handleNext} 
                  disabled={!formData.name}
                  className="flex-[2] py-4 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Visibility */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Crowd or <span className="text-orange-500">Private</span></h2>
            <p className="text-gray-400 text-[10px] md:text-sm mb-6 md:mb-8 font-medium">Who can see this match?</p>
            
            <div className="space-y-3 mb-6 md:mb-8">
              <button
                onClick={() => setFormData({...formData, visibility: 'Public'})}
                className={`w-full p-4 md:p-6 rounded-2xl border transition-all text-left flex items-center gap-4 md:gap-6 ${
                  formData.visibility === 'Public' 
                    ? 'bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${formData.visibility === 'Public' ? 'bg-white/20' : 'bg-white/5'}`}>
                  <Globe className={formData.visibility === 'Public' ? 'text-white' : 'text-gray-400'} size={20} />
                </div>
                <div>
                  <h3 className={`font-black uppercase tracking-tighter text-base md:text-lg ${formData.visibility === 'Public' ? 'text-white' : 'text-white'}`}>Public Arena</h3>
                  <p className={`text-[10px] md:text-xs ${formData.visibility === 'Public' ? 'text-white/70' : 'text-gray-500'}`}>Listed in the hub.</p>
                </div>
              </button>

              <button
                onClick={() => setFormData({...formData, visibility: 'Private'})}
                className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center gap-6 ${
                  formData.visibility === 'Private' 
                    ? 'bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.visibility === 'Private' ? 'bg-white/20' : 'bg-white/5'}`}>
                  <Lock className={formData.visibility === 'Private' ? 'text-white' : 'text-gray-400'} />
                </div>
                <div>
                  <h3 className={`font-black uppercase tracking-tighter text-lg ${formData.visibility === 'Private' ? 'text-white' : 'text-white'}`}>Private Match</h3>
                  <p className={`text-xs ${formData.visibility === 'Private' ? 'text-white/70' : 'text-gray-500'}`}>Hidden. Generate a code to invite friends.</p>
                </div>
              </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-colors">Back</button>
              <button onClick={handleNext} className="flex-[2] py-4 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-orange-500/20">Finalize</button>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Ready to <span className="text-orange-500">Launch?</span></h2>
            <p className="text-gray-400 text-[10px] md:text-sm mb-6 md:mb-8 font-medium">Review your challenge details.</p>
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Game</span>
                <span className="text-white font-black">{formData.game}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Name</span>
                <span className="text-white font-black">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Rounds</span>
                <span className="text-white font-black">Best of {formData.rounds}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Visibility</span>
                <span className="text-white font-black">{formData.visibility}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-colors">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-[2] py-4 bg-green-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : <>Launch Challenge <Swords size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success & Code */}
        {step === 5 && (
          <div className="animate-in zoom-in duration-500 text-center py-6">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Challenge <span className="text-orange-500">Live!</span></h2>
            <p className="text-gray-400 text-sm mb-10 font-medium">Your arena is ready for battle. Share the code with your opponent.</p>
            
            {createdChallenge?.code && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/30">Challenge Code</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-6xl font-black text-white tracking-[0.2em]">{createdChallenge.code}</span>
                  <button 
                    onClick={() => copyToClipboard(createdChallenge.code)}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-400 font-black uppercase text-[10px] tracking-widest transition-colors"
                  >
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link 
                href={`/arena/${createdChallenge?.id}`}
                className="w-full py-4 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all"
              >
                Enter Room
              </Link>
              <button 
                onClick={() => setStep(1)}
                className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCreationWalkthrough;
