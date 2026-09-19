import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Keep tab pages cached so Capacitor/LAN navigations don't blank-flash.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
