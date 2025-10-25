'use client';

import { useState } from 'react';

export default function ClanJoin({ clans = [], onJoin }) {
  const [selectedClanId, setSelectedClanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClanId) {
      setError('Please select a clan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onJoin?.(selectedClanId);
      // Success message or redirect
    } catch (err) {
      setError(err.message || 'Failed to join clan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Join a Clan</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="clanId" className="block text-gray-300 mb-2">
            Select Clan
          </label>
          <select
            id="clanId"
            value={selectedClanId}
            onChange={(e) => setSelectedClanId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
          >
            <option value="">Choose a clan...</option>
            {clans.map((clan) => (
              <option key={clan.id} value={clan.id}>
                [{clan.tag}] {clan.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedClanId}
          className={`w-full btn-raid ${
            loading || !selectedClanId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Joining...' : 'Join Clan'}
        </button>
      </form>
    </div>
  );
}