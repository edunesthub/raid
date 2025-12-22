// Direct payment verification - simple version
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    const { reference, userId, tournamentId } = await request.json();

    console.log('[VERIFY] Start:', reference, userId, tournamentId);

    if (!reference || !userId || !tournamentId) {
      console.log('[VERIFY] Missing params');
      return Response.json({ status: 'failed', message: 'Missing params' }, { status: 400 });
    }

    // Verify with Paystack
    console.log('[VERIFY] Checking Paystack...');
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    const paystackData = await verifyResponse.json();
    console.log('[VERIFY] Paystack:', paystackData.data?.status);

    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.log('[VERIFY] Payment failed');
      return Response.json({ status: 'failed', message: 'Payment not successful' }, { status: 400 });
    }

    // Payment is verified - just return success
    // The client will handle joining the tournament
    console.log('[VERIFY] Success!');
    return Response.json({
      status: 'success',
      data: {
        reference,
        tournamentId,
        userId,
        amount: paystackData.data.amount / 100
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[VERIFY] Error:', error.message);
    return Response.json({ status: 'failed', message: error.message }, { status: 500 });
  }
}
