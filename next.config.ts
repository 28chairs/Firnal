import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV !== 'production',
});

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    // Keep tab pages cached so Capacitor/LAN navigations don't blank-flash.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // Disable the dev indicator overlay to prevent it from capturing pointer events
  // on touch devices / Capacitor. Errors still surface in the console.
  devIndicators: false,
};

export default withSerwist(nextConfig);
