// src/services/smsService.js
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export const smsService = {
  /**
   * Fetch participants with phone numbers (client-side)
   */
  async getParticipantsWithPhones(tournamentId) {
    try {
      const participants = [];
      const userIds = new Set();

      // Query participants for this tournament
      const participantsRef = collection(db, 'tournament_participants');
      const q = query(participantsRef, where('tournamentId', '==', tournamentId));
      const participantsSnapshot = await getDocs(q);

      // Collect user IDs
      participantsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userIds.add(data.userId);
        }
      });

      console.log(`Found ${userIds.size} participants for tournament ${tournamentId}`);

      // Fetch user phone numbers
      for (const userId of userIds) {
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
        } catch (e) {
          console.warn(`Failed to fetch user ${userId}:`, e.message);
        }
      }

      console.log(`Found ${participants.length} participants with phone numbers`);
      return participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },

  /**
   * Send bulk SMS to tournament participants
   * @param {string} tournamentId - Tournament ID (not used - participants sent directly)
   * @param {string} message - Message to send
   * @param {Array} participants - Array of {userId, username, phone}
   * @returns {Promise<{success: boolean, sent: number, failed: number, errors: Array}>}
   */
  async sendBulkSMS(tournamentId, message, participants = []) {
    try {
      // If participants not provided, fetch them
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  },

  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  isValidPhoneNumber(phone) {
    // Ghana phone format: +233XXXXXXXXX or 0XXXXXXXXX
    const ghanaRegex = /^(\+233|0)[2-9]\d{8}$/;
    return ghanaRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Format phone number to international format
   * @param {string} phone - Phone number
   * @returns {string}
   */
  formatPhoneNumber(phone) {
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
