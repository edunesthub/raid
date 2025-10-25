import { defaultGames } from '@/data/defaultClans';

const generateMockLeagues = () => {
  const leagues = [];
  const statuses = ['upcoming', 'active', 'completed'];

  defaultGames.forEach((game, gameIndex) => {
    for (let i = 0; i < 2; i++) { // Generate 2 leagues per game
      const status = statuses[(gameIndex * 2 + i) % statuses.length];
      const startDate = new Date(Date.now() + (gameIndex * 30 + i * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date(Date.now() + (gameIndex * 30 + i * 15 + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      leagues.push({
        id: `league-${game.gameId}-${i + 1}`,
        name: `${game.name} League Season ${i + 1}`,
        description: `Compete in the ${game.name} League Season ${i + 1}.`,
        gameId: game.gameId,
        gameName: game.name,
        startDate,
        endDate,
        status,
        participants: [],
        maxParticipants: 50 + i * 10,
        entryFee: 5 + i * 2,
        reward: `Cash Prize + ${game.name} Skins`,
      });
    }
  });
  return leagues;
};

const mockLeagues = generateMockLeagues();

export const leagueService = {
  async getAllLeagues() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLeagues), 500);
    });
  },

  async getLeagueById(id) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLeagues.find((league) => league.id === id)), 500);
    });
  },

  async joinLeague(leagueId, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const league = mockLeagues.find((l) => l.id === leagueId);
        if (league && league.participants.length < league.maxParticipants && !league.participants.includes(userId)) {
          league.participants.push(userId);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  },
};