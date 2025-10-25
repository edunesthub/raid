'use client';

import { useState } from 'react';
import { useClan } from '@/hooks/useClan';

export default function ClanManagement({ clan, onUpdate }) {
  const { updateClan, kickMember, transferOwnership, loading, error } = useClan();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: clan.name,
    description: clan.description,
    isPublic: clan.isPublic,
    requirements: clan.requirements || [],
    social: clan.social || {}
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateClan(clan.id, formData);
      setEditMode(false);
      onUpdate?.();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleKickMember = async (memberId) => {
    try {
      await kickMember(clan.id, memberId);
      onUpdate?.();
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Clan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="bg-gray-800 border border-gray-600 rounded"
            />
            <label htmlFor="isPublic" className="text-gray-300">
              Public Clan
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setEditMode(true)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Edit Clan
        </button>
      )}

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-xl font-bold text-white mb-4">Members</h3>
        <div className="space-y-2">
          {clan.members.map((memberId) => (
            <div key={memberId} className="flex items-center justify-between">
              <span className="text-gray-300">{memberId}</span>
              {clan.ownerId !== memberId && (
                <button
                  onClick={() => handleKickMember(memberId)}
                  disabled={loading}
                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm"
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {clan.ownerId === clan.members[0] && (
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Danger Zone</h3>
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            onClick={() => {/* Implement delete clan */}}
          >
            Delete Clan
          </button>
        </div>
      )}
    </div>
  );
}