'use client';

import { useEffect } from 'react';
import { detectBrowserTimezone } from '@/lib/timezone';

/** Sync browser timezone to profile once per session. */
export function TimezoneSync() {
  useEffect(() => {
    const timezone = detectBrowserTimezone();

    fetch('/api/profile/timezone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    }).catch(() => {
      // Non-blocking; profile may not exist until migration runs
    });
  }, []);

  return null;
}
