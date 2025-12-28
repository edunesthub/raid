// src/components/AvatarUploader.jsx
'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export default function AvatarUploader({ userId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      // Create form data
      const fd = new FormData();
      fd.append('avatar', file);

      const res = await apiFetch(`/profile/${userId}/avatar`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Upload failed');
      }

      await onUploadSuccess?.();
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      // reset input value (so same file can be re-selected)
      (e.target).value = '';
    }
  };

  return (
    <div className="mt-3">
      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-sm">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {uploading ? 'Uploading...' : 'Change avatar'}
      </label>
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </div>
  );
}