// scripts/initializeUserStats.js
// Run this once to calculate all user statistics from existing data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDg4XhxngLKsuIFNN6tiiNXTUQt-lio3Yg",
  authDomain: "raidarena-31299.firebaseapp.com",
  projectId: "raidarena-31299",
  storageBucket: "raidarena-31299.firebasestorage.app",
  messagingSenderId: "244034931399",
  appId: "1:244034931399:web:233603b3c75caf8ecccce2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function calculateUserStats(userId) {
  console.log(`Processing user: ${userId}`);

  try {
    // Get all tournament participations for this user
    const participantsSnapshot = await getDocs(collection(db, 'tournament_participants'));
    const userParticipations = participantsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.userId === userId);

    const stats = {
      tournamentsPlayed: 0,
      tournamentsWon: 0,
      totalEarnings: 0,
      placements: {
        first: 0,
        second: 0,
        third: 0
      },
      bestPlacement: null
    };

    // Process each participation
    for (const participation of userParticipations) {
      const tournamentId = participation.tournamentId;
      
      // Get tournament data
      const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (!tournamentDoc.exists()) continue;

      const tournamentData = tournamentDoc.data();

      // Only count completed tournaments
      if (tournamentData.status !== 'completed') continue;

      stats.tournamentsPlayed++;

      // Check if user won (winnerId)
      if (tournamentData.winnerId === userId) {
        stats.tournamentsWon++;
        stats.placements.first++;
        stats.totalEarnings += (tournamentData.first_place || 0);
        
        if (!stats.bestPlacement || 1 < stats.bestPlacement) {
          stats.bestPlacement = 1;
        }
      }

      // Check if user got 2nd place
      if (tournamentData.secondPlaceId === userId) {
        stats.placements.second++;
        stats.totalEarnings += (tournamentData.second_place || 0);
        
        if (!stats.bestPlacement || 2 < stats.bestPlacement) {
          stats.bestPlacement = 2;
        }
      }

      // Check if user got 3rd place
      if (tournamentData.thirdPlaceId === userId) {
        stats.placements.third++;
        stats.totalEarnings += (tournamentData.third_place || 0);
        
        if (!stats.bestPlacement || 3 < stats.bestPlacement) {
          stats.bestPlacement = 3;
        }
      }

      // Also check placement field in participation
      if (participation.placement) {
        if (participation.placement === 1 && !tournamentData.winnerId) {
          stats.tournamentsWon++;
          stats.placements.first++;
          stats.totalEarnings += (tournamentData.first_place || 0);
          
          if (!stats.bestPlacement) {
            stats.bestPlacement = 1;
          }
        }
      }
    }

    // Calculate win rate
    stats.winRate = stats.tournamentsPlayed > 0 
      ? Math.round((stats.tournamentsWon / stats.tournamentsPlayed) * 1000) / 10
      : 0;

    // Save to userStats collection
    const statsRef = doc(db, 'userStats', userId);
    await setDoc(statsRef, {
      userId,
      ...stats,
      currentStreak: 0,
      lastUpdated: serverTimestamp(),
      lastRecalculated: new Date().toISOString()
    }, { merge: true });

    console.log(`✓ User ${userId}: Played=${stats.tournamentsPlayed}, Won=${stats.tournamentsWon}, Earnings=₵${stats.totalEarnings}`);
    
    return { success: true, stats };
  } catch (error) {
    console.error(`✗ Error processing user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

async function initializeAllUserStats() {
  console.log('=== Starting User Stats Initialization ===\n');

  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    console.log(`Found ${totalUsers} users to process\n`);

    let processed = 0;
    let failed = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const result = await calculateUserStats(userId);

      if (result.success) {
        processed++;
      } else {
        failed++;
      }

      // Progress indicator
      if ((processed + failed) % 10 === 0) {
        console.log(`\nProgress: ${processed + failed}/${totalUsers} users processed (${processed} success, ${failed} failed)\n`);
      }
    }

    console.log('\n=== Initialization Complete ===');
    console.log(`Total: ${totalUsers}`);
    console.log(`Processed: ${processed}`);
    console.log(`Failed: ${failed}`);
    console.log('================================\n');

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run the script
console.log('Starting stats initialization...\n');
initializeAllUserStats()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });