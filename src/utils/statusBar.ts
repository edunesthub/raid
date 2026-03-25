import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const initializeStatusBar = async () => {
  // Only run on native iOS (skip web/android)
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    // Dark style = white icons on black background
    await StatusBar.setStyle({ style: Style.Dark });
    
    // This is the line that actually kills the transparency
    await StatusBar.setBackgroundColor({ color: '#000000' });

    // Optional but recommended: make sure the webview doesn’t draw under the notch
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (error) {
    console.warn('StatusBar plugin failed (probably running in browser)', error);
  }
};