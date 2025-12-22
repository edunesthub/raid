import { 
  doc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    const { reference, userId, tournamentId } = await request.json();

    if (!reference || !userId || !tournamentId) {
      return Response.json(
        { status: 'failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack using secret key
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
        { status: 'failed', message: 'Payment verification failed with Paystack' },
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

    // Get tournament and verify it exists
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);

    if (!tournamentDoc.exists()) {
      return Response.json(
        { status: 'failed', message: 'Tournament not found' },
        { status: 404 }
      );
    }

    const tournamentData = tournamentDoc.data();
    const currentParticipants = tournamentData.participants || [];

    // Check if tournament is full
    if (currentParticipants.length >= tournamentData.maxParticipants) {
      return Response.json(
        { status: 'failed', message: 'Tournament is full' },
        { status: 400 }
      );
    }

    // Add user to tournament participants if not already joined
    if (!currentParticipants.includes(userId)) {
      await updateDoc(tournamentRef, {
        participants: arrayUnion(userId)
      });
    }

    return Response.json(
      {
        status: 'success',
        message: 'Payment verified and tournament joined successfully',
        data: {
          reference,
          transactionId: paystackData.data.id,
          amount: paystackData.data.amount / 100, // Convert from pesewas to GHS
          tournamentId
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return Response.json(
      { status: 'failed', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
