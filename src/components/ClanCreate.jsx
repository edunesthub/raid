'use client';

import { useState } from 'react';
import { useClan } from '@/hooks/useClan';
import { defaultGames } from '@/data/defaultClans';

export default function ClanCreate() {
  const { createClan, loading, error } = useClan();
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    gameId: '',
    isPublic: true,
    requirements: [''],
    social: {
      discord: '',
      telegram: '',
      whatsapp: ''
    },
    imageUrl: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newClan = await createClan(formData);
      // Handle success (e.g., redirect to clan page)
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-gray-300 mb-2">Game</label>
        <select
          value={formData.gameId}
          onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
          required
        >
          <option value="">Select a game...</option>
          {defaultGames.map(game => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Clan Image</label>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) {
              setFormData({ ...formData, imageUrl: e.target.files[0] });
            }
          }}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Clan Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
          required
          maxLength={32}
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Clan Tag</label>
        <input
          type="text"
          value={formData.tag}
          onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
          required
          maxLength={4}
          pattern="[A-Za-z]{2,4}"
        />
        <p className="text-gray-400 text-sm mt-1">2-4 letters only</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full btn-raid ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Creating...' : 'Create Clan'}
      </button>
    </form>
  );
}