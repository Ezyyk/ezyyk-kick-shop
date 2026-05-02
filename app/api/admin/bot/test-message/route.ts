import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendChatMessage } from '@/lib/kick-api';
import { getSetting } from '@/lib/db';

import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token && token === expectedToken;
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chatroomId = await getSetting('last_chatroom_id');
    const success = await sendChatMessage(
      `🤖 EzyykBot test — bot je online a funkční! ⚡ Napiš !help pro seznam příkazů.`,
      undefined,
      chatroomId || undefined
    );

    if (success) {
      return NextResponse.json({ success: true, message: 'Testovací zpráva odeslána do chatu' });
    } else {
      return NextResponse.json({ error: 'Nepodařilo se odeslat zprávu do chatu. Zkontroluj KICK_BOT_TOKEN a KICK_BROADCASTER_USER_ID.' }, { status: 500 });
    }
  } catch (error) {
    console.error('[ADMIN-BOT] Error sending test message:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
