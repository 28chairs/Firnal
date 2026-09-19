import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

export default nextConfig;
