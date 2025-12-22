import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaymentSuccessPage({ searchParams }) {
  const amount = searchParams.amount || '0';
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-400 mb-6">You've been added to the tournament. Redirecting...</p>
        <p className="text-sm text-gray-500">Amount: ₵{amount}</p>
      </div>
    </div>
  );
}
