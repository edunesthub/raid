// src/hooks/useTournaments.js
import { useState, useEffect } from 'react';
import { tournamentService } from '@/services/tournamentService';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';

export function useTournaments(options = {}) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTournaments();
  }, [JSON.stringify(options)]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getAllTournaments(options);
      setTournaments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadTournaments();
  };

  return {
    tournaments,
    loading,
    error,
    refresh
  };
}

export function useTournament(tournamentId) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }
    let unsubTournament = null;
    let unsubParticipants = null;

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
        }));
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
        } : prev);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (typeof unsubTournament === 'function') unsubTournament();
      if (typeof unsubParticipants === 'function') unsubParticipants();
    };
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getTournamentById(tournamentId);
      setTournament(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (userId) => {
    try {
      await tournamentService.joinTournament(tournamentId, userId);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const leaveTournament = async (userId) => {
    try {
      await tournamentService.leaveTournament(tournamentId, userId);
      await loadTournament(); // Refresh data
      return true;
    } catch (err) {
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

export function useFeaturedTournaments(limitCount = 4) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait a bit to ensure Firebase auth is initialized
    const timer = setTimeout(() => {
      loadFeaturedTournaments();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [limitCount]);

  const loadFeaturedTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tournamentService.getFeaturedTournaments(limitCount);
      setTournaments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading featured tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    tournaments,
    loading,
    error,
    refresh: loadFeaturedTournaments
  };
}