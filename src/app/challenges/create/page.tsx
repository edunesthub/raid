"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Check, Gamepad2, Users, Trophy, Tv, Layout, Globe, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChallenge } from '@/hooks/useChallenge';
import { ChallengeGame, ChallengeRound, ChallengeVisibility } from '@/types/challenge';

export default function CreateChallengePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createChallenge, loading } = useChallenge();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    game: 'CODM' as ChallengeGame,
    name: '',
    rounds: '1' as ChallengeRound,
    visibility: 'public' as ChallengeVisibility,
    streamUrl: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const challenge = await createChallenge({
        ...formData,
        creatorId: user.id,
        creatorUsername: user.username
      });
      router.push(`/challenges/${challenge.code}`);
    } catch (err) {
      alert('Failed to create challenge');
    }
  };

  const games: ChallengeGame[] = ['CODM', 'Free Fire', 'PUBG', 'eFootball', 'Other'];
  const rounds: { label: string, value: ChallengeRound }[] = [
    { label: '1 Round', value: '1' },
    { label: 'Best of 3', value: 'bo3' },
    { label: '5 Rounds', value: '5' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-12 pb-24 px-6">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Create Challenge</h1>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Step 1: Game & Name */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <label className="text-sm text-gray-400 mb-4 block">Select Game</label>
              <div className="grid grid-cols-2 gap-4">
                {games.map(g => (
                  <button
                    key={g}
                    onClick={() => setFormData(prev => ({ ...prev, game: g }))}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                      formData.game === g ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Gamepad2 size={24} />
                    <span className="font-bold text-sm">{g}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Match Name</label>
              <input
                type="text"
                placeholder="e.g. Sunday Night Showdown"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-primary outline-none transition-all"
              />
            </div>

            <button
              disabled={!formData.name}
              onClick={nextStep}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <label className="text-sm text-gray-400 mb-4 block">Match Settings (Rounds)</label>
              <div className="space-y-3">
                {rounds.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setFormData(prev => ({ ...prev, rounds: r.value }))}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                      formData.rounds === r.value ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="font-bold">{r.label}</span>
                    {formData.rounds === r.value && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-4 block">Visibility</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    formData.visibility === 'public' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Globe size={20} />
                  <span className="font-bold text-xs uppercase tracking-wider">Public</span>
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    formData.visibility === 'private' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Lock size={20} />
                  <span className="font-bold text-xs uppercase tracking-wider">Private</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-all">Back</button>
              <button onClick={nextStep} className="flex-1 bg-primary text-black font-bold py-4 rounded-xl transition-all">Continue</button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Game</span>
                <span className="font-bold text-primary">{formData.game}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Match Name</span>
                <span className="font-bold">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Settings</span>
                <span className="font-bold">{formData.rounds}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Visibility</span>
                <span className="font-bold capitalize">{formData.visibility}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block font-bold flex items-center gap-2">
                <Tv size={16} />
                Live Stream URL (Optional)
              </label>
              <input
                type="url"
                placeholder="Twitch or YouTube link"
                value={formData.streamUrl}
                onChange={e => setFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-all">Back</button>
              <button 
                onClick={handleSubmit} 
                className="flex-1 bg-primary text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Generating Room...' : 'Finalize & Join Room'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
