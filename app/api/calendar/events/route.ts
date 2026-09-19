import { NextRequest, NextResponse } from 'next/server';
import { fetchTodayEvents, isGoogleConnected } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const connected = await isGoogleConnected();

  if (!connected) {
    return NextResponse.json({ events: [], connected: false }, { status: 200 });
  }

  const searchParams = request.nextUrl.searchParams;
  const timezone = searchParams.get('timezone') || 'UTC';

  try {
    const events = await fetchTodayEvents(timezone);

    const response = NextResponse.json({ events, connected: true });

    response.headers.set('Cache-Control', 'private, max-age=900, stale-while-revalidate=60');

    return response;
  } catch (err) {
    console.error('Calendar events API error:', err);
    return NextResponse.json(
      { events: [], connected: true, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
