import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const profileUrl = `${baseUrl}/profile`;

  if (error) {
    const errorUrl = new URL(profileUrl);
    errorUrl.searchParams.set('google_error', error);
    return NextResponse.redirect(errorUrl);
  }

  if (!code || !state) {
    const errorUrl = new URL(profileUrl);
    errorUrl.searchParams.set('google_error', 'missing_params');
    return NextResponse.redirect(errorUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;

  if (!storedState || storedState !== state) {
    const errorUrl = new URL(profileUrl);
    errorUrl.searchParams.set('google_error', 'invalid_state');
    return NextResponse.redirect(errorUrl);
  }

  cookieStore.delete('google_oauth_state');

  const env = getServerEnv();

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    const errorUrl = new URL(profileUrl);
    errorUrl.searchParams.set('google_error', 'not_configured');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', errorData);
      const errorUrl = new URL(profileUrl);
      errorUrl.searchParams.set('google_error', 'token_exchange_failed');
      return NextResponse.redirect(errorUrl);
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
    };

    let email: string | undefined;
    try {
      const userResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userResponse.ok) {
        const userData = (await userResponse.json()) as { email?: string };
        email = userData.email;
      }
    } catch {
      // User info is optional
    }

    cookieStore.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    const successUrl = new URL(profileUrl);
    successUrl.searchParams.set('google_connected', 'true');
    if (email) {
      successUrl.searchParams.set('google_email', email);
    }

    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    const errorUrl = new URL(profileUrl);
    errorUrl.searchParams.set('google_error', 'unknown');
    return NextResponse.redirect(errorUrl);
  }
}
