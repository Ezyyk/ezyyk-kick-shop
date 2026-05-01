import { NextResponse } from "next/server";
import { getShopItems } from "@/lib/db";

export async function GET() {
  const items = await getShopItems();
  return NextResponse.json(items);
}
