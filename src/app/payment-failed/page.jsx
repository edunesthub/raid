'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const failureReasons = {
  missing_params: 'Missing payment information. Please try again.',
  verification_error: 'Could not verify payment with Paystack. Please contact support.',
  payment_failed: 'Payment verification failed. Your money has not been deducted.',
  tournament_not_found: 'Tournament not found. Please check and try again.',
  tournament_full: 'Sorry, the tournament is now full. Please join another tournament.',
  server_error: 'An unexpected error occurred. Please try again or contact support.'
};

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';
  const reference = searchParams.get('reference');

  const message = failureReasons[reason] || 'Payment could not be processed. Please try again.';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-gray-400 mb-6">{message}</p>
        
        {reference && (
          <p className="text-xs text-gray-600 mb-6">Reference: {reference}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
          >
            Home
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
