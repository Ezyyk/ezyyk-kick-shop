import { NextRequest, NextResponse } from 'next/server';
import { getRecentBotEvents } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Check admin password
  const authHeader = request.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;
  
  if (authHeader !== `Bearer ${password}`) {
    // Also check query param for easy browser access
    const url = new URL(request.url);
    const queryPassword = url.searchParams.get('password');
    if (queryPassword !== password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    const events = await getRecentBotEvents(limit);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching bot events:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
