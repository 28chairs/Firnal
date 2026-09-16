'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export function NativeShell({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [bootSlow, setBootSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!Capacitor.isNativePlatform()) return;
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#FAF9F6' });
      } catch {
        /* web / unsupported */
      }
      try {
        await SplashScreen.hide();
      } catch {
        /* ignore */
      }
    }

    void setup();

    const slowTimer = window.setTimeout(() => {
      if (!cancelled) setBootSlow(true);
    }, 2500);

    async function ping() {
      try {
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
        if (!cancelled) {
          setOffline(!res.ok);
          if (res.ok) setBootSlow(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      }
    }

    void ping();
    const onOnline = () => {
      setOffline(false);
      void ping();
    };
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      cancelled = true;
      window.clearTimeout(slowTimer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <>
      {(offline || bootSlow) && (
        <div className="sticky top-0 z-50 border-b border-border bg-amber-50 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-center text-xs text-amber-950">
          {offline
            ? 'Can’t reach your Mac server. Keep FIRNAL running at http://192.168.1.11:3000 on the same Wi‑Fi.'
            : 'Still loading from your Mac…'}
        </div>
      )}
      {children}
    </>
  );
}
