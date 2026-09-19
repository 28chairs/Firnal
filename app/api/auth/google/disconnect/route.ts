import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete('google_access_token');
  cookieStore.delete('google_refresh_token');

  return NextResponse.json({ success: true });
}

export async function POST() {
  return DELETE();
}
