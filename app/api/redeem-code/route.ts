import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemCode, logBotEvent } from '@/lib/db';

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
      await logBotEvent(
        'code.redeem',
        session.user.name || 'unknown',
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
