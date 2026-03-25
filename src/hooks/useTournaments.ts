// src/hooks/useTournaments.ts
import { useState, useEffect, useCallback } from 'react';
import { tournamentService } from '@/services/tournamentService';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Tournament } from '@/types/tournament';

export function useTournaments(options: { game?: string, limit?: number, userId?: string, status?: string } = {}) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getAllTournaments(options);
      setTournaments(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const refresh = () => {
    loadTournaments();
  };

  return { tournaments, loading, error, refresh };
}

export function useTournament(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }
    let unsubTournament: Unsubscribe | null = null;
    let unsubParticipants: Unsubscribe | null = null;

    try {
      setLoading(true);
      setError(null);

      const tournamentRef = doc(db, 'tournaments', tournamentId);
      unsubTournament = onSnapshot(tournamentRef, (snapshot) => {
        if (!snapshot.exists()) {
          setTournament(null);
          setError('Tournament not found');
          setLoading(false);
          return;
        }
        const base = tournamentService.transformTournamentDoc(snapshot);
        setTournament((prev) => ({
          ...base,
          participants: prev?.participants || []
        } as any));
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      const participantsQ = query(
        collection(db, 'tournament_participants'),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'active')
      );
      unsubParticipants = onSnapshot(participantsQ, (snap) => {
        const participants = snap.docs.map((d) => ({ id: d.data().userId, ...d.data() }));
        setTournament((prev) => prev ? {
          ...prev,
          participants,
          currentPlayers: participants.length
        } as any : prev);
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (unsubTournament) unsubTournament();
      if (unsubParticipants) unsubParticipants();
    };
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getTournamentById(tournamentId);
      setTournament(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (userId: string) => {
    try {
      await tournamentService.joinTournament(tournamentId, userId);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const leaveTournament = async (userId: string) => {
    try {
      await tournamentService.leaveTournament(tournamentId, userId);
      await loadTournament();
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    tournament,
    loading,
    error,
    joinTournament,
    leaveTournament,
    refresh: loadTournament
  };
}

export function useFeaturedTournaments(limitCount: number = 4) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getFeaturedTournaments(limitCount);
      setTournaments(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading featured tournaments:', err);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeaturedTournaments();
    }, 100);
    return () => clearTimeout(timer);
  }, [loadFeaturedTournaments]);

  return { tournaments, loading, error, refresh: loadFeaturedTournaments };
}