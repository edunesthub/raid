import { useState, useEffect } from 'react';
import { Trophy, User, Clock, CheckCircle } from 'lucide-react';
import { tournamentService } from '@/services/tournamentService';
import MatchPosterModal from './MatchPosterModal';

export default function TournamentBracket({ tournamentId }) {
  const [bracket, setBracket] = useState({});
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    loadBracket();
  }, [tournamentId]);

  const loadBracket = async () => {
    try {
      setLoading(true);
      const [bracketData, tournamentData] = await Promise.all([
        tournamentService.getTournamentBracket(tournamentId),
        tournamentService.getTournamentById(tournamentId)
      ]);
      setBracket(bracketData);
      setTournament(tournamentData);
    } catch (error) {
      console.error('Error loading bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoundName = (roundNumber) => {
    if (!tournament) return `Round ${roundNumber}`;

    const totalRounds = tournament.totalRounds;
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
      <div
        onClick={() => {
          if (tournament?.participant_type !== 'Team') return;
          setSelectedMatch(match);
          setShowPosterModal(true);
        }}
        className={`bg-gray-800 border-2 rounded-xl p-4 mb-4 transition-all ${tournament?.participant_type === 'Team' ? 'cursor-pointer hover:border-orange-500 hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'} ${isCompleted ? 'border-green-500/50' : 'border-gray-700'
          }`}
      >
        {/* Match Header */}
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
        <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${isCompleted && match.winnerId === match.player1Id
          ? 'bg-green-500/20 border border-green-500/40'
          : 'bg-gray-700/50'
          }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-400">
              {match.player1?.avatarUrl ? (
                <img src={match.player1.avatarUrl} alt={match.player1.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-white font-medium text-sm">
              {match.player1?.username || 'Player 1'}
            </span>
          </div>
          {isCompleted && (
            <span className="text-white font-bold text-lg">
              {match.player1Score}
            </span>
          )}
        </div>

        {/* VS or Bye */}
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
            <div className={`flex items-center justify-between p-3 rounded-lg ${isCompleted && match.winnerId === match.player2Id
              ? 'bg-green-500/20 border border-green-500/40'
              : 'bg-gray-700/50'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-400">
                  {match.player2?.avatarUrl ? (
                    <img src={match.player2.avatarUrl} alt={match.player2.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-white font-medium text-sm">
                  {match.player2?.username || 'Player 2'}
                </span>
              </div>
              {isCompleted && (
                <span className="text-white font-bold text-lg">
                  {match.player2Score}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="w-full">
      {/* Tournament Status */}
      {tournament && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-500" />
              Tournament Bracket
            </h2>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Current Round</p>
              <p className="text-white font-bold text-lg">
                {getRoundName(tournament.currentRound)}
              </p>
            </div>
          </div>

          {tournament.status === 'completed' && tournament.winnerId && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Tournament Complete!</p>
                <p className="text-gray-300 text-sm">Winner will be announced shortly</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bracket Rounds */}
      <div className="space-y-8">
        {rounds.map(round => (
          <div key={round}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-white">
                {getRoundName(parseInt(round))}
              </h3>
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-400 text-sm">
                {bracket[round].length} {bracket[round].length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bracket[round].map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Mobile Stack */}
            <div className="md:hidden space-y-4">
              {bracket[round].map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rounds.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Bracket Yet</h3>
          <p className="text-gray-400">The tournament bracket will be generated once it starts</p>
        </div>
      )}

      {/* Match Poster Modal */}
      <MatchPosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        match={selectedMatch}
        tournament={tournament}
      />
    </div>
  );
}