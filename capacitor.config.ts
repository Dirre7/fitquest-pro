import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitquest.pro',
  appName: 'FitQuest Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
