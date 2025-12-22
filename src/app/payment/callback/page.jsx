'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;
    const userId = searchParams.get('userId');
    const tournamentId = searchParams.get('tournamentId');

    if (!paymentRef || !userId || !tournamentId) {
      setStatus('failed');
      setMessage('Invalid payment data');
      return;
    }

    // Call server-side payment callback
    const processPayment = async () => {
      try {
        const response = await fetch('/api/payment/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentRef,
            userId,
            tournamentId
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Redirecting to tournament...');
          setTimeout(() => {
            router.push(`/tournament/${tournamentId}`);
          }, 2000);
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('failed');
        setMessage(error.message || 'Failed to process payment');
      }
    };

    processPayment();
  }, [searchParams, router]);

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
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
