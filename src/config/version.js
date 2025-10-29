// src/config/version.js

/**
 * App Version Configuration
 * 
 * IMPORTANT: When you update your app, increment this version number.
 * This will trigger the service worker to update and show the update prompt to users.
 * 
 * Version format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes
 * - MINOR: New features
 * - PATCH: Bug fixes
 */

export const APP_VERSION = 'v1.0.4';
export const BUILD_DATE = new Date().toISOString();

// Update this in public/sw.js CACHE_NAME when you deploy
// Example: const CACHE_NAME = 'raid-arena-v1.0.0';

export const RELEASE_NOTES = {
  'v1.0.4': [
    'Initial release',
    'Tournament system',
    'League system',
    'Clan features',
    'PWA support',
    'Offline functionality',
    'Auto-update mechanism'
  ]
};

// Helper to check if update is needed
export function shouldUpdate(currentVersion, newVersion) {
  if (!currentVersion || !newVersion) return false;
  
  const current = currentVersion.replace('v', '').split('.').map(Number);
  const latest = newVersion.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (latest[i] > current[i]) return true;
    if (latest[i] < current[i]) return false;
  }
  
  return false;
}