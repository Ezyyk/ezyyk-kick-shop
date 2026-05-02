import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from "crypto";
import { getSetting, setSetting } from '@/lib/db';

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
    const currentStatus = await getSetting('is_live', 'false');
    const newStatus = currentStatus === 'true' ? 'false' : 'true';
    await setSetting('is_live', newStatus);
    
    return NextResponse.json({ success: true, isLive: newStatus === 'true' });
  } catch (error) {
    console.error('[ADMIN-BOT] Error toggling live status:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
