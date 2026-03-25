export type ChallengeGame = 'CODM' | 'Free Fire' | 'PUBG' | 'eFootball' | string;
export type ChallengeVisibility = 'public' | 'private';
export type ChallengeRound = '1' | 'bo3' | '5';
export type ChallengeStatus = 'waiting' | 'live' | 'completed';

export interface Challenge {
  id: string;
  name: string;
  game: ChallengeGame;
  rounds: ChallengeRound;
  visibility: ChallengeVisibility;
  code: string;           // 6-char alphanumeric join code
  creatorId: string;
  creatorUsername: string;
  participants: string[]; // user IDs
  status: ChallengeStatus;
  streamUrl?: string;     // optional Twitch/YouTube URL
  createdAt: any;
  updatedAt?: any;
}
