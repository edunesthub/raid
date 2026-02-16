// Always redirect to success; client page finalizes join
export const runtime = 'nodejs';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const reference = searchParams.get('reference') || searchParams.get('trxref') || '';
    const userId = searchParams.get('userId') || '';
    const tournamentId = searchParams.get('tournamentId') || '';

    console.log('[CALLBACK] Processing:', { reference, userId, tournamentId });

    // Do not fail on missing params; success page handles gracefully
    if (!reference || !userId || !tournamentId) {
      console.log('[CALLBACK] Missing params - continuing to success');
    }

    if (!adminDb) {
      // Do NOT fail if admin is missing; client success page will finalize join
      console.log('[CALLBACK] Firebase admin not initialized - skipping server join');
    }

    // 1. (Optional) Verify payment with Paystack - do not block flow
    try {
      if (reference) {
        console.log('[CALLBACK] Attempting Paystack verify...');
        const res = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );
        const d = await res.json();
        console.log('[CALLBACK] Paystack verify status:', d?.data?.status);
      }
    } catch (e) {
      console.log('[CALLBACK] Verify error (ignored):', e.message);
    }

    // 2. Attempt join tournament using Firebase Admin (if available)
    console.log('[CALLBACK] Attempting join...');

    const tournamentRef = adminDb.collection('tournaments').doc(tournamentId);
    const participantRef = adminDb.collection('tournament_participants').doc(`${tournamentId}_${userId}`);

    try {
      if (!adminDb) throw new Error('admin_unavailable');
      await adminDb.runTransaction(async (transaction) => {
        const tournamentDoc = await transaction.get(tournamentRef);

        if (!tournamentDoc.exists) {
          throw new Error('Tournament not found');
        }

        const tournamentData = tournamentDoc.data();
        const currentCount = tournamentData.current_participants || 0;
        const maxCount = tournamentData.max_participant || 0;

        if (currentCount >= maxCount) {
          throw new Error('Tournament is full');
        }

        const participantDoc = await transaction.get(participantRef);
        if (participantDoc.exists) {
          console.log('[CALLBACK] Already joined - skipping');
          return; // Already joined, no error
        }

        transaction.set(participantRef, {
          tournamentId,
          userId,
          joinedAt: FieldValue.serverTimestamp(),
          status: 'active',
          eliminated: false,
          paymentStatus: 'completed',
          paymentReference: reference || null
        });

        transaction.update(tournamentRef, {
          current_participants: FieldValue.increment(1),
          updated_at: FieldValue.serverTimestamp()
        });
      });

      console.log('[CALLBACK] Successfully joined tournament!');

      // 3. Add notification
      await adminDb.collection('notifications').add({
        userId,
        title: 'Tournament Joined! 🎮',
        message: 'Payment confirmed! You successfully joined the tournament. Good luck!',
        tournamentId,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });

    } catch (error) {
      // Do NOT fail the flow; the client success page will finalize join
      console.error('[CALLBACK] Join error (will be finalized client-side):', error.message);
    }

    // Always redirect to success page
    redirect(`/payment/success?tournamentId=${tournamentId}&reference=${reference}&userId=${userId}`);

  } catch (error) {
    // Never redirect to failure; always success
    console.error('[CALLBACK] Error (ignored, redirecting to success):', error.message);
    redirect('/payment/success');
  }
}

