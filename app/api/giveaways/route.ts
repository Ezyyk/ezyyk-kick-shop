import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb, checkAndDrawGiveaways } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  
  // Auto-draw any expired giveaways
  await checkAndDrawGiveaways();
  
  const giveaways = await db.all(
    'SELECT * FROM giveaways ORDER BY CASE WHEN status = \'active\' THEN 0 ELSE 1 END, ends_at ASC'
  );
  
  // Add ticket counts
  const result = [];
  for (const g of giveaways) {
    const ticketCount = await db.get(
      'SELECT COUNT(*) as count FROM giveaway_tickets WHERE giveaway_id = ?', g.id
    );
    
    // Get current user's ticket count if logged in
    let myTickets = 0;
    try {
      const session = await auth();
      if (session?.user?.name) {
        const my = await db.get(
          'SELECT COUNT(*) as count FROM giveaway_tickets WHERE giveaway_id = ? AND user_name = ?',
          g.id, session.user.name
        );
        myTickets = my?.count || 0;
      }
    } catch {}
    
    result.push({
      ...g,
      total_tickets: ticketCount?.count || 0,
      my_tickets: myTickets,
    });
  }
  
  return NextResponse.json({ giveaways: result });
}
