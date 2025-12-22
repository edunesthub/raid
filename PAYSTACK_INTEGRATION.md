# Paystack Integration Guide

## Overview
Paystack integration allows users to pay entry fees before joining tournaments. The system handles payment processing, verification, and automatically adds users to tournaments upon successful payment.

## Setup Instructions

### 1. Get Paystack Credentials
1. Create a Paystack account at https://paystack.com
2. Go to Dashboard → Settings → Developer
3. Copy your **Public Key** and **Secret Key**

### 2. Configure Environment Variables
Add to your `.env.local` file:

```bash
# For testing (use pk_test_ and sk_test_)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# For production (use pk_live_ and sk_live_)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

⚠️ **Security Note**: 
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` can be exposed (it's prefixed with `NEXT_PUBLIC_`)
- `PAYSTACK_SECRET_KEY` must NEVER be committed to git or exposed on the frontend

### 3. Load Paystack Script
The `PaystackPaymentModal` component automatically loads the Paystack inline script on mount. The script URL is:
```
https://js.paystack.co/v1/inline.js
```

## How It Works

### Complete Server-Side Verification Flow

**The key fix**: All payment verification and tournament joining happens on the server, not in the client callback page. This guarantees it works on mobile.

1. User clicks "Join Tournament" button
2. If tournament has an entry fee:
   - `PaystackPaymentModal` appears
   - User reviews payment details
   - Clicks "Pay" to initiate Paystack payment
   - Payment record created in Firestore with `status: 'pending'`

3. **Paystack Payment Gateway**:
   - Desktop: Opens popup (still uses Paystack inline UI)
   - Mobile: Redirects to full Paystack page
   - After payment, Paystack redirects to `/payment/callback?reference=...&userId=...&tournamentId=...`

4. **Server-Side Callback** (`/src/app/payment/callback/route.js`):
   - Runs on server immediately when user is redirected
   - Verifies payment with Paystack using secret key
   - Updates payment record to `status: 'success'` in Firestore
   - **Adds user to tournament participants** (this is the critical part!)
   - Redirects to `/tournament/{id}` if successful
   - Redirects to `/payment-failed` if any step fails

5. **Result**:
   - User lands on tournament page already as a participant
   - No client-side JavaScript required for the join
   - Works 100% on mobile because it's not reliant on client JS execution

### Why This Works on Mobile
- **Old way (broken)**: Client page loads → useEffect runs → POST to API → if JS errors or network slow, no join
- **New way (fixed)**: Server immediately processes redirect → database updated **before** HTML sent to client → user lands on page already joined

### Mobile vs Desktop Behavior
- **Desktop**: Modal popup → Paystack → redirect → server joins → tournament page
- **Mobile**: Full page redirect → Paystack → redirect → server joins → tournament page
- **Server**: Handles all verification and database updates **before** user sees any page

### Database Schema

#### `tournament_payments` collection
```javascript
{
  id: string,              // Auto-generated
  userId: string,          // Firebase user ID
  tournamentId: string,    // Tournament ID
  amount: number,          // Entry fee in GHS
  reference: string,       // Unique payment reference
  status: string,          // 'pending' | 'success' | 'failed'
  currency: string,        // 'GHS'
  paystackResponse: {      // Only for successful payments
    transactionId: number,
    authorization: object,
    amount: number,        // In pesewas (1 GHS = 100 pesewas)
    paidAt: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Key Files

### Frontend
- **`/src/components/PaystackPaymentModal.jsx`** - Payment UI modal that initiates transactions
- **`/src/services/paystackService.js`** - Payment service (initializePayment, createPaymentRecord, etc.)
- **`/src/app/tournament/[id]/page.jsx`** - Tournament page that shows modal and handles payment flow
- **`/src/app/payment/success/page.jsx`** - Success page shown during redirect (optional)
- **`/src/app/payment-failed/page.jsx`** - Error page if payment verification fails

### Backend (Server-Side - The Critical Part!)
- **`/src/app/api/create-transaction/route.js`** - Initialize Paystack transaction
  - Takes payment amount and user details
  - Returns Paystack authorization URL
  - **Used for both desktop and mobile**

- **`/src/app/payment/callback/route.js`** - **THE KEY ENDPOINT** - Server-side redirect handler
  - Receives redirect from Paystack with payment reference
  - Verifies payment with Paystack using secret key (server-only)
  - Updates Firestore payment record
  - **Adds user to tournament participants** ← This is the magic!
  - Redirects to tournament or error page
  - **Runs completely on server before HTML is sent to client**

## Usage

### Checking if User Paid for Tournament
```javascript
import { paystackService } from '@/services/paystackService';

const hasPaid = await paystackService.hasUserPaidForTournament(userId, tournamentId);
```

### Getting Payment Details
```javascript
const payment = await paystackService.getPaymentByReference(reference);
```

## Testing

### Test Mode
1. Use Paystack test keys (pk_test_*, sk_test_*)
2. Use test cards from Paystack documentation:
   - Card: `4084 0343 0343 0343`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Testing Payment Flow
1. Set entry fee on a tournament (admin panel)
2. Try joining the tournament as a non-admin user
3. Complete the payment with test card
4. Verify you're added to the tournament

## Error Handling

The system handles:
- Missing Paystack credentials (logs warning)
- Failed payment verifications
- Duplicate payments (prevents double-joining)
- Network errors during verification
- Invalid payment data

## Security Considerations

1. **Secret Key Protection**: Never expose `PAYSTACK_SECRET_KEY`
2. **Server-Side Verification**: All payments are verified on the backend
3. **Reference Uniqueness**: Each payment gets a unique reference
4. **Status Validation**: Only payments with `status: 'success'` are processed

## Troubleshooting

### "Paystack script not loaded"
- Check that you have internet connection
- Verify the Paystack CDN is accessible
- Check browser console for CSP issues

### Payment verification fails
- Ensure `PAYSTACK_SECRET_KEY` is correct
- Verify API endpoint is accessible
- Check Firestore database permissions

### User not added to tournament after payment
- Check `/api/verify-payment` logs
- Verify `joinTournament` function works
- Check Firestore permissions for `tournament_participants`

## Next Steps

1. Add payment retry logic
2. Implement refund functionality
3. Add payment history to user dashboard
4. Send payment receipts via email
5. Add revenue analytics
