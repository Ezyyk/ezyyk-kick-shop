import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getShopItems, createShopItem, deleteShopItem } from "@/lib/db";
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
  
  const items = await getShopItems();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id, title, description, cost, imageUrl, category, stock } = await req.json();
  
  if (!id || !title || cost === undefined || cost === null) {
    return NextResponse.json({ error: "Chybí povinná pole (id, title, cost)" }, { status: 400 });
  }
  
  try {
    await createShopItem(id, title, description || "", cost, imageUrl || "", category || "other", stock !== undefined ? stock : -1);
    const items = await getShopItems();
    return NextResponse.json({ success: true, items });
  } catch (e: any) {
    if (e.message && e.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Item s tímto ID už existuje!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Nepodařilo se vytvořit item v databázi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await req.json();
  
  if (!id) {
    return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
  }
  
  await deleteShopItem(id);
  const items = await getShopItems();
  return NextResponse.json({ success: true, items });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id, title, description, cost, imageUrl, category, stock } = await req.json();
  
  if (!id || !title || cost === undefined || cost === null) {
    return NextResponse.json({ error: "Chybí povinná pole (id, title, cost)" }, { status: 400 });
  }
  
  try {
    const { updateShopItem } = await import("@/lib/db");
    await updateShopItem(id, title, description || "", cost, imageUrl || "", category || "other", stock !== undefined ? stock : -1);
    const items = await getShopItems();
    return NextResponse.json({ success: true, items });
  } catch (e: any) {
    return NextResponse.json({ error: "Nepodařilo se upravit item" }, { status: 500 });
  }
}
