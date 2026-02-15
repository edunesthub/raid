// src/services/usernameService.js
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class UsernameService {
  /**
   * Check if username is already taken
   * @param {string} username - Username to check
   * @param {string} excludeUserId - Optional user ID to exclude (for profile updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isUsernameAvailable(username, excludeUserId = null) {
    try {
      const normalizedUsername = username.toLowerCase().trim();

      if (!normalizedUsername) {
        throw new Error('Username cannot be empty');
      }

      // Query for exact match (case-insensitive)
      const usersRef = collection(db, 'users');
      // Check both fields for robust verification
      const q = query(usersRef, where('username_lowercase', '==', normalizedUsername));
      const q2 = query(usersRef, where('username', '==', normalizedUsername));

      const [snap, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);

      const allDocs = [...snap.docs, ...snap2.docs];

      // If no results, username is available
      if (allDocs.length === 0) {
        return true;
      }

      // If updating own profile, exclude current user
      if (excludeUserId) {
        const otherUsers = allDocs.filter(doc => doc.id !== excludeUserId);
        return otherUsers.length === 0;
      }

      // Username is taken
      return false;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw new Error('Failed to check username availability');
    }
  }

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {Object} Validation result with isValid and error message
   */
  validateUsernameFormat(username) {
    const trimmed = username.trim();

    // Check length (3-20 characters)
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    if (trimmed.length > 20) {
      return { isValid: false, error: 'Username must be no more than 20 characters long' };
    }

    // Check for valid characters (alphanumeric, underscore, hyphen)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      };
    }

    // Check if starts with letter or number
    if (!/^[a-zA-Z0-9]/.test(trimmed)) {
      return { isValid: false, error: 'Username must start with a letter or number' };
    }

    // Check for reserved usernames
    const reserved = ['admin', 'root', 'system', 'support', 'help', 'moderator', 'raid', 'raidarena'];
    if (reserved.includes(trimmed.toLowerCase())) {
      return { isValid: false, error: 'This username is reserved' };
    }

    return { isValid: true, error: null };
  }

  /**
   * Generate suggested usernames if taken
   * @param {string} baseUsername - Base username
   * @returns {Promise<Array<string>>} Array of available username suggestions
   */
  async generateSuggestions(baseUsername) {
    const suggestions = [];
    const base = baseUsername.toLowerCase().trim();

    // Generate variations
    const variations = [
      `${base}${Math.floor(Math.random() * 99)}`,
      `${base}_${Math.floor(Math.random() * 999)}`,
      `${base}${new Date().getFullYear()}`,
      `the_${base}`,
      `${base}_gamer`
    ];

    for (const variant of variations) {
      const available = await this.isUsernameAvailable(variant);
      if (available) {
        suggestions.push(variant);
        if (suggestions.length >= 3) break;
      }
    }

    return suggestions;
  }
}

export const usernameService = new UsernameService();