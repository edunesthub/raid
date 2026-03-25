export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  leaderId: string;
  members: string[]; // user IDs
  avatarUrl?: string;
  createdAt: any;
}

export interface ClanMember {
  userId: string;
  username: string;
  role: 'leader' | 'admin' | 'member';
  joinedAt: any;
}

export interface League {
  id: string;
  name: string;
  game: string;
  description: string;
  status: 'active' | 'finished';
  participants: string[];
  createdAt: any;
}