import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token && token === expectedToken;
}

// GET - list all giveaways with ticket info
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const db = await getDb();
  const giveaways = await db.all('SELECT * FROM giveaways ORDER BY created_at DESC');
  
  const result = [];
  for (const g of giveaways) {
    const tickets = await db.all(
      'SELECT user_name, COUNT(*) as count FROM giveaway_tickets WHERE giveaway_id = ? GROUP BY user_name ORDER BY count DESC',
      g.id
    );
    const totalTickets = await db.get(
      'SELECT COUNT(*) as count FROM giveaway_tickets WHERE giveaway_id = ?', g.id
    );
    result.push({
      ...g,
      total_tickets: totalTickets?.count || 0,
      ticket_holders: tickets,
    });
  }
  
  return NextResponse.json(result);
}

// POST - create new giveaway
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id, title, description, ticketCost, endsAt, imageUrl } = await req.json();
  
  if (!id || !title || !ticketCost || !endsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  
  const db = await getDb();
  await db.run(
    'INSERT INTO giveaways (id, title, description, image_url, ticket_cost, ends_at) VALUES (?, ?, ?, ?, ?, ?)',
    id, title, description || "", imageUrl || "", ticketCost, endsAt
  );
  
  return NextResponse.json({ success: true });
}

// DELETE - delete a giveaway and its tickets
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await req.json();
  const db = await getDb();
  
  await db.run('DELETE FROM giveaway_tickets WHERE giveaway_id = ?', id);
  await db.run('DELETE FROM giveaways WHERE id = ?', id);
  
  return NextResponse.json({ success: true });
}
