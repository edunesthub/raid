// src/utils/avatars.ts

/**
 * List of default avatars for users to pick from
 */
export const GENERIC_AVATARS = [
  '/assets/raid1.svg',
  '/assets/raid2.svg',
  '/assets/tournament-thumb.png',
  '/assets/raid-logo.png',
];

/**
 * Get a default avatar URL or SVG based on userId
 */
export const getDefaultAvatar = (userId: string | undefined): string => {
  if (!userId) return GENERIC_AVATARS[0];
  
  // Use a deterministic seed from userId to pick one of the default avatars
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % GENERIC_AVATARS.length;
  return GENERIC_AVATARS[index];
};
