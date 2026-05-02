import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getRedeemedCodesHistory } from '@/lib/db';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const expectedToken = crypto.createHash('sha256').update(adminPassword).digest('hex');
  return token && token === expectedToken;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const history = await getRedeemedCodesHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error('[ADMIN-BOT] Error fetching code history:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
