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
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   */
  async initializePayment({
    email,
    amount,
    reference,
    userId,
    tournamentId,
    firstName = '',
    lastName = '',
    onSuccess,
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

      // Step 2: Open Paystack authorization URL
      const authWindow = window.open(
        data.data.authorization_url,
        'PaystackPayment',
        'width=600,height=700,left=200,top=100'
      );

      // Step 3: Poll for window close and verify payment
      const pollTimer = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(pollTimer);
          
          // Verify payment after window closes
          try {
            await this.verifyPayment(reference, userId, tournamentId);
            onSuccess({ reference });
          } catch (error) {
            onError(error);
          }
        }
      }, 500);

    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error);
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(reference, userId, tournamentId) {
    try {
      const response = await fetch(`/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          userId,
          tournamentId
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
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
