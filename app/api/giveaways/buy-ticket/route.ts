import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { giveawayId, quantity } = await req.json();
  const ticketCount = Math.max(1, Math.min(quantity || 1, 100)); // 1-100 tickets at once
  
  const db = await getDb();
  
  // Check giveaway exists and is active
  const giveaway = await db.get(
    "SELECT * FROM giveaways WHERE id = ? AND status = 'active'",
    giveawayId
  );
  
  const dateStr = giveaway.ends_at.includes("T") && !giveaway.ends_at.endsWith("Z") ? giveaway.ends_at + "Z" : giveaway.ends_at;
  if (!giveaway || new Date(dateStr) <= new Date()) {
    return NextResponse.json({ error: "Giveaway neexistuje nebo skončil" }, { status: 400 });
  }
  
  const totalCost = giveaway.ticket_cost * ticketCount;
  
  // Check user has enough points
  const user = await db.get('SELECT * FROM users WHERE name = ?', session.user.name);
  if (!user || user.points < totalCost) {
    return NextResponse.json({ error: "Nedostatek bodů" }, { status: 400 });
  }
  
  // Deduct points
  await db.run('UPDATE users SET points = points - ? WHERE name = ?', totalCost, session.user.name);
  
  // Add tickets
  for (let i = 0; i < ticketCount; i++) {
    await db.run(
      'INSERT INTO giveaway_tickets (giveaway_id, user_name) VALUES (?, ?)',
      giveawayId, session.user.name
    );
  }
  
  const updatedUser = await db.get('SELECT points FROM users WHERE name = ?', session.user.name);
  
  return NextResponse.json({ 
    success: true, 
    points: updatedUser.points,
    message: `Koupeno ${ticketCount} ticket${ticketCount > 1 ? 'ů' : ''}!`
  });
}
