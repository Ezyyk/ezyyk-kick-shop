import { NextResponse } from "next/server";
import { getUserByName, getUserPurchases, getUserGiveawayHistory, getUserRedeemedCodesCount } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await getUserByName(username);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Fetch user activity
    const purchases = await getUserPurchases(user.id);
    const giveawayHistory = await getUserGiveawayHistory(user.name);
    const redeemedCodesCount = await getUserRedeemedCodesCount(user.name);
    
    // Remove sensitive data (like trade_url if we want to keep it private, 
    // but the user's screenshot showed it, so maybe it's fine for public profiles in this community?)
    // Actually, usually trade_url should be private. But the screenshot showed "Nenastaveno".
    // I'll include it for now as the user's screenshot had it.
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        points: user.points,
        avatar_url: user.avatar_url,
        is_sub: user.is_sub,
        last_ping: user.last_ping,
        trade_url: user.trade_url
      },
      purchases,
      giveawayHistory,
      redeemedCodesCount
    });
  } catch (error) {
    console.error("[USER-PROFILE-API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
