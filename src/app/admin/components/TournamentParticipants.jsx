// Create this file at: src/app/admin/components/TournamentParticipants.jsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Mail, Phone, Calendar, X, Loader } from 'lucide-react';

export default function TournamentParticipants({ tournamentId, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      loadParticipants();
    }
  }, [tournamentId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get participant records
      const participantsQuery = query(
        collection(db, 'tournament_participants'),
        where('tournamentId', '==', tournamentId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);

      // Get user details for each participant
      const participantData = await Promise.all(
        participantsSnapshot.docs.map(async (participantDoc) => {
          const data = participantDoc.data();
          const userId = data.userId;

          // Fetch user profile
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            id: participantDoc.id,
            userId,
            username: userData.username || 'Unknown',
            email: userData.email || 'N/A',
            contact: userData.contact || 'N/A',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            avatarUrl: userData.avatarUrl || null,
            joinedAt: data.joinedAt,
            status: data.status || 'active',
            paymentStatus: data.paymentStatus || 'pending',
          };
        })
      );

      setParticipants(participantData);
    } catch (err) {
      console.error('Error loading participants:', err);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      withdrawn: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Withdrawn' },
      disqualified: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Disqualified' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const config = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
      paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
      refunded: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Refunded' },
    };

    const paymentConfig = config[paymentStatus] || config.pending;
    return (
      <span className={`${paymentConfig.bg} ${paymentConfig.text} px-2 py-1 rounded-full text-xs font-medium`}>
        {paymentConfig.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Tournament Participants</h3>
              <p className="text-gray-400 text-sm">
                {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-400">Loading participants...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadParticipants}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">No Participants Yet</h4>
              <p className="text-gray-400">No one has joined this tournament yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="text-left p-4 rounded-tl-xl">Participant</th>
                      <th className="text-left p-4">Contact</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4 rounded-tr-xl">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr
                        key={participant.id}
                        className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${
                          index === participants.length - 1 ? 'last:rounded-b-xl' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center flex-shrink-0">
                              {participant.avatarUrl ? (
                                <img
                                  src={participant.avatarUrl}
                                  alt={participant.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {participant.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{participant.username}</p>
                              <p className="text-gray-400 text-xs">
                                {participant.firstName} {participant.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Mail className="w-4 h-4" />
                              <span className="truncate max-w-[200px]">{participant.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Phone className="w-4 h-4" />
                              <span>{participant.contact}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(participant.joinedAt)}</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(participant.status)}</td>
                        <td className="p-4">{getPaymentBadge(participant.paymentStatus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center flex-shrink-0">
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={participant.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {participant.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{participant.username}</p>
                        <p className="text-gray-400 text-sm truncate">
                          {participant.firstName} {participant.lastName}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(participant.status)}
                        {getPaymentBadge(participant.paymentStatus)}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{participant.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{participant.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(participant.joinedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}