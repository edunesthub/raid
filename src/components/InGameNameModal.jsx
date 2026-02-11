'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function InGameNameModal({ isOpen, defaultValue = '', defaultPartnerValue = '', onClose, onSave, isDuo = false }) {
  const [value, setValue] = useState(defaultValue || '');
  const [partnerValue, setPartnerValue] = useState(defaultPartnerValue || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(defaultValue || '');
    setPartnerValue(defaultPartnerValue || '');
    setError('');
  }, [defaultValue, defaultPartnerValue, isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const trimmed = value.trim();
    const partnerTrimmed = partnerValue.trim();

    if (!trimmed) {
      setError('Please enter your in-game name');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 32) {
      setError('In-game name should be between 2 and 32 characters');
      return;
    }

    if (isDuo) {
      if (!partnerTrimmed) {
        setError("Please enter your partner's in-game name");
        return;
      }
      if (partnerTrimmed.length < 2 || partnerTrimmed.length > 32) {
        setError("Partner's in-game name should be between 2 and 32 characters");
        return;
      }
    }

    try {
      setSaving(true);
      setError('');
      if (isDuo) {
        await onSave(trimmed, partnerTrimmed);
      } else {
        await onSave(trimmed);
      }
      onClose?.();
    } catch (e) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-lg">
            {isDuo ? 'Enter Duo Details' : 'Add Your In-Game Name'}
          </h3>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-gray-400 text-sm">
            {isDuo
              ? "Tell us your IGN and your partner's IGN so we can pair you up."
              : "This helps opponents and admins identify you during the tournament."}
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">My IGN</label>
            <input
              type="text"
              placeholder="e.g., GhostRider#1234"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-500"
            />
          </div>

          {isDuo && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Partner's IGN</label>
              <input
                type="text"
                placeholder="e.g., Shadow#9999"
                value={partnerValue}
                onChange={(e) => setPartnerValue(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-500"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Confirm Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
