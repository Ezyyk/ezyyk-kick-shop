import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Auto-draw winner for ended giveaways
async function autoDrawWinners() {
  const db = await getDb();
  const ended = await db.all(
    "SELECT * FROM giveaways WHERE status = 'active' AND ends_at <= datetime('now')"
  );
  
  for (const giveaway of ended) {
    const tickets = await db.all(
      'SELECT user_name FROM giveaway_tickets WHERE giveaway_id = ?',
      giveaway.id
    );
    
    if (tickets.length > 0) {
      // Random draw - each ticket = one chance
      const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];
      await db.run(
        "UPDATE giveaways SET status = 'ended', winner_name = ? WHERE id = ?",
        winnerTicket.user_name, giveaway.id
      );
    } else {
      // No tickets sold - end without winner
      await db.run(
        "UPDATE giveaways SET status = 'ended', winner_name = NULL WHERE id = ?",
        giveaway.id
      );
    }
  }
}

export async function GET() {
  const db = await getDb();
  
  // Auto-draw any expired giveaways
  await autoDrawWinners();
  
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
