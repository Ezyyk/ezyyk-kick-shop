import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSetting } from '@/lib/db';
import { getEventSubscriptions } from '@/lib/kick-api';

import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token && token === expectedToken;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [isLive, lastCodeDrop, lastChatroomId, webhookSubs] = await Promise.all([
      getSetting('is_live', 'false'),
      getSetting('last_code_drop_at', '0'),
      getSetting('last_chatroom_id', ''),
      getEventSubscriptions().catch(() => []),
    ]);

    const lastCodeDropMs = parseInt(lastCodeDrop) || 0;
    const lastCodeDropDate = lastCodeDropMs > 0 ? new Date(lastCodeDropMs).toISOString() : null;
    const nextCodeDropMs = lastCodeDropMs + (15 * 60 * 1000);
    const nextCodeDropDate = lastCodeDropMs > 0 ? new Date(nextCodeDropMs).toISOString() : 'Po prvním code dropu';

    return NextResponse.json({
      isLive: isLive === 'true',
      lastChatroomId,
      codeDrops: {
        lastDropAt: lastCodeDropDate,
        nextDropAt: nextCodeDropDate,
        intervalMinutes: 15,
        pointsPerDrop: 10,
      },
      pointSystem: {
        chatActivityPoints: 5,
        subChatActivityPoints: 10,
        activityWindowMinutes: 30,
        tickIntervalMinutes: 5,
        newSubPoints: 500,
        giftedSubPoints: 500,
        kicksRatio: '1:1 (100 kicks = 100 bodů)',
      },
      webhookSubscriptions: webhookSubs,
      botTokenConfigured: !!process.env.KICK_BOT_TOKEN,
      broadcasterIdConfigured: !!process.env.KICK_BROADCASTER_USER_ID,
    });
  } catch (error) {
    console.error('[ADMIN-BOT] Error getting status:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
