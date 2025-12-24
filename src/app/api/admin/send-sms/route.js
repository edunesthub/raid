// src/app/api/admin/send-sms/route.js
import { NextResponse } from 'next/server';

const HUBTEL_API_URL = 'https://api.hubtel.com/v2/sms/send';
const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;
const HUBTEL_SENDER_ID = 'RaidArena1'.substring(0, 11); // Ensure max 11 chars

/**
 * Send SMS via Hubtel API
 */
async function sendSMSViaHubtel(phone, message) {
  try {
    console.log('[SMS] Using credentials:', {
      clientId: HUBTEL_CLIENT_ID,
      clientSecretLength: HUBTEL_CLIENT_SECRET?.length,
      senderId: HUBTEL_SENDER_ID,
      apiUrl: HUBTEL_API_URL
    });
    
    const url = new URL(HUBTEL_API_URL);
    url.searchParams.append('From', HUBTEL_SENDER_ID);
    url.searchParams.append('To', phone);
    url.searchParams.append('Content', message);
    url.searchParams.append('RegisteredDelivery', 'true');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    let data;
    const responseText = await response.text();
    
    console.log(`[SMS] Hubtel raw response for ${phone}:`, {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500)
    });

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[SMS] Failed to parse Hubtel response:`, parseError);
      return {
        success: false,
        phone,
        error: `API Error (${response.status}): ${responseText.substring(0, 100) || 'Empty response'}`,
      };
    }

    if (response.ok && (data.Status === 0 || data.Status === '0')) {
      return {
        success: true,
        messageId: data.MessageId,
        phone,
      };
    }

    return {
      success: false,
      phone,
      error: data.Message || data.ResponseText || data.Detail || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error(`Error sending SMS to ${phone}:`, error);
    return {
      success: false,
      phone,
      error: error.message,
    };
  }
}

/**
 * Format phone number to 233XXXXXXXXX format (no + prefix)
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('233')) {
    return cleaned; // Already 233XXXXXXXXX
  }
  if (cleaned.startsWith('0')) {
    return `233${cleaned.substring(1)}`; // 0XXXXXXXXX -> 233XXXXXXXXX
  }
  // Assume it's missing country code
  return `233${cleaned}`;
}

/**
 * POST endpoint to send bulk SMS
 */
export async function POST(request) {
  try {
    const { message, participants } = await request.json();

    if (!message || !participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { message: 'Missing message or participants array' },
        { status: 400 }
      );
    }

    if (participants.length === 0) {
      return NextResponse.json(
        { message: 'No participants provided' },
        { status: 400 }
      );
    }

    if (!HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
      console.error('Missing Hubtel credentials');
      return NextResponse.json(
        { message: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Send SMS to each participant
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const participant of participants) {
      try {
        const formattedPhone = formatPhoneNumber(participant.phone);
        const result = await sendSMSViaHubtel(formattedPhone, message);

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            phone: participant.phone,
            username: participant.username,
            error: result.error,
          });
        }
      } catch (e) {
        results.failed++;
        results.errors.push({
          phone: participant.phone,
          username: participant.username,
          error: e.message,
        });
      }
    }

    // Return 207 if partial failure, 200 if all success
    const statusCode = results.failed > 0 && results.sent > 0 ? 207 : 200;
    return NextResponse.json(results, { status: statusCode });
  } catch (error) {
    console.error('Send SMS API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
