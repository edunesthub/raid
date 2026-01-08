const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

(async () => {
  try {
    console.log('Starting: Adding admin accounts to all tournaments...\n');

    // Get the admin user by email
    const adminUsersSnapshot = await db.collection('users')
      .where('email', '==', 'admin@raidarena.com')
      .get();

    if (adminUsersSnapshot.empty) {
      console.log('Admin account admin@raidarena.com not found!');
      process.exit(1);
    }

    const adminIds = adminUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      username: doc.data().username,
      email: doc.data().email,
      adminRole: doc.data().adminRole
    }));

    console.log('Found admin account:', adminIds);

    if (adminIds.length === 0) {
      console.log('No admin accounts found!');
      process.exit(0);
    }

    // Get all tournaments
    const tournamentsSnapshot = await db.collection('tournaments').get();
    console.log(`Found ${tournamentsSnapshot.docs.length} tournaments\n`);

    let addedCount = 0;

    // For each tournament, add admin users as participants if not already there
    for (const tournamentDoc of tournamentsSnapshot.docs) {
      const tournamentId = tournamentDoc.id;
      const tournamentData = tournamentDoc.data();

      for (const admin of adminIds) {
        const participantId = `${tournamentId}_${admin.id}`;
        const participantRef = db.collection('tournament_participants').doc(participantId);
        const participantSnap = await participantRef.get();

        if (!participantSnap.exists()) {
          // Add admin as participant
          await participantRef.set({
            tournamentId,
            userId: admin.id,
            username: admin.username,
            joinedAt: admin.firestore.Timestamp.now(),
            inGameName: `${admin.username} (Admin)`,
            isAdmin: true,
            role: admin.adminRole
          });
          console.log(`✓ Added ${admin.username} (${admin.adminRole}) to tournament ${tournamentData.tournament_name || tournamentId}`);
          addedCount++;
        }
      }
    }

    console.log(`\n✅ Successfully added admins to tournaments. Total entries created: ${addedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
