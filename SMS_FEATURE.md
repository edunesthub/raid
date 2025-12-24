# Bulk SMS Feature - Admin Panel

## Overview
Send bulk SMS messages to all participants in a tournament directly from the admin panel.

## Features

### 1. Send SMS Modal (`SendSMSModal.jsx`)
- Beautiful modal interface for composing SMS messages
- Message character counter (160 char limit)
- Recipient count display
- Status feedback (success/error messages)
- Shows which messages failed (if any)
- Auto-closes after successful send

### 2. Admin Panel Integration
- **New SMS Button** added to Tournament Management
  - Desktop: Icon button in actions row (cyan/message icon)
  - Mobile: SMS button in action buttons grid
- Opens the Send SMS modal when clicked
- Shows tournament name and participant count

### 3. Backend API (`/api/admin/send-sms`)
- Fetches all tournament participants with phone numbers
- Sends SMS via Hubtel API with proper formatting
- Returns detailed report:
  - Number of successful sends
  - Number of failed sends
  - Details of failed messages (phone, error reason)
- Handles Ghana phone number format automatically:
  - `0123456789` → `+2331234567890`
  - `+233123456789` → `+233123456789`
  - `233123456789` → `+233123456789`

### 4. SMS Service (`smsService.js`)
- Client-side service for SMS operations
- `sendBulkSMS(tournamentId, message)` - Main function
- Phone number validation and formatting utilities

## Setup Instructions

### 1. Get Hubtel Credentials
1. Go to https://dashboard.hubtel.com/
2. Navigate to API/Credentials section
3. Get your **Client ID** and **Client Secret**

### 2. Add Environment Variables
Update `.env.local`:
```env
HUBTEL_CLIENT_ID=your_client_id_here
HUBTEL_CLIENT_SECRET=your_client_secret_here
```

### 3. Verify User Phone Numbers
- Users must have phone numbers saved in their profile
- Phone numbers should be in Ghana format (+233 or 0)
- Missing phone numbers are automatically skipped

## How It Works

### User Flow
1. Admin goes to **Tournaments** tab
2. Finds the tournament they want to message
3. Clicks the **SMS button** (cyan message icon)
4. **Send SMS Modal** opens
5. Types message (max 160 characters)
6. Clicks **Send SMS**
7. System fetches all participants with phone numbers
8. Sends SMS to each via Hubtel
9. Shows success report with delivery status

### Data Flow
```
Admin clicks "Send SMS"
    ↓
Modal opens (pre-filled with tournament info)
    ↓
Admin types message + clicks Send
    ↓
POST /api/admin/send-sms
    ↓
API fetches participants from Firestore
    ↓
API formats phone numbers
    ↓
API sends to Hubtel for each phone
    ↓
Hubtel API responds with status
    ↓
API returns summary to modal
    ↓
Modal shows success/failure report
```

## Important Notes

### Character Limit
- **160 characters per SMS**
- Longer messages may be split by Hubtel (will count as multiple SMS)
- Counter shows remaining characters

### Recipient Filtering
- Only participants with phone numbers receive SMS
- Participants without phone numbers are silently skipped
- Count shown in modal = confirmed participant count

### Error Handling
- Invalid phone numbers → skipped with error logged
- Hubtel API failures → included in error report
- Network errors → shown in modal with details

### Sender ID
- All messages sent with **"RaidArena1"** sender ID
- This appears in recipients' phones as the sender name

## Files Created/Modified

### New Files
- `src/services/smsService.js` - SMS service client
- `src/app/admin/components/SendSMSModal.jsx` - Modal component
- `src/app/api/admin/send-sms/route.js` - Backend API endpoint

### Modified Files
- `src/app/admin/components/TournamentManagement.jsx` - Added SMS button & modal integration
- `.env.local` - Added Hubtel credentials

## Testing

1. Go to http://localhost:3000/admin
2. Click "Tournaments" tab
3. Find any tournament with participants
4. Click the cyan "SMS" button
5. Type a test message (max 160 chars)
6. Click "Send SMS"
7. Check the result report

## Troubleshooting

### "SMS service not configured"
- Check that `HUBTEL_CLIENT_ID` and `HUBTEL_CLIENT_SECRET` are in `.env.local`
- Restart dev server after adding env vars

### "No participants with phone numbers found"
- Ensure participants have phone numbers in their profiles
- Check Firestore `users` collection for phone field

### Failed SMS sends
- Check phone number format (should be +233 or 0)
- Verify Hubtel credentials are correct
- Check Hubtel account balance/quota

## API Response Example

```json
{
  "sent": 45,
  "failed": 2,
  "errors": [
    {
      "phone": "0551234567",
      "username": "Player1",
      "error": "Invalid phone format"
    },
    {
      "phone": "+233501234567",
      "username": "Player2",
      "error": "Insufficient balance"
    }
  ]
}
```
