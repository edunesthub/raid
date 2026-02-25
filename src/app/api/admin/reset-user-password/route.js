import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
    try {
        const { userId, newPassword, adminId } = await request.json();
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();

        if (!adminDb || !adminAuth) {
            return NextResponse.json({ error: 'Firebase Admin not initialized.' }, { status: 500 });
        }

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'User ID and logic are required' }, { status: 400 });
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

        console.log(`[ADMIN] Resetting password for user: ${userId} requested by admin: ${adminId}`);

        // Update password in Firebase Auth
        await adminAuth.updateUser(userId, {
            password: newPassword
        });

        return NextResponse.json({
            success: true,
            message: 'User password updated successfully in Firebase Auth'
        });
    } catch (error) {
        console.error('[ADMIN] Error resetting password:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
