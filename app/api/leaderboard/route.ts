import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const db = await getDb();
  
  // Get total count
  const countResult = await db.get('SELECT COUNT(*) as total FROM users WHERE points > 0');
  const total = countResult?.total || 0;
  const totalPages = Math.min(Math.ceil(total / perPage), 5); // Max 5 pages = 100 users

  // Get top users for this page (max 100 total)
  const users = await db.all(
    'SELECT name, points, avatar_url FROM users WHERE points > 0 ORDER BY points DESC LIMIT ? OFFSET ?',
    perPage,
    Math.min(offset, 80) // Cap at offset 80 (page 5)
  );

  return NextResponse.json({
    users,
    page: Math.min(page, 5),
    totalPages,
    total: Math.min(total, 100),
  });
}
