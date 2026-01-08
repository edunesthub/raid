const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

(async () => {
  try {
    const tournamentsSnapshot = await db.collection('tournaments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log('\n=== TOURNAMENTS IN DATABASE ===\n');
    tournamentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('ID:', doc.id);
      console.log('Name:', data.name);
      console.log('Status:', data.status);
      console.log('Participants:', data.participantIds?.length || 0);
      console.log('Participant IDs:', data.participantIds || []);
      console.log('Created:', data.createdAt?.toDate());
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
