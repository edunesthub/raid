import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// This endpoint adds admin accounts to all tournaments
export async function POST(request) {
  try {
    const { adminEmail } = await request.json();

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      );
    }

    // Get the admin user
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', adminEmail)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    const adminUser = usersSnapshot.docs[0];
    const adminId = adminUser.id;
    const adminData = adminUser.data();

    console.log(`Adding admin ${adminEmail} (${adminId}) to all tournaments...`);

    // Get all tournaments
    const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'));
    let addedCount = 0;

    // Add admin to each tournament
    for (const tournamentDoc of tournamentsSnapshot.docs) {
      const tournamentId = tournamentDoc.id;
      const tournamentData = tournamentDoc.data();
      const participantId = `${tournamentId}_${adminId}`;

      const participantRef = doc(db, 'tournament_participants', participantId);
      const participantSnap = await getDocs(query(
        collection(db, 'tournament_participants'),
        where('tournamentId', '==', tournamentId),
        where('userId', '==', adminId)
      ));

      if (participantSnap.empty) {
        // Add admin as participant
        await setDoc(participantRef, {
          tournamentId,
          userId: adminId,
          username: adminData.username || adminData.email,
          joinedAt: serverTimestamp(),
          inGameName: `${adminData.username || 'Admin'} (Admin)`,
          isAdmin: true,
          role: adminData.adminRole || 'admin'
        });
        console.log(`✓ Added to ${tournamentData.tournament_name || tournamentId}`);
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added admin to ${addedCount} tournaments`,
      addedCount
    });
  } catch (error) {
    console.error('Error adding admin to tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to add admin to tournaments' },
      { status: 500 }
    );
  }
}
