'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useTournament } from '@/hooks/useTournaments';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { paystackService } from '@/services/paystackService';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');
  const reference = searchParams.get('reference');
  const { user } = useAuth();
  const [finalTournamentId, setFinalTournamentId] = useState(tournamentId || null);
  const { joinTournament } = useTournament(finalTournamentId);

  const [status, setStatus] = useState('joining');
  const [message, setMessage] = useState('Finalizing your join...');

  // Resolve tournamentId from URL, localStorage, or Firestore (reference lookup)
  useEffect(() => {
    const resolveTournamentId = async () => {
      let tId = tournamentId || null;

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
  }, [tournamentId, reference]);

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
          setTimeout(() => router.push(`/tournament/${finalTournamentId}`), 1000);
          return;
        }

        // Try to join the tournament client-side (idempotent)
        const result = typeof joinTournament === 'function' ? await joinTournament(user.id) : true;
        console.log('[SuccessPage] joinTournament result:', result);

        // Log a notification for the user
        const notifRef = collection(db, 'notifications');
        await addDoc(notifRef, {
          userId: user.id,
          title: 'Tournament Joined 🎮',
          message: 'Payment confirmed! You successfully joined the tournament. Good luck!',
          tournamentId,
          paymentReference: reference || null,
          timestamp: serverTimestamp(),
          read: false,
        });

        setStatus('success');
        setMessage("You're in! Redirecting...");

        // Redirect shortly
        setTimeout(() => router.push(`/tournament/${finalTournamentId}`), 1500);
      } catch (err) {
        // If already joined, treat as success
        if (String(err?.message || '').toLowerCase().includes('already joined')) {
          setStatus('success');
          setMessage("You're already in! Redirecting...");
          setTimeout(() => router.push(`/tournament/${finalTournamentId}`), 1500);
          return;
        }

        console.error('[SuccessPage] Join error:', err);
        // Do not show error UI; proceed to tournament page
        setMessage('Redirecting to tournament...');
        setTimeout(() => router.push(`/tournament/${finalTournamentId || ''}`), 1200);
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
      </div>
    </div>
  );
}
