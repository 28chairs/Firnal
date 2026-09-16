import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  colorId?: string;
  htmlLink?: string;
};

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  colorId?: string;
  htmlLink?: string;
};

type TokenRefreshResponse = {
  access_token: string;
  expires_in: number;
};

async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  if (!refreshToken) {
    return null;
  }

  const env = getServerEnv();

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    const data = (await response.json()) as TokenRefreshResponse;

    cookieStore.set('google_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in,
      path: '/',
    });

    return data.access_token;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;

  if (accessToken) {
    return accessToken;
  }

  return refreshAccessToken();
}

export async function isGoogleConnected(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get('google_refresh_token')?.value);
}

export async function fetchTodayEvents(timezone: string): Promise<CalendarEvent[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return [];
  }

  const now = new Date();
  const todayStart = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const timeMin = todayStart.toISOString();
  const timeMax = todayEnd.toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '20',
    timeZone: timezone,
  });

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryResponse = await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${newToken}` },
            cache: 'no-store',
          }
        );

        if (!retryResponse.ok) {
          console.error('Calendar fetch retry failed:', await retryResponse.text());
          return [];
        }

        const retryData = (await retryResponse.json()) as { items?: GoogleCalendarEvent[] };
        return mapEvents(retryData.items || []);
      }
      return [];
    }

    if (!response.ok) {
      console.error('Calendar fetch failed:', await response.text());
      return [];
    }

    const data = (await response.json()) as { items?: GoogleCalendarEvent[] };
    return mapEvents(data.items || []);
  } catch (err) {
    console.error('Calendar fetch error:', err);
    return [];
  }
}

function mapEvents(items: GoogleCalendarEvent[]): CalendarEvent[] {
  return items.map((item) => {
    const isAllDay = Boolean(item.start?.date);
    const start = item.start?.dateTime || item.start?.date || '';
    const end = item.end?.dateTime || item.end?.date || '';

    return {
      id: item.id,
      summary: item.summary || '(No title)',
      start,
      end,
      allDay: isAllDay,
      colorId: item.colorId,
      htmlLink: item.htmlLink,
    };
  });
}
