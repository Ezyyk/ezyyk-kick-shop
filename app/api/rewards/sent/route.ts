import { NextResponse } from "next/server";
import { getSentRewards } from "@/lib/db";

export async function GET() {
  try {
    const rewards = await getSentRewards();
    return NextResponse.json(rewards);
  } catch (error) {
    console.error("[REWARDS-API] Error fetching sent rewards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
