import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
    try {
        const { userId, adminId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verify requester is an admin
        if (!adminId) {
            return NextResponse.json({ error: 'Admin ID is required for verification' }, { status: 401 });
        }

        const adminDoc = await adminDb.collection('users').doc(adminId).get();
        const adminData = adminDoc.data();

        if (!adminData || (!adminData.isAdmin && adminData.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        console.log(`[ADMIN] Deleting user: ${userId} requested by admin: ${adminId}`);

        // 1. Delete from Firebase Auth
        try {
            await adminAuth.deleteUser(userId);
            console.log(`[ADMIN] Auth account deleted for ${userId}`);
        } catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                console.warn(`[ADMIN] User ${userId} not found in Auth, continuing with database cleanup.`);
            } else {
                throw authError;
            }
        }

        // 2. Delete from Firestore 'users' collection
        await adminDb.collection('users').doc(userId).delete();
        console.log(`[ADMIN] Firestore document deleted for ${userId}`);

        // 3. Delete from 'userStats' collection
        await adminDb.collection('userStats').doc(userId).delete();
        console.log(`[ADMIN] UserStats deleted for ${userId}`);

        // 4. Cleanup related collections
        const collectionsToCleanup = [
            'tournament_participants',
            'notifications',
            'transactions',
            'team_members',
            'messages'
        ];

        for (const collName of collectionsToCleanup) {
            try {
                const q = adminDb.collection(collName).where('userId', '==', userId);
                const snapshot = await q.get();
                if (!snapshot.empty) {
                    // Process in batches of 400 to stay under Firestore's 500 limit
                    const docs = snapshot.docs;
                    for (let i = 0; i < docs.length; i += 400) {
                        const batch = adminDb.batch();
                        const chunk = docs.slice(i, i + 400);
                        chunk.forEach((doc) => batch.delete(doc.ref));
                        await batch.commit();
                    }
                    console.log(`[ADMIN] Cleaned up ${snapshot.size} records from ${collName}`);
                }
            } catch (e) {
                console.warn(`[ADMIN] Error cleaning up ${collName}:`, e.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('[ADMIN] Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
