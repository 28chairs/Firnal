import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.firnal.journal',
  appName: 'FIRNAL',
  webDir: 'public',
  server: {
    // Dev: load the Next.js app from the Mac LAN so the phone gets live UI.
    // Switch off / point at production URL for release builds.
    url: 'http://192.168.1.11:3000',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#FAF9F6',
    },
    StatusBar: {
      style: 'LIGHT',
    },
  },
};

export default config;
