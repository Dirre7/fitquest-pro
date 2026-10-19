import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitquestpro.app',
  appName: 'FitQuest Pro',
  webDir: 'dist',
  backgroundColor: '#09090b',
  server: {
    androidScheme: 'https'
  }
};

export default config;
