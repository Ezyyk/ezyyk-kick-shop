import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Always find/create user by NAME, never by session ID (which NextAuth randomizes)
async function getOrCreateUserByName(name: string) {
  const db = await getDb();
  let user = await db.get('SELECT * FROM users WHERE name = ?', name);
  if (!user) {
    await db.run('INSERT OR IGNORE INTO users (id, name, points) VALUES (?, ?, 0)', name, name);
    user = await db.get('SELECT * FROM users WHERE name = ?', name);
  }
  return user;
}

// POST - just returns current points (no more auto-adding, points come from webhook bot)
export async function POST() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userName = session.user.name as string;
  const user = await getOrCreateUserByName(userName);
  
  return NextResponse.json({ success: true, points: user?.points || 0 });
}

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userName = session.user.name as string;
  const user = await getOrCreateUserByName(userName);
  
  return NextResponse.json({ points: user?.points || 0 });
}

