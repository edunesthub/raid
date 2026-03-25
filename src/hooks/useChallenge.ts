// src/hooks/useChallenge.ts
import { useState, useCallback } from 'react';
import { challengeService } from '@/services/challengeService';
import { Challenge, ChallengeGame, ChallengeVisibility, ChallengeRound } from '@/types/challenge';

export function useChallenge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChallenge = async (data: {
    name: string;
    game: ChallengeGame;
    rounds: ChallengeRound;
    visibility: ChallengeVisibility;
    creatorId: string;
    creatorUsername: string;
    streamUrl?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      return await challengeService.createChallenge(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findChallengeByCode = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      return await challengeService.findChallengeByCode(code);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createChallenge, findChallengeByCode, loading, error };
}
