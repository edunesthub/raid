// src/services/smsService.ts
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, DocumentData, QuerySnapshot } from 'firebase/firestore';

export const smsService = {
  /**
   * Fetch participants with phone numbers (client-side)
   */
  async getParticipantsWithPhones(tournamentId: string) {
    try {
      const participants: any[] = [];
      const userIds = new Set<string>();

      // Query participants for this tournament
      const participantsRef = collection(db, 'tournament_participants');
      const q = query(participantsRef, where('tournamentId', '==', tournamentId));
      const participantsSnapshot: QuerySnapshot = await getDocs(q);

      // Collect user IDs
      participantsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userIds.add(data.userId);
        }
      });

      // Fetch user phone numbers
      for (const userId of Array.from(userIds)) {
        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.phone) {
              participants.push({
                userId,
                username: userData.username || 'User',
                phone: userData.phone,
              });
            }
          }
        } catch (e: any) {
          console.warn(`Failed to fetch user ${userId}:`, e.message);
        }
      }

      return participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },

  /**
   * Send bulk SMS to tournament participants
   */
  async sendBulkSMS(tournamentId: string, message: string, participants: any[] = []) {
    try {
      let recipientList = participants;
      if (!recipientList || recipientList.length === 0) {
        recipientList = await this.getParticipantsWithPhones(tournamentId);
      }

      if (!recipientList || recipientList.length === 0) {
        throw new Error('No participants with phone numbers found');
      }

      const response = await fetch('/api/admin/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          participants: recipientList,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send SMS');
      }

      return await response.json();
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  },

  isValidPhoneNumber(phone: string) {
    const ghanaRegex = /^(\+233|0)[2-9]\d{8}$/;
    return ghanaRegex.test(phone.replace(/\s/g, ''));
  },

  formatPhoneNumber(phone: string) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+233${cleaned.substring(1)}`;
    }
    return `+${cleaned}`;
  },
};
