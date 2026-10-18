import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitquest.pro',
  appName: 'FitQuest Pro',
  webDir: 'dist',
  backgroundColor: '#09090b',
  server: {
    androidScheme: 'https'
  }
};

export default config;
