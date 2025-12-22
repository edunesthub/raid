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

### Flow
1. User clicks "Join Tournament" button
2. If tournament has an entry fee:
   - `PaystackPaymentModal` appears
   - User reviews payment details
   - Clicks "Pay" to initiate Paystack payment
3. Paystack payment window opens
4. After successful payment:
   - Payment is verified via `/api/verify-payment` endpoint
   - Payment record is saved to Firestore with `status: 'success'`
   - User is automatically added to tournament
   - Notification is created
   - Modal closes

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
- **`/src/components/PaystackPaymentModal.jsx`** - Payment UI modal
- **`/src/services/paystackService.js`** - Payment service logic
- **`/src/app/tournament/[id]/page.jsx`** - Tournament page with payment integration

### Backend
- **`/src/app/api/verify-payment/route.js`** - Payment verification API

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
