export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  role: 'user' | 'admin' | 'organizer';
  createdAt: any;
  updatedAt?: any;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}