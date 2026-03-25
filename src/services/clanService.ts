// src/services/clanService.ts
import { Clan, ClanMember } from '@/types/clan';
// @ts-ignore - Ignoring missing data file for now
import { defaultGames } from '@/data/defaultClans';

class ClanService {
  async joinClan(clanId: string, userId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to join clan:', error);
      throw new Error('Failed to join clan');
    }
  }

  async createClan(clanData: Partial<Clan> & { ownerId: string, imageFile?: File }): Promise<Clan> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let imageUrl = clanData.avatarUrl;
      if (clanData.imageFile) {
        const imageFile = clanData.imageFile;
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
      
      const newClan: Clan = {
        id: `clan_${Date.now()}`,
        name: clanData.name || 'New Clan',
        tag: clanData.tag || '',
        description: clanData.description || '',
        leaderId: clanData.ownerId,
        members: [clanData.ownerId],
        avatarUrl: imageUrl,
        createdAt: new Date(),
      };

      return newClan;
    } catch (error) {
      console.error('Failed to create clan:', error);
      throw new Error('Failed to create clan');
    }
  }

  async getClanById(clanId: string): Promise<Clan | null> {
    // Check default clans first
    const defaultClan = defaultGames
      .flatMap((game: any) => game.defaultClans)
      .find((clan: any) => clan.id === clanId);
    
    if (defaultClan) return defaultClan as Clan;

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return null;
    } catch (error) {
      console.error('Failed to fetch clan:', error);
      throw new Error('Failed to fetch clan');
    }
  }

  async leaveClan(clanId: string, userId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to leave clan:', error);
      throw new Error('Failed to leave clan');
    }
  }

  async updateClan(clanId: string, updates: Partial<Clan>): Promise<Partial<Clan>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...updates };
    } catch (error) {
      console.error('Failed to update clan:', error);
      throw new Error('Failed to update clan');
    }
  }

  async kickMember(clanId: string, memberId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to kick member:', error);
      throw new Error('Failed to kick member');
    }
  }

  async transferOwnership(clanId: string, newOwnerId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      throw new Error('Failed to transfer ownership');
    }
  }
}

export const clanService = new ClanService();