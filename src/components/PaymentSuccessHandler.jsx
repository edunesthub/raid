'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paystackService } from '@/services/paystackService';
import { useTournament } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaymentSuccessHandler({ tournamentId }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { joinTournament } = useTournament(tournamentId);
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const payment = searchParams.get('payment');
        const reference = searchParams.get('reference');
        const urlUserId = searchParams.get('userId');
        
        console.log('[PaymentSuccess] URL params:', { payment, reference, urlUserId, currentUserId: user?.id, tournamentId });
        
        if (payment !== 'success') {
          console.log('[PaymentSuccess] No payment success param');
          return;
        }
        
        if (!user) {
          console.log('[PaymentSuccess] No user logged in');
          setStatus('error');
          setMessage('Please log in to continue');
          return;
        }
        
        if (!tournamentId) {
          console.log('[PaymentSuccess] No tournament ID');
          setStatus('error');
          setMessage('Tournament not found');
          return;
        }
        
        console.log('[PaymentSuccess] Starting join process...');
        setMessage('Adding you to tournament...');
        
        // Join tournament
        console.log('[PaymentSuccess] Calling joinTournament with userId:', user.id);
        const result = await joinTournament(user.id);
        console.log('[PaymentSuccess] Join result:', result);
        
        // Add notification
        console.log('[PaymentSuccess] Adding notification...');
        const notifRef = collection(db, 'notifications');
        await addDoc(notifRef, {
          userId: user.id,
          title: 'Tournament Joined 🎮',
          message: `Payment confirmed! You successfully joined the tournament. Good luck!`,
          tournamentId: tournamentId,
          timestamp: serverTimestamp(),
          read: false,
        });
        
        setStatus('success');
        setMessage('You\'ve been added to the tournament!');
        console.log('[PaymentSuccess] Success! Redirecting in 2s...');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          console.log('[PaymentSuccess] Redirecting to tournament page');
          window.location.href = `/tournament/${tournamentId}`;
        }, 2000);
        
      } catch (error) {
        const msg = String(error?.message || '');
        if (msg.toLowerCase().includes('already joined')) {
          setStatus('success');
          setMessage("You're already in! Redirecting...");
          setTimeout(() => {
            window.location.href = `/tournament/${tournamentId}`;
          }, 1500);
          return;
        }
        console.error('[PaymentSuccess] Error:', error);
        console.error('[PaymentSuccess] Error stack:', error.stack);
        setStatus('error');
        setMessage(error.message || 'Failed to join tournament. Please contact support.');
      }
    };

    handlePaymentSuccess();
  }, [searchParams, user, tournamentId, joinTournament]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <LoadingSpinner />
            <p className="text-white mt-4">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Success! 🎉</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            <p className="text-gray-400">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
