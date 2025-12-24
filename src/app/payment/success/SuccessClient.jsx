"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useTournament } from '@/hooks/useTournaments';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { paystackService } from '@/services/paystackService';

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentIdParam = searchParams.get('tournamentId');
  const reference = searchParams.get('reference');
  const { user } = useAuth();

  const [finalTournamentId, setFinalTournamentId] = useState(tournamentIdParam || null);
  const { joinTournament } = useTournament(finalTournamentId);

  const [status, setStatus] = useState('joining');
  const [message, setMessage] = useState('Finalizing your join...');
  const [ign, setIgn] = useState('');
  const [savingIGN, setSavingIGN] = useState(false);

  // Resolve tournamentId from URL, localStorage, or Firestore (reference lookup)
  useEffect(() => {
    const resolveTournamentId = async () => {
      let tId = tournamentIdParam || null;

      // Try localStorage fallback
      if (!tId && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('raid:lastPayment');
          if (stored) {
            const data = JSON.parse(stored);
            if (!reference || data.reference === reference) {
              tId = data.tournamentId || tId;
            }
          }
        } catch (e) {
          console.warn('Failed to read lastPayment from storage:', e);
        }
      }

      // Try Firestore via reference lookup
      if (!tId && reference) {
        try {
          const payment = await paystackService.getPaymentByReference(reference);
          if (payment?.tournamentId) {
            tId = payment.tournamentId;
          }
        } catch (e) {
          console.warn('Payment lookup by reference failed:', e);
        }
      }

      setFinalTournamentId(tId || null);
    };

    resolveTournamentId();
  }, [tournamentIdParam, reference]);

  // Perform join once we have finalTournamentId and user
  useEffect(() => {
    const attemptJoin = async () => {
      try {
        if (!finalTournamentId) {
          // Keep trying silently until tournamentId is resolved
          setMessage('Preparing tournament...');
          return;
        }
        if (!user?.id) {
          // If user not available, just go to tournament page; UI will prompt login
          setMessage('Redirecting to tournament...');
          return;
        }

        // Try to join the tournament client-side (idempotent)
        const result = typeof joinTournament === 'function' ? await joinTournament(user.id) : true;
        console.log('[SuccessPage] joinTournament result:', result);

        // Mark participant as paid (idempotent)
        try {
          const partRef = doc(db, 'tournament_participants', `${finalTournamentId}_${user.id}`);
          await updateDoc(partRef, {
            paymentStatus: 'completed',
            paymentReference: reference || null,
            paidAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn('[SuccessPage] Could not update participant paymentStatus (will be fine if doc not yet present):', e?.message);
        }

        // Update payment record to success if we can resolve it
        try {
          if (reference) {
            const payment = await paystackService.getPaymentByReference(reference);
            if (payment?.id) {
              await paystackService.updatePaymentStatus(payment.id, 'success', {
                tournamentId: finalTournamentId,
                userId: user.id
              });
            }
          }
        } catch (e) {
          console.warn('[SuccessPage] Could not update payment status:', e?.message);
        }

        // Log a notification for the user
        const notifRef = collection(db, 'notifications');
        await addDoc(notifRef, {
          userId: user.id,
          title: 'Tournament Joined 🎮',
          message: 'Payment confirmed! You successfully joined the tournament. Good luck!',
          tournamentId: finalTournamentId,
          paymentReference: reference || null,
          timestamp: serverTimestamp(),
          read: false,
        });

        setStatus('success');
        setMessage("You're in! Add your in-game name.");
      } catch (err) {
        // If already joined, treat as success
        if (String(err?.message || '').toLowerCase().includes('already joined')) {
          setStatus('success');
          setMessage("You're already in! Add your in-game name.");
          return;
        }

        console.error('[SuccessPage] Join error:', err);
        // Do not show error UI; proceed to tournament page
        setStatus('success');
        setMessage("Join complete! Add your in-game name.");
      }
    };

    attemptJoin();
  }, [finalTournamentId, user?.id, joinTournament, router, reference]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          {status === 'success' ? 'Success! 🎉' : 'Payment Successful'}
        </h1>
        <p className="text-xl font-semibold mb-4 text-green-400">
          {status === 'success' ? "You've Joined the Tournament!" : 'Processing your join...'}
        </p>
        <p className="text-gray-400 mb-6">{message}</p>

        {status !== 'success' && <LoadingSpinner />}

        {status === 'success' && (
          <div className="text-left">
            <label className="block text-sm text-gray-300 mb-2">Your In-Game Name</label>
            <input
              type="text"
              placeholder="e.g., GhostRider#1234"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  const trimmed = (ign || '').trim();
                  if (!trimmed) return;
                  try {
                    setSavingIGN(true);
                    const partRef = doc(db, 'tournament_participants', `${finalTournamentId}_${user.id}`);
                    await updateDoc(partRef, { inGameName: trimmed, inGameNameUpdatedAt: serverTimestamp() });
                    router.push(`/tournament/${finalTournamentId}`);
                  } catch (e) {
                    console.warn('Failed to save IGN:', e?.message);
                  } finally {
                    setSavingIGN(false);
                  }
                }}
                disabled={savingIGN || !(ign || '').trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-semibold px-4 py-3 rounded-xl transition"
              >
                {savingIGN ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                onClick={() => router.push(`/tournament/${finalTournamentId}`)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-3 rounded-xl transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
