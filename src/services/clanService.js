import { defaultGames } from '@/data/defaultClans';

class ClanService {
  async joinClan(clanId, userId) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success
      return true;
    } catch (error) {
      console.error('Failed to join clan:', error);
      throw new Error('Failed to join clan');
    }
  }

  async createClan(clanData) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let imageUrl = clanData.imageUrl;
      if (clanData.imageUrl && typeof clanData.imageUrl !== 'string') {
        const imageFile = clanData.imageUrl;
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
      
      const newClan = {
        ...clanData,
        id: `clan_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [clanData.ownerId],
        isOfficial: false,
        level: 1,
        imageUrl: imageUrl,
      };

      return newClan;
    } catch (error) {
      console.error('Failed to create clan:', error);
      throw new Error('Failed to create clan');
    }
  }

  async getClanById(clanId) {
    // Check default clans first
    const defaultClan = defaultGames
      .flatMap(game => game.defaultClans)
      .find(clan => clan.id === clanId);
    
    if (defaultClan) return defaultClan;

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return null;
    } catch (error) {
      console.error('Failed to fetch clan:', error);
      throw new Error('Failed to fetch clan');
    }
  }

  async leaveClan(clanId, userId) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to leave clan:', error);
      throw new Error('Failed to leave clan');
    }
  }

  async updateClan(clanId, updates) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...updates };
    } catch (error) {
      console.error('Failed to update clan:', error);
      throw new Error('Failed to update clan');
    }
  }

  async kickMember(clanId, memberId) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to kick member:', error);
      throw new Error('Failed to kick member');
    }
  }

  async transferOwnership(clanId, newOwnerId) {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      throw new Error('Failed to transfer ownership');
    }
  }
}

export const clanService = new ClanService();