// src/services/paystackService.js
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

class PaystackService {
  constructor() {
    if (!PAYSTACK_PUBLIC_KEY) {
      console.error('⚠️ Paystack public key not configured');
    }
  }

  /**
   * Initialize Paystack payment (server-side initialization)
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.email - User email
   * @param {number} paymentData.amount - Amount in GHS
   * @param {string} paymentData.reference - Unique reference ID
   * @param {string} paymentData.userId - Firebase user ID
   * @param {string} paymentData.tournamentId - Tournament ID
   * @param {Function} onError - Error callback (called if payment initialization fails)
   */
  async initializePayment({
    email,
    amount,
    reference,
    userId,
    tournamentId,
    firstName = '',
    lastName = '',
    onError
  }) {
    try {
      // Step 1: Initialize transaction on server
      const response = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          reference,
          firstName,
          lastName,
          metadata: {
            userId,
            tournamentId,
            custom_fields: [
              {
                display_name: 'Tournament ID',
                variable_name: 'tournament_id',
                value: tournamentId
              }
            ]
          }
        })
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to initialize transaction');
      }

      // Step 2: Redirect to Paystack payment for BOTH mobile and desktop
      // This ensures the user actually pays before Paystack redirects to /payment/callback
      // The /payment/callback route (server-side) handles verification and tournament join
      window.location.href = data.data.authorization_url;

    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error);
    }
  }

  /**
   * DEPRECATED - Payment verification now happens entirely server-side
   * 
   * When user completes payment:
   * - Desktop: Paystack closes popup, server already verified and joined user
   * - Mobile: Paystack redirects to /payment/callback route, server verifies and redirects to tournament
   * 
   * This method is kept for backward compatibility but should not be used.
   */
  async verifyPayment(reference, userId, tournamentId) {
    console.warn('⚠️ verifyPayment() is deprecated. Payment verification now happens server-side at /payment/callback');
    // This is now handled entirely by the server-side route at /src/app/payment/callback/route.js
    return { status: 'success' };
  }

  /**
   * Verify payment server-side using Paystack secret key
   * This is called from the /api/payment/callback route
   */
  static async verifyPaymentServer(reference) {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    
    if (!PAYSTACK_SECRET) {
      throw new Error('Paystack secret key not configured');
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Paystack verification request failed');
      }

      const data = await response.json();

      if (!data.status || data.data.status !== 'success') {
        throw new Error('Payment was not successful');
      }

      return data.data;
    } catch (error) {
      console.error('Server-side payment verification error:', error);
      throw error;
    }
  }

  /**
   * Create payment record in Firestore
   */
  async createPaymentRecord({
    userId,
    tournamentId,
    amount,
    reference,
    status = 'pending'
  }) {
    try {
      const paymentRef = collection(db, 'tournament_payments');
      const docRef = await addDoc(paymentRef, {
        userId,
        tournamentId,
        amount,
        reference,
        status,
        currency: 'GHS',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        userId,
        tournamentId,
        amount,
        reference,
        status
      };
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    try {
      const paymentRef = doc(db, 'tournament_payments', paymentId);
      await updateDoc(paymentRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(reference) {
    try {
      const paymentRef = collection(db, 'tournament_payments');
      const q = query(paymentRef, where('reference', '==', reference));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Check if user has paid for tournament
   */
  async hasUserPaidForTournament(userId, tournamentId) {
    try {
      const paymentRef = collection(db, 'tournament_payments');
      const q = query(
        paymentRef,
        where('userId', '==', userId),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'success')
      );
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Get Paystack public key
   */
  getPublicKey() {
    return PAYSTACK_PUBLIC_KEY;
  }

  /**
   * Generate unique payment reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `RAID_${timestamp}_${random}`;
  }
}

export const paystackService = new PaystackService();
