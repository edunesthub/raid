// Server-side payment callback handler - redirect endpoint
import { redirect } from 'next/navigation';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract payment params (Paystack uses 'reference', some systems use 'trxref')
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const userId = searchParams.get('userId');
    const tournamentId = searchParams.get('tournamentId');

    // Validate all required params
    if (!reference || !userId || !tournamentId) {
      console.error('Missing payment callback params:', { reference, userId, tournamentId });
      redirect('/payment-failed?reason=missing_params');
    }

    console.log('[Payment Callback] Processing:', { reference, userId, tournamentId });

    // Call the verification API
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://raidarena.vercel.app'}/api/verify-callback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          userId,
          tournamentId
        })
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.status === 'success') {
      console.log('[Payment Callback] Success! Redirecting to tournament:', tournamentId);
      redirect(`/tournament/${tournamentId}?payment=success&amount=${verifyData.data.amount}`);
    } else {
      console.error('[Payment Callback] Verification failed:', verifyData.message);
      redirect(`/payment-failed?reason=${verifyData.message.toLowerCase().replace(/\s+/g, '_')}`);
    }

  } catch (error) {
    console.error('[Payment Callback] Error:', error);
    redirect('/payment-failed?reason=server_error');
  }
}

