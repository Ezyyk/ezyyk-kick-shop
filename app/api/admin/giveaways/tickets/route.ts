import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllTicketHistory } from "@/lib/db";
import crypto from "crypto";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const expectedToken = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return token && token === expectedToken;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const tickets = await getAllTicketHistory();
  return NextResponse.json(tickets);
}
