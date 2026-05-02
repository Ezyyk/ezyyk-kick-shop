import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemCode, logBotEvent, getSetting } from '@/lib/db';
import { sendChatMessage } from '@/lib/kick-api';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Musíš být přihlášen' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Neplatný kód' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const result = await redeemCode(cleanCode, session.user.id);

    if (result.success) {
      const username = session.user.name || 'Neznámý uživatel';
      
      const chatroomId = await getSetting('last_chatroom_id');
      if (chatroomId) {
        // Run in background so we don't slow down the response
        sendChatMessage(
          `@${username} chytil kód jako první a získal ${result.points} bodů! ⚡`,
          undefined,
          chatroomId
        ).catch(err => console.error('[REDEEM] Failed to send chat message:', err));
      }

      await logBotEvent(
        'code.redeem',
        username,
        null,
        result.points || 0,
        `Redeemed code: ${cleanCode}`
      );
      return NextResponse.json({ 
        success: true, 
        message: `Gratulujeme! Získal jsi ${result.points} bodů.`,
        points: result.points 
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('[REDEEM] Error:', error);
    return NextResponse.json({ error: 'Chyba při zpracování kódu' }, { status: 500 });
  }
}
