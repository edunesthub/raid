// src/hooks/useFriend.ts
import { useState, useCallback } from 'react';
import { friendService } from '@/services/friendService';
import { Friend, FriendRequest } from '@/types/friend';

export function useFriend() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (fromUserId: string, fromUsername: string, toUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await friendService.sendFriendRequest(fromUserId, fromUsername, toUserId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFriends = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await friendService.getFriends(userId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendRequest, getFriends, loading, error };
}
