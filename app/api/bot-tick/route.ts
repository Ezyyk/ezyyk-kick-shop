import { NextResponse } from 'next/server';
import {
  getActiveChattersDueForPoints,
  addPointsByName,
  markChatPointsAwarded,
  logBotEvent,
  createRedeemCode,
  deactivateOldCodes,
  checkAndDrawGiveaways,
  getSetting,
  setSetting,
  triggerCodeDrop,
} from '@/lib/db';
import { sendChatMessage, checkLiveStatus } from '@/lib/kick-api';

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
const CODE_DROP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const CODE_DROP_POINTS = 10;

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
    // Check actual stream status from Kick API to fix desyncs
    const actualLiveStatus = await checkLiveStatus();
    if (actualLiveStatus !== null) {
      await setSetting('is_live', actualLiveStatus ? 'true' : 'false');
    }

    const isLive = await getSetting('is_live', 'false') === 'true';

    // ===== 1. AWARD CHAT ACTIVITY POINTS (only when live) =====
    let totalAwarded = 0;
    
    if (isLive) {
      const activeChatters = await getActiveChattersDueForPoints();

      for (const chatter of activeChatters) {
        const points = chatter.is_sub ? CHAT_POINTS_SUB : CHAT_POINTS_NORMAL;
        
        await addPointsByName(chatter.username, points);
        await markChatPointsAwarded(chatter.username);
        await logBotEvent(
          'chat.activity_points',
          chatter.username,
          chatter.kick_user_id,
          points,
          chatter.is_sub ? 'sub bonus (10 pts)' : 'regular (5 pts)'
        );
        
        totalAwarded++;
      }

      if (totalAwarded > 0) {
        console.log(`[BOT-TICK] ✅ Awarded points to ${totalAwarded} active chatters`);
      }
    }

    // ===== 2. CODE DROP LOGIC (every 15 minutes when live) =====
    let codeDropped = false;

    if (isLive) {
      const lastCodeDropStr = await getSetting('last_code_drop_at', '0');
      const lastCodeDrop = parseInt(lastCodeDropStr) || 0;
      const now = Date.now();

      if (now - lastCodeDrop >= CODE_DROP_INTERVAL_MS - 5000) {
        const result = await triggerCodeDrop(CODE_DROP_POINTS);
        if (result) {
          codeDropped = true;
          console.log(`[BOT-TICK] 🎁 Code dropped: ${result.code}`);
        }
      }
    }
    
    // ===== 3. GIVEAWAY DRAW LOGIC =====
    const drawnGiveaways = await checkAndDrawGiveaways();
    if (drawnGiveaways > 0) {
      console.log(`[BOT-TICK] 🎁 Drawn ${drawnGiveaways} giveaways`);
      
      // Announce giveaway winners in chat
      const chatroomId = await getSetting('last_chatroom_id');
      if (chatroomId) {
        // We could fetch the drawn giveaways and announce them, 
        // but for now just log it
      }
    }

    return NextResponse.json({ 
      success: true, 
      usersAwarded: totalAwarded,
      codeDropped,
      isLive,
      giveawaysDrawn: drawnGiveaways,
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
