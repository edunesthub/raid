import { ChallengeGame } from "./challenge";

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'registration-open' | 'live';

export interface Tournament {
  id: string;
  name: string;
  title?: string; // Some parts of the app use title instead of name
  game: string;
  entry_fee: number;
  prize_pool: number;
  first_place: number;
  second_place: number;
  third_place: number;
  max_participants: number;
  participants_count: number;
  start_date: string;
  status: TournamentStatus;
  winner_id?: string;
  winnerId?: string;
  winner_name?: string;
  organizer?: string;
  rules?: string;
  statsUpdated?: boolean;
  participants?: any[];
  isUserParticipant?: boolean;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  username: string;
  joinedAt: any;
  placement?: number;
  xpGained?: number;
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  rounds: TournamentRound[];
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  score1?: number;
  score2?: number;
  status: 'pending' | 'ready' | 'ongoing' | 'completed';
}