import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { spendPoints, getDb, logPurchase } from "@/lib/db";

async function getUserByName(name: string) {
  const db = await getDb();
  return await db.get('SELECT * FROM users WHERE name = ?', name);
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
  const { itemId, cost, title, userMessage } = body;
  
  if (!itemId || !cost) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Check item requirements
  const { decrementStock, getDb } = await import("@/lib/db");
  const dbInstance = await getDb();
  const item = await dbInstance.get('SELECT stock, requires_message FROM shop_items WHERE id = ?', itemId);
  
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.stock === 0) {
    return NextResponse.json({ error: "Tato položka je již vyprodána!" }, { status: 400 });
  }

  if (item.requires_message && (!userMessage || userMessage.trim().length === 0)) {
    return NextResponse.json({ error: "Pro zakoupení tohoto předmětu musíš vyplnit zprávu!" }, { status: 400 });
  }
  
  const success = await spendPoints(user.id, cost);
  
  if (!success) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  // Decrement stock if success
  await decrementStock(itemId);
  
  const updatedUser = await getUserByName(userName);
  
  // Zalogovat nákup do historie
  await logPurchase(user.id, userName, itemId, title || itemId, cost, userMessage || "");
  
  return NextResponse.json({ success: true, points: updatedUser.points, message: `Úspěšně zakoupeno: ${title || itemId}` });
}

