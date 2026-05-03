import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveChattersDueForPoints,
  addPointsByName,
  markChatPointsAwarded,
  logBotEvent,
  checkAndDrawGiveaways,
  getSetting,
  setSetting,
  triggerCodeDrop,
  logPointDistribution,
} from '@/lib/db';
import { checkLiveStatus } from '@/lib/kick-api';

// Point values
const CHAT_POINTS_NORMAL = 5;
const CHAT_POINTS_SUB = 10;
const CODE_DROP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const CODE_DROP_POINTS = 10;

/**
 * Core tick logic - awards points, drops codes, draws giveaways.
 * Called by both GET (Vercel Cron) and POST (manual/instrumentation).
 */
async function runTick() {
  // Check actual stream status from Kick API to fix desyncs
  const actualLiveStatus = await checkLiveStatus();
  if (actualLiveStatus !== null) {
    await setSetting('is_live', actualLiveStatus ? 'true' : 'false');
  }

  const isLive = await getSetting('is_live', 'false') === 'true';

  // ===== 1. AWARD CHAT ACTIVITY POINTS (only when live) =====
  let totalAwarded = 0;
  const awardedUsers: {username: string, points: number}[] = [];
  
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
      
      awardedUsers.push({ username: chatter.username, points });
      totalAwarded++;
    }
  }

  // Log distribution attempts only when live to avoid spamming the history with "0" when offline
  if (isLive) {
    await logPointDistribution(awardedUsers);
  }
  
  if (totalAwarded > 0) {
    console.log(`[BOT-TICK] ✅ Awarded points to ${totalAwarded} active chatters`);
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
  }

  return { 
    success: true, 
    usersAwarded: totalAwarded,
    codeDropped,
    isLive,
    giveawaysDrawn: drawnGiveaways,
  };
}

/**
 * GET handler - used by Vercel Cron Jobs.
 * Vercel Cron sends a GET request with Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron sends Authorization header with CRON_SECRET
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.BOT_CRON_SECRET || process.env.ADMIN_PASSWORD;
  
  // Accept either Vercel CRON_SECRET or admin password
  const isAuthorized = 
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (adminPassword && authHeader === `Bearer ${adminPassword}`);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTick();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[BOT-TICK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST handler - used by instrumentation.ts setInterval (local dev)
 * and manual admin triggers.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env.BOT_CRON_SECRET || process.env.ADMIN_PASSWORD;
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTick();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[BOT-TICK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
