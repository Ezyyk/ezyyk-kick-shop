import { NextResponse } from 'next/server';
import {
  getActiveChattersDueForPoints,
  addPointsByName,
  markChatPointsAwarded,
  logBotEvent,
  getSetting,
  createRedeemCode,
} from '@/lib/db';
import { sendChatMessage } from '@/lib/kick-api';

function generateRandomCode(length: number = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

    // --- CODE DROP LOGIC ---
    // Only if stream is live (checked via webhook)
    const isLive = await getSetting('is_live', 'false') === 'true';
    let codeDropped = false;

    if (isLive) {
      // 20% chance to drop a code every 5 minutes (~once per 25 minutes on average)
      if (Math.random() < 0.20) {
        const code = generateRandomCode(5);
        await createRedeemCode(code, 10);
        
        const chatroomId = await getSetting('last_chatroom_id');
        await sendChatMessage(`🎁 CODE DROP! První kdo napíše kód [ ${code} ] na webu ezyyk.com získá 10 bodů! ⚡`, undefined, chatroomId || undefined);
        await logBotEvent('code.drop', 'system', null, 0, `Code: ${code}`);
        codeDropped = true;
        console.log(`[BOT-TICK] 🎁 Code dropped: ${code}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      usersAwarded: totalAwarded,
      codeDropped: codeDropped
    });
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
