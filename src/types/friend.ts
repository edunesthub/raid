export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatarUrl?: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: any;
}

export interface Friend {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  addedAt: any;
}
