// src/app/api/create-transaction/route.js
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_SUBACCOUNT = process.env.PAYSTACK_SUBACCOUNT;

export async function POST(request) {
  try {
    const { email, amount, reference, firstName, lastName, metadata } = await request.json();

    if (!email || !amount || !reference) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/payment/callback?userId=${metadata?.userId}&tournamentId=${metadata?.tournamentId}`;

    // Initialize transaction with Paystack
    const payload = {
      email,
      amount: amount * 100, // Convert to pesewas
      reference,
      currency: 'GHS',
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: `${firstName || ''} ${lastName || ''}`
          }
        ]
      }
    };

    // Add subaccount if configured
    if (PAYSTACK_SUBACCOUNT) {
      payload.subaccount = PAYSTACK_SUBACCOUNT;
      // Uncomment to make subaccount bear transaction charges:
      // payload.bearer = 'subaccount';
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to initialize transaction' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
