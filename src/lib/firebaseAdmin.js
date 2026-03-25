import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getAdminApp = () => {
    if (getApps().length > 0) return getApps()[0];

    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            console.warn('[FIREBASE ADMIN] Missing credentials. Admin features may not work.');
            return null;
        }

        return initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } catch (error) {
        console.error('[FIREBASE ADMIN] Init error:', error.message);
        return null;
    }
};

// Lazy getters to avoid "Default app does not exist" errors during build
export const getAdminDb = () => {
    const app = getAdminApp();
    return app ? getFirestore(app) : null;
};

export const getAdminAuth = () => {
    const app = getAdminApp();
    return app ? getAuth(app) : null;
};
