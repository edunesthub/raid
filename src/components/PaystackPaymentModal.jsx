'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import { paystackService } from '@/services/paystackService';

const PaystackPaymentModal = ({
  isOpen,
  onClose,
  tournament,
  user,
  onPaymentError
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate unique reference
      const paymentRef = paystackService.generateReference();

      // Create payment record in Firestore
      await paystackService.createPaymentRecord({
        userId: user.id,
        tournamentId: tournament.id,
        amount: tournament.entryFee,
        reference: paymentRef,
        status: 'pending'
      });

      // Persist last payment context for success page fallback
      try {
        localStorage.setItem('raid:lastPayment', JSON.stringify({
          reference: paymentRef,
          tournamentId: tournament.id,
          userId: user.id,
          ts: Date.now()
        }));
      } catch (e) {
        console.warn('Could not persist lastPayment:', e);
      }

      // Mark payment as processing so we can recover if user cancels and returns
      try {
        sessionStorage.setItem('raid:paymentProcessing', JSON.stringify({
          reference: paymentRef,
          tournamentId: tournament.id,
          userId: user.id,
          ts: Date.now()
        }));
      } catch (e) {
        console.warn('Could not persist paymentProcessing:', e);
      }

      // Initialize Paystack payment
      // This will redirect to Paystack payment page (mobile or desktop)
      // After payment, Paystack redirects to /payment/callback
      // which is a server-side route that verifies payment and joins tournament
      paystackService.initializePayment({
        email: user.email,
        amount: tournament.entryFee,
        reference: paymentRef,
        userId: user.id,
        tournamentId: tournament.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        onError: (err) => {
          setLoading(false);
          setError(err.message);
          onPaymentError(err);
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.message);
      onPaymentError(err);
    }
  };

  // Allow cancel even while processing and recover from return-after-cancel
  const handleCancel = () => {
    try {
      sessionStorage.removeItem('raid:paymentProcessing');
    } catch {}
    setLoading(false);
    onClose();
  };

  // When user returns from Paystack (after cancel/close), make modal responsive again
  useEffect(() => {
    const onReturn = () => {
      try {
        const raw = sessionStorage.getItem('raid:paymentProcessing');
        if (raw) {
          const data = JSON.parse(raw);
          // If we are back and still showing modal, consider it cancelled
          sessionStorage.removeItem('raid:paymentProcessing');
          setLoading(false);
          setError('Payment cancelled. You can try again.');
        }
      } catch {}
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onReturn();
    });
    window.addEventListener('focus', onReturn);

    return () => {
      window.removeEventListener('focus', onReturn);
    };
  }, []);

  // Guard: if not open or missing data, render nothing (hooks above still run consistently)
  if (!isOpen || !tournament || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-0">
      <div className="bg-gray-900 w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl border-0 sm:border border-gray-800 shadow-2xl animate-scale-in overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-gray-900 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white">Complete Payment</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 min-h-[60vh] flex flex-col justify-center">
          {/* Tournament Info */}
          <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Tournament</p>
            <p className="text-white font-semibold text-base sm:text-lg break-words">{tournament.title}</p>
          </div>

          {/* Entry Fee */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4 sm:p-5 border border-orange-500/30">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Entry Fee</p>
            <p className="text-white font-bold text-3xl sm:text-4xl">
              ₵{tournament.entryFee.toLocaleString()}
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">Name</p>
              <p className="text-white font-medium text-sm sm:text-base break-words">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Email</p>
              <p className="text-white font-medium text-xs sm:text-sm break-all">{user.email}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-3 sm:p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-3 sm:p-4">
            <p className="text-blue-300 text-xs sm:text-sm leading-relaxed">
              You will be redirected to Paystack to securely complete your payment. After successful payment, you'll be automatically added to the tournament.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-800 p-4 sm:p-6 space-y-2 sm:space-y-3 bg-gray-900">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span>Pay ₵{tournament.entryFee.toLocaleString()}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-4 rounded-xl transition-all text-base"
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaystackPaymentModal;
