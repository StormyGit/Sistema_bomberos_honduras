import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bomberoshn.incidentes',
  appName: 'Bomberos Incidentes',
  webDir: 'www',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
