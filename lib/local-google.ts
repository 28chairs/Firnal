/**
 * Local storage for Google Calendar connection state.
 * Tokens are stored in httpOnly cookies (server-side).
 * This file only tracks UI connection state in localStorage.
 */

const GOOGLE_CONNECTED_KEY = 'firnal:google:connected';

export type GoogleConnectionState = {
  connected: boolean;
  email?: string;
  connectedAt?: string;
};

function getInitialState(): GoogleConnectionState {
  return { connected: false };
}

export function getGoogleConnectionState(): GoogleConnectionState {
  if (typeof window === 'undefined') return getInitialState();

  try {
    const raw = localStorage.getItem(GOOGLE_CONNECTED_KEY);
    if (!raw) return getInitialState();
    return JSON.parse(raw) as GoogleConnectionState;
  } catch {
    return getInitialState();
  }
}

export function setGoogleConnected(email?: string): void {
  if (typeof window === 'undefined') return;

  const state: GoogleConnectionState = {
    connected: true,
    email,
    connectedAt: new Date().toISOString(),
  };
  localStorage.setItem(GOOGLE_CONNECTED_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('google-connection-change', { detail: state }));
}

export function setGoogleDisconnected(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(GOOGLE_CONNECTED_KEY);
  window.dispatchEvent(
    new CustomEvent('google-connection-change', { detail: { connected: false } })
  );
}

export function subscribeToGoogleConnection(
  callback: (state: GoogleConnectionState) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    callback((e as CustomEvent<GoogleConnectionState>).detail);
  };

  window.addEventListener('google-connection-change', handler);
  return () => window.removeEventListener('google-connection-change', handler);
}
