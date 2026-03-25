export interface UserStats {
  userId: string;
  xp: number;
  level: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  totalEarnings: number;
  winRate: number;
  currentStreak: number;
  bestPlacement: number | null;
  placements: {
    first: number;
    second: number;
    third: number;
  };
  lastUpdated: any;
  lastRecalculated?: string;
}

export interface MatchHistoryEntry {
  id: string;
  tournamentId: string;
  tournamentName: string;
  game: string;
  placement?: number;
  status: string;
  date: string;
  xpGained: number;
  prize: number;
}
