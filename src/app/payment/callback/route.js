// Server-side payment callback handler
import { 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { redirect } from 'next/navigation';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract payment params (Paystack uses 'reference', some systems use 'trxref')
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const userId = searchParams.get('userId');
    const tournamentId = searchParams.get('tournamentId');

    // Validate all required params
    if (!reference || !userId || !tournamentId) {
      redirect('/payment-failed?reason=missing_params');
    }

    // Step 1: Verify payment with Paystack using secret key
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!verifyResponse.ok) {
      console.error('Paystack verification request failed');
      redirect(`/payment-failed?reason=verification_error&reference=${reference}`);
    }

    const paystackData = await verifyResponse.json();

    // Check if payment was successful
    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.error('Payment was not successful:', paystackData.data.status);
      redirect(`/payment-failed?reason=payment_failed&reference=${reference}`);
    }

    // Step 2: Update payment record in Firestore
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

    // Step 3: Get tournament and verify it exists
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);

    if (!tournamentDoc.exists()) {
      console.error('Tournament not found:', tournamentId);
      redirect('/payment-failed?reason=tournament_not_found');
    }

    const tournamentData = tournamentDoc.data();
    const currentParticipants = tournamentData.participants || [];

    // Step 4: Check if tournament is full
    if (currentParticipants.length >= tournamentData.maxParticipants) {
      console.error('Tournament is full:', tournamentId);
      redirect('/payment-failed?reason=tournament_full');
    }

    // Step 5: Add user to tournament if not already joined
    if (!currentParticipants.includes(userId)) {
      await updateDoc(tournamentRef, {
        participants: arrayUnion(userId)
      });
    }

    // Step 6: Success! Redirect to tournament page
    redirect(`/tournament/${tournamentId}?payment=success&amount=${paystackData.data.amount / 100}`);

  } catch (error) {
    console.error('Payment callback error:', error);
    redirect('/payment-failed?reason=server_error');
  }
}
