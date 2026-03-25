import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { clanService } from '@/services/clanService';

export function useClan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinClan = async (clanId) => {
    if (!user) {
      throw new Error('Must be logged in to join a clan');
    }

    setLoading(true);
    setError(null);

    try {
      await clanService.joinClan(clanId, user.id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createClan = async (clanData) => {
    if (!user) {
      throw new Error('Must be logged in to create a clan');
    }

    setLoading(true);
    setError(null);

    try {
      const newClan = await clanService.createClan({
        ...clanData,
        ownerId: user.id
      });
      return newClan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateClan = async (clanId, updates) => {
    if (!user) {
      throw new Error('Must be logged in to update clan');
    }

    setLoading(true);
    setError(null);

    try {
      await clanService.updateClan(clanId, updates);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const kickMember = async (clanId, memberId) => {
    if (!user) {
      throw new Error('Must be logged in to kick members');
    }

    setLoading(true);
    setError(null);

    try {
      await clanService.kickMember(clanId, memberId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveClan = async (clanId) => {
    if (!user) {
      throw new Error('Must be logged in to leave clan');
    }

    setLoading(true);
    setError(null);

    try {
      await clanService.leaveClan(clanId, user.id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    joinClan,
    createClan,
    updateClan,
    kickMember,
    leaveClan,
    loading,
    error
  };
}