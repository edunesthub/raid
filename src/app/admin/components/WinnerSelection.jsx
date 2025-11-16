// src/app/admin/components/WinnerSelection.jsx
'use client';

import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, X, Search, Check, Loader } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function WinnerSelection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [placements, setPlacements] = useState({
    first: null,
    second: null,
    third: null
  });

  useEffect(() => {
    loadCompletableTournaments();
  }, []);

  const loadCompletableTournaments = async () => {
    try {
      setLoading(true);
      // Get live tournaments or tournaments ready to complete
      const q = query(
        collection(db, 'tournaments'),
        where('status', 'in', ['live', 'upcoming'])
      );

      const snapshot = await getDocs(q);
      const tournamentsList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      setTournaments(tournamentsList);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      alert('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const openTournament = async (tournament) => {
    try {
      setSelectedTournament(tournament);
      
      // Get participants
      const participantsQuery = query(
        collection(db, 'tournament_participants'),
        where('tournamentId', '==', tournament.id),
        where('status', '==', 'active')
      );

      const participantsSnapshot = await getDocs(participantsQuery);
      
      // Get user details for each participant
      const participantsList = await Promise.all(
        participantsSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          return {
            id: data.userId,
            username: userData.username || 'Unknown',
            avatarUrl: userData.avatarUrl || null,
            email: userData.email || ''
          };
        })
      );

      setParticipants(participantsList);
      setPlacements({ first: null, second: null, third: null });
      setShowModal(true);
    } catch (error) {
      console.error('Error loading participants:', error);
      alert('Failed to load participants');
    }
  };

  const handleSelectWinner = (placement, participantId) => {
    const currentPlacements = { ...placements };
    
    // Remove this participant from other placements
    Object.keys(currentPlacements).forEach(key => {
      if (currentPlacements[key] === participantId && key !== placement) {
        currentPlacements[key] = null;
      }
    });

    // Set new placement
    currentPlacements[placement] = participantId;
    setPlacements(currentPlacements);
  };

  const submitWinners = async () => {
    if (!placements.first) {
      alert('Please select at least a 1st place winner');
      return;
    }

    if (!confirm('Confirm tournament winners? This will complete the tournament and cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);

      const tournamentRef = doc(db, 'tournaments', selectedTournament.id);
      
      // Update tournament with winners
      await updateDoc(tournamentRef, {
        status: 'completed',
        winnerId: placements.first,
        secondPlaceId: placements.second || null,
        thirdPlaceId: placements.third || null,
        completedAt: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Update participant records with placement
      const updates = [];
      
      if (placements.first) {
        const firstDoc = doc(db, 'tournament_participants', `${selectedTournament.id}_${placements.first}`);
        updates.push(updateDoc(firstDoc, { 
          placement: 1, 
          placementAt: serverTimestamp() 
        }));
      }
      
      if (placements.second) {
        const secondDoc = doc(db, 'tournament_participants', `${selectedTournament.id}_${placements.second}`);
        updates.push(updateDoc(secondDoc, { 
          placement: 2, 
          placementAt: serverTimestamp() 
        }));
      }
      
      if (placements.third) {
        const thirdDoc = doc(db, 'tournament_participants', `${selectedTournament.id}_${placements.third}`);
        updates.push(updateDoc(thirdDoc, { 
          placement: 3, 
          placementAt: serverTimestamp() 
        }));
      }

      await Promise.all(updates);

      alert('Tournament winners submitted successfully!');
      setShowModal(false);
      loadCompletableTournaments();
    } catch (error) {
      console.error('Error submitting winners:', error);
      alert('Failed to submit winners: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPlacementIcon = (placement) => {
    switch (placement) {
      case 'first':
        return { 
          icon: Crown, 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/20', 
          border: 'border-yellow-500/40',
          label: '1st Place'
        };
      case 'second':
        return { 
          icon: Medal, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/20', 
          border: 'border-gray-500/40',
          label: '2nd Place'
        };
      case 'third':
        return { 
          icon: Medal, 
          color: 'text-orange-400', 
          bg: 'bg-orange-500/20', 
          border: 'border-orange-500/40',
          label: '3rd Place'
        };
      default:
        return { 
          icon: Award, 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/20', 
          border: 'border-gray-500/40',
          label: 'Unknown'
        };
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Select Tournament Winners
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manually select winners for completed tournaments
          </p>
        </div>
        <button
          onClick={loadCompletableTournaments}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Tournaments Grid */}
      {!loading && tournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map(tournament => (
            <div
              key={tournament.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-orange-500 transition-all cursor-pointer"
              onClick={() => openTournament(tournament)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {tournament.tournament_name}
                  </h3>
                  <p className="text-gray-400 text-sm">{tournament.game}</p>
                </div>
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${
                    tournament.status === 'live' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {tournament.status === 'live' ? 'Live' : 'Upcoming'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white font-semibold">
                    {tournament.current_participants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white font-semibold">
                    {tournament.format || 'Standard'}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                Select Winners
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Tournaments Available
          </h3>
          <p className="text-gray-400">
            There are no tournaments ready for winner selection
          </p>
        </div>
      )}

      {/* Winner Selection Modal */}
      {showModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 sm:p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Select Tournament Winners</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedTournament.tournament_name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Placements Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['first', 'second', 'third'].map(placement => {
                  const config = getPlacementIcon(placement);
                  const Icon = config.icon;
                  const selected = placements[placement];
                  const selectedUser = participants.find(p => p.id === selected);

                  return (
                    <div
                      key={placement}
                      className={`${config.bg} border ${config.border} rounded-xl p-4`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          {config.label}
                        </h4>
                      </div>

                      {selected ? (
                        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-400 flex-shrink-0">
                              {selectedUser?.avatarUrl ? (
                                <img
                                  src={selectedUser.avatarUrl}
                                  alt={selectedUser.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {selectedUser?.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-white text-sm font-medium truncate">
                              {selectedUser?.username}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectWinner(placement, null)}
                            className="p-1 hover:bg-gray-700 rounded flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <span className="text-gray-500 text-sm">Not selected</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm sm:text-base"
                />
              </div>

              {/* Participants List */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Trophy className="w-5 h-5" />
                  All Participants ({filteredParticipants.length})
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredParticipants.map(participant => {
                    const isSelected = Object.values(placements).includes(participant.id);
                    const placement = Object.keys(placements).find(
                      key => placements[key] === participant.id
                    );

                    return (
                      <div
                        key={participant.id}
                        className={`bg-gray-800 border rounded-xl p-3 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-400 flex-shrink-0">
                              {participant.avatarUrl ? (
                                <img
                                  src={participant.avatarUrl}
                                  alt={participant.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {participant.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {participant.username}
                              </p>
                              {isSelected && (
                                <p className="text-orange-400 text-xs font-semibold">
                                  {placement === 'first' ? '🥇 1st' : placement === 'second' ? '🥈 2nd' : '🥉 3rd'}
                                </p>
                              )}
                            </div>
                          </div>

                          {!isSelected && (
                            <div className="flex gap-1 flex-wrap sm:flex-nowrap">
                              <button
                                onClick={() => handleSelectWinner('first', participant.id)}
                                className="flex-1 sm:flex-none px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-xs font-semibold transition-colors"
                              >
                                1st
                              </button>
                              <button
                                onClick={() => handleSelectWinner('second', participant.id)}
                                className="flex-1 sm:flex-none px-2 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded text-xs font-semibold transition-colors"
                              >
                                2nd
                              </button>
                              <button
                                onClick={() => handleSelectWinner('third', participant.id)}
                                className="flex-1 sm:flex-none px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-xs font-semibold transition-colors"
                              >
                                3rd
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitWinners}
                  disabled={submitting || !placements.first}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Tournament
                    </>
                  )}
                </button>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ <strong>Warning:</strong> Completing the tournament is final and cannot be undone. Make sure you've selected the correct winners.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}