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
  const { itemId, cost, title } = body;
  
  if (!itemId || !cost) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  
  const success = await spendPoints(user.id, cost);
  
  if (!success) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }
  
  const updatedUser = await getUserByName(userName);
  
  // Zalogovat nákup do historie
  await logPurchase(user.id, userName, itemId, title || itemId, cost);
  
  return NextResponse.json({ success: true, points: updatedUser.points, message: `Úspěšně zakoupeno: ${title || itemId}` });
}

