// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyDg4XhxngLKsuIFNN6tiiNXTUQt-lio3Yg",
  authDomain: "raidarena-31299.firebaseapp.com",
  projectId: "raidarena-31299",
  storageBucket: "raidarena-31299.firebasestorage.app",
  messagingSenderId: "244034931399",
  appId: "1:244034931399:web:233603b3c75caf8ecccce2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);