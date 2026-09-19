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

const DISCONNECTED: GoogleConnectionState = { connected: false };
const SERVER_SNAPSHOT: GoogleConnectionState = DISCONNECTED;

let clientSnapshot: GoogleConnectionState = DISCONNECTED;

function signature(state: GoogleConnectionState) {
  return `${state.connected}|${state.email ?? ''}|${state.connectedAt ?? ''}`;
}

function readFromStorage(): GoogleConnectionState {
  if (typeof window === 'undefined') return DISCONNECTED;

  try {
    const raw = localStorage.getItem(GOOGLE_CONNECTED_KEY);
    if (!raw) return DISCONNECTED;
    const parsed = JSON.parse(raw) as GoogleConnectionState;
    if (!parsed || typeof parsed !== 'object') return DISCONNECTED;
    return {
      connected: Boolean(parsed.connected),
      email: parsed.email,
      connectedAt: parsed.connectedAt,
    };
  } catch {
    return DISCONNECTED;
  }
}

/** Cached snapshot for useSyncExternalStore — same reference until data changes. */
export function getGoogleConnectionState(): GoogleConnectionState {
  const next = readFromStorage();
  if (signature(clientSnapshot) === signature(next)) {
    return clientSnapshot;
  }
  clientSnapshot = next.connected ? next : DISCONNECTED;
  return clientSnapshot;
}

export function getGoogleConnectionServerSnapshot(): GoogleConnectionState {
  return SERVER_SNAPSHOT;
}

export function setGoogleConnected(email?: string): void {
  if (typeof window === 'undefined') return;

  const state: GoogleConnectionState = {
    connected: true,
    email,
    connectedAt: new Date().toISOString(),
  };
  localStorage.setItem(GOOGLE_CONNECTED_KEY, JSON.stringify(state));
  clientSnapshot = state;
  window.dispatchEvent(new Event('google-connection-change'));
}

export function setGoogleDisconnected(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(GOOGLE_CONNECTED_KEY);
  clientSnapshot = DISCONNECTED;
  window.dispatchEvent(new Event('google-connection-change'));
}

/** useSyncExternalStore subscribe — notify with no args; readers call getSnapshot. */
export function subscribeToGoogleConnection(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => onStoreChange();
  window.addEventListener('google-connection-change', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('google-connection-change', handler);
    window.removeEventListener('storage', handler);
  };
}
