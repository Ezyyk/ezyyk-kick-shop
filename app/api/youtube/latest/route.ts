import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.youtube.com/@Ezyyk/videos", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 } // Cache pro hodinu, abychom YouTube nespamovali
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch YouTube page");
    }
    
    const html = await res.text();
    // Vytáhne první videoId, které se na stránce objeví
    const match = html.match(/"videoId":"([^"]{11})"/);
    
    if (match && match[1]) {
      return NextResponse.json({ videoId: match[1] });
    }
    
    return NextResponse.json({ error: "Video ID not found" }, { status: 404 });
  } catch (error) {
    console.error("YouTube Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
