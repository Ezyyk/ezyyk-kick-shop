import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, updateTradeUrl, getUserPurchases } from "@/lib/db";

async function getUserByName(name: string) {
  const db = await getDb();
  return await db.get('SELECT * FROM users WHERE name = ?', name);
}

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userName = session.user.name as string;
  const user = await getUserByName(userName);
  let purchases = [];
  let giveawayHistory = [];
  if (user) {
    const { getUserPurchases, getUserGiveawayHistory } = await import("@/lib/db");
    purchases = await getUserPurchases(user.id);
    giveawayHistory = await getUserGiveawayHistory(userName);
  }

  return NextResponse.json({ 
    tradeUrl: user?.trade_url || "", 
    purchases,
    giveawayHistory 
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userName = session.user.name as string;
  const user = await getUserByName(userName);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  
  const body = await req.json();
  
  if (typeof body.tradeUrl !== "string") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await updateTradeUrl(user.id, body.tradeUrl);

  return NextResponse.json({ success: true, message: "Trade URL úspěšně uloženo." });
}

