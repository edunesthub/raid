# Firebase Authentication Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "raid-arena")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add support email

## Step 3: Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your location
5. Click "Enable"

## Step 4: Set Up Security Rules

In Firestore, go to "Rules" tab and add:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /clans/{clanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    match /tournaments/{tournamentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

## Step 5: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with a nickname
6. Copy the configuration values

## Step 6: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 7: Set Up Firebase Admin (Optional - for Server-side)

1. In Project Settings, go to "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file
4. Add these to your `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

## Step 8: Install Dependencies

```bash
npm install firebase
# or
yarn add firebase
```

If using Firebase Admin SDK:
```bash
npm install firebase-admin
# or
yarn add firebase-admin
```

## Step 9: Deploy Security Rules

After setting up your Firestore, make sure to publish the security rules from Step 4.

## Step 10: Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/auth/signup`
3. Create a test account
4. Verify you can sign in and out

## Important Security Notes

- **Never commit** `.env.local` to version control
- Add `.env.local` to your `.gitignore`
- Keep your Firebase Admin private key secure
- Use Firebase Security Rules to protect your data
- Enable Firebase App Check for production

## Firestore Collections Structure

Your app will use these collections:

### users
```json
{
  "userId": {
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "avatarUrl": "string",
    "role": "user | admin",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### clans
```json
{
  "clanId": {
    "name": "string",
    "tag": "string",
    "description": "string",
    "gameId": "string",
    "ownerId": "string",
    "members": ["userId1", "userId2"],
    "isPublic": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### tournaments
```json
{
  "tournamentId": {
    "title": "string",
    "game": "string",
    "description": "string",
    "prizePool": "number",
    "entryFee": "number",
    "maxPlayers": "number",
    "currentPlayers": "number",
    "status": "string",
    "startDate": "timestamp",
    "endDate": "timestamp",
    "participants": ["userId1", "userId2"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all environment variables are correctly set
- Restart your development server after adding env variables

### "Firebase: API key not valid"
- Verify your API key in Firebase Console
- Make sure you're using the Web API key

### "Permission denied" errors
- Check your Firestore security rules
- Ensure the user is authenticated
- Verify the user has the correct permissions

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure authentication methods
3. ✅ Add environment variables
4. ✅ Test sign up and login
5. 🔄 Customize user profiles
6. 🔄 Add more authentication features
7. 🔄 Deploy to production

For more information, visit the [Firebase Documentation](https://firebase.google.com/docs).