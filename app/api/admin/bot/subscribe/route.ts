import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { subscribeToEvents } from '@/lib/kick-api';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (!adminSession || adminSession.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const webhookUrl = body.webhookUrl || `${process.env.NEXTAUTH_URL || 'https://ezyyk.com'}/api/kick-webhook`;

    const success = await subscribeToEvents(webhookUrl);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Webhook subscriptions registered at: ${webhookUrl}`,
        events: [
          'chat.message.sent',
          'channel.subscription.new',
          'channel.subscription.renewal',
          'channel.subscription.gifts',
          'kicks.gifted',
          'livestream.status.updated',
        ]
      });
    } else {
      return NextResponse.json({ error: 'Failed to subscribe to Kick events. Check KICK_CLIENT_ID, KICK_CLIENT_SECRET, and KICK_BROADCASTER_USER_ID.' }, { status: 500 });
    }
  } catch (error) {
    console.error('[ADMIN-BOT] Error subscribing to webhooks:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
