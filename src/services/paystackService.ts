// src/services/paystackService.ts
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export interface PaystackPaymentData {
  email: string;
  amount: number;
  reference: string;
  userId: string;
  tournamentId: string;
  firstName?: string;
  lastName?: string;
  onError: (error: any) => void;
}

class PaystackService {
  constructor() {
    if (!PAYSTACK_PUBLIC_KEY) {
      console.error('⚠️ Paystack public key not configured');
    }
  }

  async initializePayment({
    email,
    amount,
    reference,
    userId,
    tournamentId,
    firstName = '',
    lastName = '',
    onError
  }: PaystackPaymentData) {
    try {
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

      window.location.href = data.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error);
    }
  }

  async verifyPayment(reference: string, userId: string, tournamentId: string) {
    console.warn('⚠️ verifyPayment() is deprecated.');
    return { status: 'success' };
  }

  static async verifyPaymentServer(reference: string) {
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

  async createPaymentRecord({
    userId,
    tournamentId,
    amount,
    reference,
    status = 'pending'
  }: any) {
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

  async updatePaymentStatus(paymentId: string, status: string, additionalData = {}) {
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

  async getPaymentByReference(reference: string) {
    try {
      const paymentRef = collection(db, 'tournament_payments');
      const q = query(paymentRef, where('reference', '==', reference));
      const querySnapshot: QuerySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const d = querySnapshot.docs[0];
      return {
        id: d.id,
        ...d.data()
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async hasUserPaidForTournament(userId: string, tournamentId: string) {
    try {
      const paymentRef = collection(db, 'tournament_payments');
      const q = query(
        paymentRef,
        where('userId', '==', userId),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'success')
      );
      const querySnapshot: QuerySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  getPublicKey() {
    return PAYSTACK_PUBLIC_KEY;
  }

  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `RAID_${timestamp}_${random}`;
  }
}

export const paystackService = new PaystackService();
