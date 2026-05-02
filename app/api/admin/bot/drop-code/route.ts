import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRedeemCode, deactivateOldCodes, getSetting, logBotEvent } from '@/lib/db';
import { sendChatMessage } from '@/lib/kick-api';

function generateRandomCode(length: number = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token && token === expectedToken;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Deactivate any previous unredeemed codes first
    await deactivateOldCodes();

    const code = generateRandomCode(5);
    await createRedeemCode(code, 10);
    
    const chatroomId = await getSetting('last_chatroom_id');
    const success = await sendChatMessage(
      `CODE DROP: [ ${code} ] -> ezyyk.com/codes`,
      undefined,
      chatroomId || undefined
    );

    if (success) {
      await logBotEvent('code.drop', 'admin', null, 0, `Manual Code: ${code}`);
      return NextResponse.json({ success: true, code });
    } else {
      return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu do chatu' }, { status: 500 });
    }
  } catch (error) {
    console.error('[ADMIN-BOT] Error dropping code:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
