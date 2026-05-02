import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, sendChatMessage } from '@/lib/kick-api';
import {
  findOrCreateUserByName,
  addPointsByName,
  updateChatActivity,
  updateUserSubStatus,
  logBotEvent,
  getTopUsers,
  getUserByName,
} from '@/lib/db';
import { formatPoints } from '@/lib/format';

// ========== POINT VALUES ==========
const POINTS = {
  NEW_SUB: 500,
  RENEWAL_SUB: 500,
  GIFTED_SUB: 500,   // per gifted sub
};

// ========== BOT COMMAND HANDLERS ==========

async function handlePointsCommand(username: string, chatId?: string | number) {
  const user = await getUserByName(username);
  const points = user?.points || 0;
  await sendChatMessage(
    `@${username} má ${formatPoints(points)} bodů`,
    undefined, chatId
  );
}

async function handleShopCommand(username: string, chatId?: string | number) {
  await sendChatMessage(
    `@${username} tady je shop ezyyk.com`,
    undefined, chatId
  );
}

async function handleLeaderboardCommand(username: string, chatId?: string | number) {
  await sendChatMessage(
    `@${username} zde najdete žebříček ezyyk.com/leaderboard`,
    undefined, chatId
  );
}

// ========== EVENT HANDLERS ==========

async function handleChatMessage(payload: Record<string, unknown>) {
  const sender = payload.sender as Record<string, unknown> | undefined;
  if (!sender || sender.is_anonymous) return;

  const username = (sender.username as string) || '';
  const kickUserId = sender.user_id as number;
  const content = (payload.content as string) || '';
  const chatroomId = payload.chatroom_id as string | number | undefined;

  if (!username) return;

  // Detect subscriber status from identity badges
  const identity = sender.identity as Record<string, unknown> | undefined;
  let isSub = false;
  if (identity?.badges) {
    const badges = identity.badges as Array<{ type: string }>;
    isSub = badges.some(b => b.type === 'subscriber');
  }

  // Ensure user exists in DB
  await findOrCreateUserByName(username);

  // Update sub status
  await updateUserSubStatus(username, isSub);

  // Track chat activity (for 5-minute point distribution)
  await updateChatActivity(username, kickUserId, isSub);

  // Handle bot commands
  const trimmedContent = content.trim().toLowerCase();
  if (trimmedContent === '!points' || trimmedContent === '!body') {
    await handlePointsCommand(username, chatroomId);
    return;
  }
  if (trimmedContent === '!shop' || trimmedContent === '!obchod') {
    await handleShopCommand(username, chatroomId);
    return;
  }
  if (trimmedContent === '!leaderboard' || trimmedContent === '!top' || trimmedContent === '!zebricek') {
    await handleLeaderboardCommand(username, chatroomId);
    return;
  }

  console.log(`[BOT] Chat from ${username}: ${content.substring(0, 50)}`);
}

async function handleNewSubscription(payload: Record<string, unknown>) {
  const subscriber = payload.subscriber as Record<string, unknown> | undefined;
  if (!subscriber) return;

  const username = (subscriber.username as string) || '';
  if (!username) return;

  await findOrCreateUserByName(username);
  await addPointsByName(username, POINTS.NEW_SUB);
  await updateUserSubStatus(username, true);
  await logBotEvent('subscription.new', username, subscriber.user_id as number, POINTS.NEW_SUB);

  const chatroomId = payload.chatroom_id as string | number | undefined;
  await sendChatMessage(
    `🎉 @${username} právě suboval a získal +${formatPoints(POINTS.NEW_SUB)} bodů! Děkujeme za podporu! 💚`,
    undefined, chatroomId
  );
  console.log(`[BOT] New sub: ${username} +${POINTS.NEW_SUB} points`);
}

async function handleSubscriptionRenewal(payload: Record<string, unknown>) {
  const subscriber = payload.subscriber as Record<string, unknown> | undefined;
  if (!subscriber) return;

  const username = (subscriber.username as string) || '';
  const duration = payload.duration as number || 1;
  if (!username) return;

  await findOrCreateUserByName(username);
  await addPointsByName(username, POINTS.RENEWAL_SUB);
  await updateUserSubStatus(username, true);
  await logBotEvent('subscription.renewal', username, subscriber.user_id as number, POINTS.RENEWAL_SUB, `${duration} months`);

  const chatroomId = payload.chatroom_id as string | number | undefined;
  await sendChatMessage(
    `🔄 @${username} obnovil sub (${duration}. měsíc) a získal +${formatPoints(POINTS.RENEWAL_SUB)} bodů! 💚`,
    undefined, chatroomId
  );
  console.log(`[BOT] Sub renewal: ${username} (${duration} months) +${POINTS.RENEWAL_SUB} points`);
}

async function handleSubscriptionGifts(payload: Record<string, unknown>) {
  const gifter = payload.gifter as Record<string, unknown> | undefined;
  if (!gifter || gifter.is_anonymous) return;

  const gifterName = (gifter.username as string) || '';
  const giftees = payload.giftees as Array<Record<string, unknown>> || [];
  if (!gifterName) return;

  const giftCount = giftees.length;

  // Award points to the gifter
  await findOrCreateUserByName(gifterName);
  const totalPoints = POINTS.GIFTED_SUB * giftCount;
  await addPointsByName(gifterName, totalPoints);
  await logBotEvent('subscription.gifts', gifterName, gifter.user_id as number, totalPoints, `${giftCount} subs gifted`);

  // Mark all giftees as subs
  for (const giftee of giftees) {
    const gifteeName = (giftee.username as string) || '';
    if (gifteeName) {
      await findOrCreateUserByName(gifteeName);
      await updateUserSubStatus(gifteeName, true);
    }
  }

  const chatroomId = payload.chatroom_id as string | number | undefined;
  await sendChatMessage(
    `🎁 @${gifterName} daroval ${giftCount}x sub a získal +${formatPoints(totalPoints)} bodů! Absolutní legenda! 🎉`,
    undefined, chatroomId
  );
  console.log(`[BOT] Gift subs: ${gifterName} gifted ${giftCount} subs +${totalPoints} points`);
}

async function handleKicksGifted(payload: Record<string, unknown>) {
  const sender = payload.sender as Record<string, unknown> | undefined;
  if (!sender) return;

  const username = (sender.username as string) || '';
  const gift = payload.gift as Record<string, unknown> | undefined;
  const amount = (gift?.amount as number) || 0;
  const giftName = (gift?.name as string) || '';
  if (!username || amount <= 0) return;

  // 100 kicks = 100 points (1:1 ratio)
  const pointsAwarded = amount;

  await findOrCreateUserByName(username);
  await addPointsByName(username, pointsAwarded);
  await logBotEvent('kicks.gifted', username, sender.user_id as number, pointsAwarded, `${amount} kicks - ${giftName}`);

  const chatroomId = payload.chatroom_id as string | number | undefined;
  await sendChatMessage(
    `⚡ @${username} poslal ${amount} Kicks a získal +${formatPoints(pointsAwarded)} bodů! 💜`,
    undefined, chatroomId
  );
  console.log(`[BOT] Kicks gifted: ${username} sent ${amount} kicks (${giftName}) +${pointsAwarded} points`);
}

// ========== MAIN WEBHOOK HANDLER ==========

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const eventType = request.headers.get('Kick-Event-Type') || '';
    const messageId = request.headers.get('Kick-Event-Message-Id') || '';
    const timestamp = request.headers.get('Kick-Event-Message-Timestamp') || '';
    const signature = request.headers.get('Kick-Event-Signature') || '';

    console.log(`[WEBHOOK] Received event: ${eventType}`);

    // Verify signature (skip in dev if needed)
    if (process.env.NODE_ENV === 'production' || process.env.VERIFY_WEBHOOK_SIGNATURE === 'true') {
      if (!verifyWebhookSignature(messageId, timestamp, rawBody, signature)) {
        console.error('[WEBHOOK] Invalid signature!');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Save chatroom ID from any event that has it
    if (payload.chatroom_id) {
      const { setSetting } = await import('@/lib/db');
      await setSetting('last_chatroom_id', String(payload.chatroom_id));
    }

    switch (eventType) {
      case 'chat.message.sent':
        console.log(`[DEBUG] Chat: ${JSON.stringify(payload).substring(0, 200)}`);
        await handleChatMessage(payload);
        break;
      case 'channel.subscription.new':
        await handleNewSubscription(payload);
        break;
      case 'channel.subscription.renewal':
        await handleSubscriptionRenewal(payload);
        break;
      case 'channel.subscription.gifts':
        await handleSubscriptionGifts(payload);
        break;
      case 'kicks.gifted':
        await handleKicksGifted(payload);
        break;
      case 'livestream.status.updated': {
        const isLive = payload.is_live === true || payload.is_live === 'true';
        console.log(`[WEBHOOK] Stream status updated: is_live=${isLive}`);
        const { setSetting } = await import('@/lib/db');
        await setSetting('is_live', isLive ? 'true' : 'false');
        break;
      }
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Kick webhook endpoint is active' });
}
