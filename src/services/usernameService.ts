// src/services/usernameService.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  DocumentData,
  QuerySnapshot 
} from "firebase/firestore";

class UsernameService {
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string, excludeUserId: string | null = null): Promise<boolean> {
    if (!username || username.length < 3) return false;
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username_lowercase", "==", username.toLowerCase()), limit(1));
      const querySnapshot: QuerySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return true;
      
      if (excludeUserId) {
        const foundUser = querySnapshot.docs[0];
        return foundUser.id === excludeUserId;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  }

  /**
   * Simple regex for username format
   */
  validateUsernameFormat(username: string): { isValid: boolean; error?: string } {
    if (!username) return { isValid: false, error: "Username is required" };
    if (username.length < 3) return { isValid: false, error: "Username must be at least 3 characters" };
    if (username.length > 20) return { isValid: false, error: "Username cannot exceed 20 characters" };
    
    // Alphanumeric, underscores, dots
    const regex = /^[a-zA-Z0-9._]+$/;
    if (!regex.test(username)) {
      return { isValid: false, error: "Username can only contain letters, numbers, dots, and underscores" };
    }
    
    return { isValid: true };
  }

  /**
   * Suggest available usernames based on a base name
   */
  async generateSuggestions(baseUsername: string): Promise<string[]> {
    const suggestions: string[] = [];
    const sanitized = baseUsername.replace(/[^a-zA-Z0-9]/g, "").substring(0, 15);
    
    if (!sanitized) return ["raider_" + Math.floor(Math.random() * 9999)];

    // Add random numbers
    for (let i = 0; i < 3; i++) {
      const suffix = Math.floor(Math.random() * 999);
      const suggested = `${sanitized}${suffix}`;
      const isAvailable = await this.isUsernameAvailable(suggested);
      if (isAvailable) suggestions.push(suggested);
    }
    
    return suggestions;
  }
}

export const usernameService = new UsernameService();