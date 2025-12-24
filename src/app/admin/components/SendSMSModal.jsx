'use client';

import { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { smsService } from '@/services/smsService';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function SendSMSModal({ 
  tournament, 
  participantCount, 
  onClose, 
  onSuccess 
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);

  const charLimit = 160;
  const charCount = message.length;
  const isOverLimit = charCount > charLimit;

  // Fetch participants with phone numbers on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setStatus(null);
        
        const participantsList = [];
        const userIds = new Set();

        const participantsRef = collection(db, 'tournament_participants');
        const q = query(participantsRef, where('tournamentId', '==', tournament.id));
        const participantsSnapshot = await getDocs(q);

        participantsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId) {
            userIds.add(data.userId);
          }
        });

        // Fetch user phone numbers
        for (const userId of userIds) {
          try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.phone) {
                participantsList.push({
                  userId,
                  username: userData.username || 'User',
                  phone: userData.phone,
                });
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch user ${userId}:`, e.message);
          }
        }

        setParticipants(participantsList);
        if (participantsList.length === 0) {
          setStatus('warning');
          setStatusMessage('No participants with phone numbers found');
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        setStatus('error');
        setStatusMessage('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    if (tournament?.id) {
      fetchParticipants();
    }
  }, [tournament]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setStatus('error');
      setStatusMessage('Please enter a message');
      return;
    }

    if (participants.length === 0) {
      setStatus('error');
      setStatusMessage('No participants with phone numbers to send to');
      return;
    }

    try {
      setSending(true);
      setStatus(null);

      // Send SMS with participants list
      const response = await smsService.sendBulkSMS(tournament.id, trimmed, participants);

      if (response.failed > 0 && response.sent === 0) {
        setStatus('error');
        setResult(response);
        setStatusMessage(
          `Failed to send SMS to all ${response.failed} contact${response.failed !== 1 ? 's' : ''}. Check error details.`
        );
      } else if (response.failed > 0) {
        setStatus('warning');
        setResult(response);
        setStatusMessage(
          `Partially sent: ${response.sent} succeeded, ${response.failed} failed.`
        );
      } else {
        setStatus('success');
        setResult(response);
        setStatusMessage(
          `SMS sent successfully to ${response.sent} contact${response.sent !== 1 ? 's' : ''}!`
        );
      }

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(error.message || 'Failed to send SMS');
      console.error('Send SMS error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Send SMS</h2>
            <p className="text-orange-100 text-sm">{tournament.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-black/20 p-2 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Recipients Info */}
          <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Recipients Ready</p>
            <p className="text-lg font-semibold text-white">
              {participants.length} contact{participants.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Phone Numbers Section */}
          {!loading && participants.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Phone size={14} />
                  View Phone Numbers
                </span>
                <span className="text-xs">
                  {showNumbers ? '▼' : '▶'}
                </span>
              </button>
              
              {showNumbers && (
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {participants.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm pb-2 border-b border-gray-700/50 last:border-b-0 last:pb-0"
                      >
                        <span className="text-gray-300">{p.username}</span>
                        <span className="text-cyan-400 font-mono text-xs">{p.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm animate-pulse">Loading participants...</p>
            </div>
          )}

          {/* Message Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-300">Message</label>
              <span
                className={`text-xs font-medium ${
                  isOverLimit ? 'text-red-400' : 'text-gray-400'
                }`}
              >
                {charCount}/{charLimit}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message (max 160 characters)..."
              maxLength={charLimit}
              disabled={sending}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-20 disabled:opacity-50"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Messages will be sent to {participants.length} verified phone number{participants.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex gap-2">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-300">
                <p className="font-semibold">{statusMessage}</p>
                {result?.errors && result.errors.length > 0 && (
                  <p className="text-xs mt-1 text-green-400/80">
                    Failed: {result.errors.map((e) => e.phone).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'warning' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex gap-2">
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-300">
                <p className="font-semibold">{statusMessage}</p>
                {result?.errors && result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.map((e, idx) => (
                      <div key={idx} className="text-[10px] text-yellow-400/80">
                        {e.username}: {e.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                <p className="font-semibold">{statusMessage}</p>
                {result?.errors && result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.map((e, idx) => (
                      <div key={idx} className="text-[10px] text-red-400/80">
                        {e.username}: {e.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || status === 'success' || participants.length === 0 || loading}
            className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {sending ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}
