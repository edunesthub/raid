// src/app/api/verify-payment/route.js
import { 
  doc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    const { reference, userId, tournamentId } = await request.json();

    if (!reference || !userId || !tournamentId) {
      return Response.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paystackData = await verifyResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return Response.json(
        { status: 'error', message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update payment record in Firestore
    const paymentRef = collection(db, 'tournament_payments');
    const q = query(paymentRef, where('reference', '==', reference));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      await updateDoc(paymentDoc.ref, {
        status: 'success',
        paystackResponse: {
          transactionId: paystackData.data.id,
          authorization: paystackData.data.authorization,
          amount: paystackData.data.amount,
          paidAt: paystackData.data.paid_at
        },
        updatedAt: new Date().toISOString()
      });
    }

    return Response.json(
      {
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          reference,
          transactionId: paystackData.data.id,
          amount: paystackData.data.amount / 100 // Convert from pesewas to GHS
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
