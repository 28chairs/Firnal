import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.firnal.journal',
  appName: 'FIRNAL',
  webDir: 'public',
  // Match cream journal so WKWebView never flashes system white between routes.
  backgroundColor: '#FAF9F6',
  server: {
    // Dev: load the Next.js app from the Mac LAN so the phone gets live UI.
    // Switch off / point at production URL for release builds.
    url: 'http://192.168.1.11:3000',
    cleartext: true,
  },
  ios: {
    backgroundColor: '#FAF9F6',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#FAF9F6',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAF9F6',
    },
  },
};

export default config;
