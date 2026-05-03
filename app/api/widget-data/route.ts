import { NextResponse } from 'next/server';
import { getSetting, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isLiveStr = await getSetting('is_live', 'false');
    const lastCodeDropStr = await getSetting('last_code_drop_at', '0');
    const lastCodeDrop = parseInt(lastCodeDropStr) || 0;

    // Fetch the latest active code to display it if a drop just happened
    const db = await getDb();
    const latestCodeRow = await db.get('SELECT code, created_at, is_used FROM redeem_codes ORDER BY id DESC LIMIT 1');
    const latestCode = latestCodeRow ? latestCodeRow.code : null;
    const isUsed = latestCodeRow ? (latestCodeRow.is_used === 1 || latestCodeRow.is_used === true) : false;
    
    return NextResponse.json({
      isLive: isLiveStr === 'true',
      lastCodeDrop,
      latestCode,
      isUsed,
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('[WIDGET-DATA] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
