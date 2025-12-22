'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      setStatus('error');
      setMessage('Invalid payment reference');
      return;
    }

    // Verify payment
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentRef,
            userId: searchParams.get('userId'),
            tournamentId: searchParams.get('tournamentId')
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          
          // Check if popup or redirect
          if (window.opener) {
            setMessage('Payment successful! You can close this window.');
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            setMessage('Payment successful! Redirecting to tournament...');
            setTimeout(() => {
              const tournamentId = searchParams.get('tournamentId');
              if (tournamentId) {
                router.push(`/tournament/${tournamentId}`);
              } else {
                router.push('/');
              }
            }, 2000);
          }
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
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

        {status === 'error' && (
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
