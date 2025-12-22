// src/hooks/useTournaments.js
import { useState, useEffect } from 'react';
import { tournamentService } from '@/services/tournamentService';

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
    loadTournament();
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
      await loadTournament(); // Refresh data
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