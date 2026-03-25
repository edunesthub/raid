// src/services/authValidation.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const authValidation = {
  /**
   * Check if email is already registered
   */
  async isEmailAvailable(email) {
    try {
      const normalized = email.toLowerCase().trim();
      if (!normalized) return false;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normalized));
      const snapshot = await getDocs(q);
      return snapshot.empty; // true if available, false if taken
    } catch (error) {
      console.error('Error checking email availability:', error);
      throw new Error('Failed to validate email');
    }
  },

  /**
   * Check if phone number is already registered
   */
  async isPhoneAvailable(phone) {
    try {
      const normalized = phone.trim();
      if (!normalized) return false;
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('phone', '==', normalized));
      const q2 = query(usersRef, where('contact', '==', normalized));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      return snap1.empty && snap2.empty; // true if available, false if taken
    } catch (error) {
      console.error('Error checking phone availability:', error);
      throw new Error('Failed to validate phone number');
    }
  },

  /**
   * Validate email format
   */
  validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  },

  /**
   * Calculate password strength (0-5)
   */
  calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  },

  /**
   * Get password strength label and color
   */
  getPasswordStrengthInfo(strength) {
    if (strength <= 2) {
      return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    } else if (strength <= 3) {
      return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    } else {
      return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' };
    }
  },

  // =========================
  // Username Validation
  // =========================

  /**
   * Check if username is already taken
   * @param {string} username
   * @param {string} excludeUserId - optional, for profile updates
   */
  async isUsernameAvailable(username, excludeUserId = null) {
    try {
      const normalized = username.toLowerCase().trim();
      if (!normalized) throw new Error('Username cannot be empty');

      const usersRef = collection(db, 'users');
      // We check both 'username' and 'username_lowercase' for backward compatibility
      // and future-proofing. Firestore doesn't support 'OR' queries well across different fields 
      // with '==' in older SDKs, but we can do two queries or check username_lowercase.
      const q = query(usersRef, where('username_lowercase', '==', normalized));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        if (excludeUserId) {
          const others = snapshot.docs.filter(doc => doc.id !== excludeUserId);
          if (others.length > 0) return false;
        } else {
          return false;
        }
      }

      // Also check against literal username for older records
      const q2 = query(usersRef, where('username', '==', username.trim()));
      const snapshot2 = await getDocs(q2);

      if (!snapshot2.empty) {
        if (excludeUserId) {
          const others = snapshot2.docs.filter(doc => doc.id !== excludeUserId);
          return others.length === 0;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw new Error('Failed to check username availability');
    }
  },

  /**
   * Validate username format
   */
  validateUsernameFormat(username) {
    const trimmed = username.trim();

    if (trimmed.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    if (trimmed.length > 20) {
      return { isValid: false, error: 'Username must be no more than 20 characters long' };
    }

    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      };
    }

    if (!/^[a-zA-Z0-9]/.test(trimmed)) {
      return { isValid: false, error: 'Username must start with a letter or number' };
    }

    const reserved = ['admin', 'root', 'system', 'support', 'help', 'moderator', 'raid', 'raidarena'];
    if (reserved.includes(trimmed.toLowerCase())) {
      return { isValid: false, error: 'This username is reserved' };
    }

    return { isValid: true, error: null };
  },

  /**
   * Generate username suggestions
   */
  async generateUsernameSuggestions(baseUsername) {
    const suggestions = [];
    const base = baseUsername.toLowerCase().trim();

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
};
