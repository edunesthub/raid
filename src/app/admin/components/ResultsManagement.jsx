// src/app/admin/components/ResultsManagement.jsx
'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, Eye, CheckCircle, Clock, X, Award } from 'lucide-react';
import { tournamentService } from '@/services/tournamentService';

export default function ResultsManagement() {
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [bracket, setBracket] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({ player1: '', player2: '' });

  useEffect(() => {
    loadLiveTournaments();
  }, []);

  const loadLiveTournaments = async () => {
    try {
      setLoading(true);
      const tournaments = await tournamentService.getLiveTournaments();
      setLiveTournaments(tournaments);
    } catch (error) {
      console.error('Error loading live tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTournament = async (tournament) => {
    try {
      setSelectedTournament(tournament);
      const bracketData = await tournamentService.getTournamentBracket(tournament.id);
      setBracket(bracketData);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading bracket:', error);
      alert('Failed to load tournament bracket');
    }
  };

  const openMatchScoreModal = (match) => {
    setSelectedMatch(match);
    setScores({ 
      player1: match.player1Score?.toString() || '', 
      player2: match.player2Score?.toString() || '' 
    });
  };

  const submitMatchResult = async () => {
    if (!selectedMatch) return;

    const p1Score = parseInt(scores.player1);
    const p2Score = parseInt(scores.player2);

    if (isNaN(p1Score) || isNaN(p2Score)) {
      alert('Please enter valid scores');
      return;
    }

    if (p1Score < 0 || p2Score < 0) {
      alert('Scores cannot be negative');
      return;
    }

    if (p1Score === p2Score) {
      alert('Scores cannot be tied. Please determine a winner.');
      return;
    }

    try {
      setSubmitting(true);
      await tournamentService.submitMatchResult(selectedMatch.id, p1Score, p2Score);
      
      // Reload bracket
      const bracketData = await tournamentService.getTournamentBracket(selectedTournament.id);
      setBracket(bracketData);
      
      // Reload tournaments list
      await loadLiveTournaments();
      
      setSelectedMatch(null);
      setScores({ player1: '', player2: '' });
      alert('Match result submitted successfully!');
    } catch (error) {
      console.error('Error submitting result:', error);
      alert(error.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoundName = (roundNumber) => {
    if (!selectedTournament) return `Round ${roundNumber}`;
    
    const totalRounds = selectedTournament.totalRounds;
    const roundsFromEnd = totalRounds - roundNumber;
    
    switch (roundsFromEnd) {
      case 0: return 'Final';
      case 1: return 'Semifinals';
      case 2: return 'Quarterfinals';
      default: return `Round ${roundNumber}`;
    }
  };

  const MatchCard = ({ match }) => {
    const isCompleted = match.status === 'completed';
    const isBye = !match.player2Id;

    return (
      <div className={`bg-gray-800 border-2 rounded-xl p-4 ${
        isCompleted ? 'border-green-500/50' : 'border-orange-500/50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs font-semibold">
            Match {match.matchNumber}
          </span>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Clock className="w-4 h-4 text-yellow-400" />
          )}
        </div>

        {/* Player 1 */}
        <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
          isCompleted && match.winnerId === match.player1Id 
            ? 'bg-green-500/20 border border-green-500/40' 
            : 'bg-gray-700/50'
        }`}>
          <span className="text-white font-medium text-sm">
            {match.player1?.username || 'Player 1'}
          </span>
          {isCompleted && (
            <span className="text-white font-bold text-lg">{match.player1Score}</span>
          )}
        </div>

        {isBye ? (
          <div className="text-center py-2">
            <span className="text-gray-500 text-xs font-semibold">BYE</span>
          </div>
        ) : (
          <>
            <div className="text-center py-1">
              <span className="text-gray-500 text-xs font-bold">VS</span>
            </div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${
              isCompleted && match.winnerId === match.player2Id 
                ? 'bg-green-500/20 border border-green-500/40' 
                : 'bg-gray-700/50'
            }`}>
              <span className="text-white font-medium text-sm">
                {match.player2?.username || 'Player 2'}
              </span>
              {isCompleted && (
                <span className="text-white font-bold text-lg">{match.player2Score}</span>
              )}
            </div>

            {!isCompleted && (
              <button
                onClick={() => openMatchScoreModal(match)}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
              >
                Enter Score
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Results Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">Manage live tournament matches and results</p>
        </div>
        <button
          onClick={loadLiveTournaments}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Live Tournaments Grid */}
      {!loading && liveTournaments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveTournaments.map(tournament => (
            <div
              key={tournament.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-orange-500 transition-all cursor-pointer"
              onClick={() => openTournament(tournament)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{tournament.title}</h3>
                  <p className="text-gray-400 text-sm">{tournament.game}</p>
                </div>
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Round:</span>
                  <span className="text-white font-semibold">
                    {getRoundName(tournament.currentRound)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white font-semibold">
                    {tournament.currentPlayers}/{tournament.maxPlayers}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Bracket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && liveTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Live Tournaments</h3>
          <p className="text-gray-400">There are no active tournaments at the moment</p>
        </div>
      )}

      {/* Bracket Modal */}
      {showModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedTournament.title}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Current Round: {getRoundName(selectedTournament.currentRound)}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Bracket Content */}
            <div className="p-6 space-y-8">
              {Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b)).map(round => (
                <div key={round}>
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-xl font-bold text-white">
                      {getRoundName(parseInt(round))}
                    </h4>
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-400 text-sm">
                      {bracket[round].length} {bracket[round].length === 1 ? 'match' : 'matches'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {bracket[round].map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}

              {selectedTournament.status === 'completed' && (
                <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-6 flex items-center gap-4">
                  <Award className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold text-lg">Tournament Complete!</p>
                    <p className="text-gray-300 text-sm">Winner has been determined</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Score Entry Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Enter Match Score</h3>

            <div className="space-y-4">
              {/* Player 1 Score */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {selectedMatch.player1?.username || 'Player 1'} Score
                </label>
                <input
                  type="number"
                  value={scores.player1}
                  onChange={(e) => setScores({ ...scores, player1: e.target.value })}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>

              {/* Player 2 Score */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {selectedMatch.player2?.username || 'Player 2'} Score
                </label>
                <input
                  type="number"
                  value={scores.player2}
                  onChange={(e) => setScores({ ...scores, player2: e.target.value })}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedMatch(null);
                    setScores({ player1: '', player2: '' });
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitMatchResult}
                  disabled={submitting || !scores.player1 || !scores.player2}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Result'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}