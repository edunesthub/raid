'use client';

import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function MatchResultSubmission({ tournamentId, tournamentName, onClose, onSubmitted }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    score: '',
    opponentScore: '',
    notes: '',
  });
  const [screenshots, setScreenshots] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate total number of screenshots (max 3)
    if (screenshots.length + files.length > 3) {
      alert('You can upload maximum 3 screenshots');
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Store files
    setScreenshots(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'raid_results'); // Create this preset in Cloudinary
    formData.append('folder', 'match_results');

    const cloudName = 'drgz6qqo5'; // Replace with your Cloudinary cloud name
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

// Score fields are optional now — no validation required


    if (screenshots.length === 0) {
      alert('Please upload at least one screenshot as proof');
      return;
    }

    setUploading(true);

    try {
      // Upload all screenshots
      const uploadedUrls = [];
      for (let i = 0; i < screenshots.length; i++) {
        setUploadProgress(((i + 1) / screenshots.length) * 100);
        const url = await uploadImageToCloudinary(screenshots[i]);
        uploadedUrls.push(url);
      }

      // Submit result to Firestore
      await addDoc(collection(db, 'match_results'), {
        tournamentId,
        tournamentName,
        userId: user.id,
        username: user.username || user.email,
userScore: form.score ? Number(form.score) : null,
        opponentScore: form.opponentScore ? Number(form.opponentScore) : null,
        notes: form.notes || '',
        screenshots: uploadedUrls,
        status: 'pending', // pending, verified, rejected
        submittedAt: serverTimestamp(),
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null,
      });

      alert('Results submitted successfully! Waiting for admin verification.');
      onSubmitted?.();
      onClose();
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Failed to submit results: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Submit Match Results</h3>
            <p className="text-gray-400 text-sm mt-1">{tournamentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">


          {/* Screenshot Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Match Screenshots * (Max 3)
            </label>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {screenshots.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-orange-400"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">
                  {screenshots.length === 0 ? 'Upload Screenshots' : 'Add More Screenshots'}
                </span>
                <span className="text-xs mt-1">
                  {screenshots.length}/3 uploaded
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Score Input (Optional) */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Your Score (optional)
    </label>
    <input
      type="number"
      value={form.score}
      onChange={(e) => setForm({ ...form, score: e.target.value })}
      placeholder="e.g., 15"
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Opponent Score (optional)
    </label>
    <input
      type="number"
      value={form.opponentScore}
      onChange={(e) => setForm({ ...form, opponentScore: e.target.value })}
      placeholder="e.g., 10"
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500"
    />
  </div>
</div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional information about the match..."
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Uploading screenshots...</span>
                <span className="text-sm font-bold text-orange-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Upload clear screenshots showing the final score. An admin will verify your results before they are officially recorded.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || screenshots.length === 0}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Results
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}