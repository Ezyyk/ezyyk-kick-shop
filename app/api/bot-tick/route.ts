import { NextResponse } from 'next/server';
import {
  getActiveChattersDueForPoints,
  addPointsByName,
  markChatPointsAwarded,
  logBotEvent,
} from '@/lib/db';

// Point values
const CHAT_POINTS_NORMAL = 5;
const CHAT_POINTS_SUB = 10;

/**
 * This endpoint is called every 5 minutes (via cron or setInterval)
 * to award points to users who have been active in chat within the last 30 minutes.
 */
export async function POST(request: Request) {
  // Simple auth check
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env.BOT_CRON_SECRET || process.env.ADMIN_PASSWORD;
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeChatters = await getActiveChattersDueForPoints();
    let totalAwarded = 0;

    for (const chatter of activeChatters) {
      const points = chatter.is_sub ? CHAT_POINTS_SUB : CHAT_POINTS_NORMAL;
      
      await addPointsByName(chatter.username, points);
      await markChatPointsAwarded(chatter.username);
      await logBotEvent(
        'chat.activity_points',
        chatter.username,
        chatter.kick_user_id,
        points,
        chatter.is_sub ? 'sub bonus' : 'regular'
      );
      
      totalAwarded++;
    }

    console.log(`[BOT-TICK] Awarded points to ${totalAwarded} active chatters`);
    return NextResponse.json({ success: true, usersAwarded: totalAwarded });
  } catch (error) {
    console.error('[BOT-TICK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Bot tick endpoint - POST to trigger point distribution' 
  });
}
