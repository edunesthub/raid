// src/lib/firebaseAdmin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin only if it hasn't been initialized
export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp(firebaseAdminConfig);
  }
  return getApps()[0];
}

export const adminAuth = getAuth(getFirebaseAdmin());
export const adminDb = getFirestore(getFirebaseAdmin());