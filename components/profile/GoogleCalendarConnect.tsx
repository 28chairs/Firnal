'use client';

import { useEffect, useReducer, useSyncExternalStore, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Check, Loader2, Unlink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getGoogleConnectionState,
  setGoogleConnected,
  setGoogleDisconnected,
  subscribeToGoogleConnection,
} from '@/lib/local-google';

type ConnectionStatus = 'unknown' | 'connected' | 'disconnected' | 'loading';

type State = {
  status: ConnectionStatus;
  email: string | undefined;
  error: string | null;
  urlCleaned: boolean;
};

type Action =
  | { type: 'SET_CONNECTED'; email?: string }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'URL_CLEANED' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, status: 'connected', email: action.email, error: null };
    case 'SET_DISCONNECTED':
      return { ...state, status: 'disconnected', email: undefined };
    case 'SET_LOADING':
      return { ...state, status: 'loading', error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'URL_CLEANED':
      return { ...state, urlCleaned: true };
    default:
      return state;
  }
}

function useGoogleConnectionStore() {
  const getSnapshot = useCallback(() => getGoogleConnectionState(), []);
  const getServerSnapshot = useCallback(() => ({ connected: false, email: undefined, connectedAt: undefined }), []);

  return useSyncExternalStore(subscribeToGoogleConnection, getSnapshot, getServerSnapshot);
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'access_denied':
      return 'Access was denied. Please try again and grant calendar access.';
    case 'missing_params':
      return 'Missing required parameters. Please try again.';
    case 'invalid_state':
      return 'Security check failed. Please try again.';
    case 'not_configured':
      return 'Google Calendar is not configured. Contact the administrator.';
    case 'token_exchange_failed':
      return 'Failed to complete authentication. Please try again.';
    default:
      return 'An error occurred connecting to Google Calendar. Please try again.';
  }
}

function getInitialState(searchParams: URLSearchParams): State {
  const googleConnected = searchParams.get('google_connected');
  const googleEmail = searchParams.get('google_email');
  const googleError = searchParams.get('google_error');

  if (googleConnected === 'true') {
    return {
      status: 'connected',
      email: googleEmail || undefined,
      error: null,
      urlCleaned: false,
    };
  }

  return {
    status: 'unknown',
    email: undefined,
    error: googleError ? getErrorMessage(googleError) : null,
    urlCleaned: !googleError,
  };
}

export function GoogleCalendarConnect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const localState = useGoogleConnectionStore();
  const fetchedRef = useRef(false);

  const [state, dispatch] = useReducer(reducer, searchParams, getInitialState);

  const googleConnected = searchParams.get('google_connected');
  const googleEmail = searchParams.get('google_email');
  const googleError = searchParams.get('google_error');

  useEffect(() => {
    if (state.urlCleaned) return;

    if (googleConnected === 'true') {
      if (googleEmail) {
        setGoogleConnected(googleEmail);
      } else {
        setGoogleConnected();
      }
    }

    if (googleConnected || googleError) {
      router.replace('/profile', { scroll: false });
    }

    dispatch({ type: 'URL_CLEANED' });
  }, [state.urlCleaned, googleConnected, googleEmail, googleError, router]);

  useEffect(() => {
    if (fetchedRef.current) return;
    if (state.status !== 'unknown') return;

    fetchedRef.current = true;

    fetch('/api/auth/google/status')
      .then((response) => response.json())
      .then((data: { connected: boolean }) => {
        if (data.connected) {
          dispatch({ type: 'SET_CONNECTED', email: localState.email });
        } else {
          dispatch({ type: 'SET_DISCONNECTED' });
        }
      })
      .catch(() => {
        if (localState.connected) {
          dispatch({ type: 'SET_CONNECTED', email: localState.email });
        } else {
          dispatch({ type: 'SET_DISCONNECTED' });
        }
      });
  }, [state.status, localState.connected, localState.email]);

  useEffect(() => {
    if (!localState.connected) return;
    if (state.status === 'loading') return;

    dispatch({ type: 'SET_CONNECTED', email: localState.email });
  }, [localState.connected, localState.email, state.status]);

  const handleConnect = useCallback(() => {
    dispatch({ type: 'SET_LOADING' });
    router.push('/api/auth/google');
  }, [router]);

  const handleDisconnect = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });

    try {
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoogleDisconnected();
        dispatch({ type: 'SET_DISCONNECTED' });
      } else {
        dispatch({ type: 'SET_CONNECTED', email: state.email });
        dispatch({ type: 'SET_ERROR', error: 'Failed to disconnect. Please try again.' });
      }
    } catch {
      dispatch({ type: 'SET_CONNECTED', email: state.email });
      dispatch({ type: 'SET_ERROR', error: 'Failed to disconnect. Please try again.' });
    }
  }, [state.email]);

  const { status, email, error } = state;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="size-4" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          {status === 'connected'
            ? "Connected — see today's events on Home"
            : "Connect to see today's events on Home"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === 'connected' && email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-decisions" />
            <span>Connected as {email}</span>
          </div>
        )}

        {status === 'connected' && !email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-decisions" />
            <span>Connected to Google Calendar</span>
          </div>
        )}

        <div className="flex gap-2">
          {status === 'loading' ? (
            <Button disabled className="gap-2">
              <Loader2 className="size-4 animate-spin" />
              Connecting...
            </Button>
          ) : status === 'connected' ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <Unlink className="size-4" />
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} className="gap-2">
              <Calendar className="size-4" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          We only request read-only access to see event titles and times.
        </p>
      </CardContent>
    </Card>
  );
}
