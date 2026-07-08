import { useState, useEffect } from 'react';
import { Trophy, User, Clock, CheckCircle } from 'lucide-react';
import { tournamentService } from '@/services/tournamentService';

export default function TournamentGroups({ tournamentId }) {
  const [groupMatches, setGroupMatches] = useState({});
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupData();
  }, [tournamentId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const allMatches = await tournamentService.getTournamentMatches(tournamentId);
      
      const grpMatches = {};
      const grpStandings = {};

      // Filter and group by group name
      const groupOnlyMatches = allMatches.filter(m => m.stage === 'group');

      groupOnlyMatches.forEach(match => {
        const gName = match.groupName || 'Group A';
        if (!grpMatches[gName]) {
          grpMatches[gName] = [];
        }
        grpMatches[gName].push(match);

        // Standings calculation
        if (!grpStandings[gName]) {
          grpStandings[gName] = {};
        }

        [match.player1Id, match.player2Id].forEach(pid => {
          if (pid && !grpStandings[gName][pid]) {
            const playerInfo = pid === match.player1Id ? match.player1 : match.player2;
            grpStandings[gName][pid] = {
              id: pid,
              username: playerInfo?.username || 'Unknown',
              avatarUrl: playerInfo?.avatarUrl || null,
              p: 0,
              w: 0,
              d: 0,
              l: 0,
              gf: 0,
              ga: 0,
              gd: 0,
              pts: 0
            };
          }
        });

        const p1 = grpStandings[gName][match.player1Id];
        const p2 = grpStandings[gName][match.player2Id];

        if (match.status === 'completed' && p1 && p2) {
          p1.p += 1;
          p2.p += 1;
          p1.gf += match.player1Score || 0;
          p1.ga += match.player2Score || 0;
          p2.gf += match.player2Score || 0;
          p2.ga += match.player1Score || 0;
          p1.gd = p1.gf - p1.ga;
          p2.gd = p2.gf - p2.ga;

          if (match.player1Score > match.player2Score) {
            p1.pts += 3;
            p1.w += 1;
            p2.l += 1;
          } else if (match.player1Score < match.player2Score) {
            p2.pts += 3;
            p2.w += 1;
            p1.l += 1;
          } else {
            p1.pts += 1;
            p2.pts += 1;
            p1.d += 1;
            p2.d += 1;
          }
        }
      });

      // Sort group standings
      const sortedStandings = {};
      Object.keys(grpStandings).forEach(gName => {
        const sorted = Object.values(grpStandings[gName]).sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });
        sortedStandings[gName] = sorted;
      });

      setGroupMatches(grpMatches);
      setStandings(sortedStandings);
    } catch (error) {
      console.error('Error loading group stage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const groupNames = Object.keys(groupMatches).sort();

  if (groupNames.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-white/5 p-6">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Group Stage Pending</h3>
        <p className="text-gray-400">Groups will be generated when the tournament goes live.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {groupNames.map(gName => (
        <div key={gName} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Standings Table */}
          <div className="lg:col-span-2 bg-[#0d0d0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
              <span className="w-2.5 h-6 bg-orange-500 rounded"></span>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">{gName} Standings</h4>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-black/20 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5">
                    <th className="py-3 px-4 text-center w-12">Pos</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4 text-center w-12">P</th>
                    <th className="py-3 px-4 text-center w-12">W</th>
                    <th className="py-3 px-4 text-center w-12">D</th>
                    <th className="py-3 px-4 text-center w-12">L</th>
                    <th className="py-3 px-4 text-center w-16">GD</th>
                    <th className="py-3 px-4 text-center w-16 text-orange-500">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {(standings[gName] || []).map((player, idx) => {
                    const isAdvancing = idx < 2; // Top 2 advance
                    return (
                      <tr key={player.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3.5 px-4 text-center font-black text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                            isAdvancing 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'text-gray-500'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-400 border border-white/10 flex-shrink-0">
                              {player.avatarUrl ? (
                                <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4.5 h-4.5 text-white" />
                              )}
                            </div>
                            <span className="text-white font-bold text-sm truncate">{player.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-gray-300">{player.p}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-gray-300">{player.w}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-gray-300">{player.d}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-gray-300">{player.l}</td>
                        <td className={`py-3.5 px-4 text-center text-sm font-black ${
                          player.gd > 0 ? 'text-green-400' : player.gd < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {player.gd > 0 ? `+${player.gd}` : player.gd}
                        </td>
                        <td className="py-3.5 px-4 text-center text-sm font-black text-orange-400">{player.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Group Fixtures */}
          <div className="bg-[#0d0d0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 space-y-4">
            <h4 className="text-base font-black text-gray-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Fixtures
            </h4>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(groupMatches[gName] || []).map(match => {
                const isCompleted = match.status === 'completed';
                return (
                  <div key={match.id} className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 space-y-2.5 hover:border-white/10 transition-colors">
                    {/* Players Pair */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isCompleted && match.winnerId === match.player1Id ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                          {match.player1?.username || 'Player 1'}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-black text-white">{match.player1Score}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isCompleted && match.winnerId === match.player2Id ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                          {match.player2?.username || 'Player 2'}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-black text-white">{match.player2Score}</span>
                        )}
                      </div>
                    </div>
                    {/* Match Status Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] text-[9px] font-black uppercase tracking-wider">
                      <span className="text-gray-500">Match {match.matchNumber}</span>
                      {isCompleted ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-yellow-500 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Live/Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
