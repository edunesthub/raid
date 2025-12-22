// Simple redirect after payment - let client handle the join
import { redirect } from 'next/navigation';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const userId = searchParams.get('userId');
    const tournamentId = searchParams.get('tournamentId');

    console.log('[CALLBACK] Redirect:', reference, userId, tournamentId);

    if (!reference || !userId || !tournamentId) {
      redirect('/payment-failed?reason=missing_params');
    }

    // Verify payment with API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://raidarena.vercel.app';
    const verifyResponse = await fetch(`${baseUrl}/api/verify-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, userId, tournamentId })
    });

    const data = await verifyResponse.json();
    console.log('[CALLBACK] Verify response:', data.status);

    if (data.status === 'success') {
      // Payment verified - redirect to tournament with payment params
      redirect(`/tournament/${tournamentId}?payment=success&reference=${reference}&userId=${userId}`);
    } else {
      redirect(`/payment-failed?reason=verification_failed`);
    }

  } catch (error) {
    console.error('[CALLBACK] Error:', error.message);
    redirect('/payment-failed?reason=server_error');
  }
}

