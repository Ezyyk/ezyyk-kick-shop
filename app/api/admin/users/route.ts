import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllUsers, updateUserPoints } from "@/lib/db";
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
  
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { userId, points } = await req.json();
  if (!userId || points === undefined) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  
  const user = await updateUserPoints(userId, points);
  return NextResponse.json({ user });
}
