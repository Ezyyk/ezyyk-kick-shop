import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  const { password } = await req.json();
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Nesprávné heslo" }, { status: 401 });
  }
  
  // Vygenerujeme stateless token ze zahashovaného hesla (pro běh na více serverech/Vercel)
  const token = crypto.createHash("sha256").update(adminPassword).digest("hex");
  
  // Uložíme token do cookie (httpOnly = nelze číst přes JS/F12)
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hodin
    path: "/",
  });
  
  return NextResponse.json({ success: true });
}
