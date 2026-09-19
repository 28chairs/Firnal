import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst, NetworkOnly } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/api\.openai\.com\/.*/i,
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url }) =>
        request.destination === 'document' ||
        url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'firnal-api-cache',
        networkTimeoutSeconds: 10,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
