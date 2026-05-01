"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import KickPlayer from "@/components/KickPlayer";
import Header from "@/components/Header";
import Link from "next/link";
import { PlayCircle, ExternalLink, Video, ShoppingBag, Tv, Crown, Gift, Zap, Info } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [latestVideoId, setLatestVideoId] = useState<string>("rs1ipLfXzIU");
  
  const channelName = process.env.NEXT_PUBLIC_KICK_CHANNEL || "ezyyk";

  useEffect(() => {
    fetch("/api/youtube/latest")
      .then(res => res.json())
      .then(data => {
        if (data.videoId) {
          setLatestVideoId(data.videoId);
        }
      })
      .catch(err => console.error("Chyba při načítání YT videa", err));
  }, []);

  const handlePing = async () => {
    if (!session) return;
    try {
      await fetch("/api/points/ping", { method: "POST" });
    } catch (e) {
      console.error("Chyba při pingu", e);
    }
  };

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        
        {/* HERO SECTION */}
        <section className="hero-section">
          <h1 className="hero-title">Sbírej body,<br/>získávej odměny</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Utrácej nasbírané body za odměny
          </p>
          <Link href="/shop" className="hero-shop-btn">
            <ShoppingBag size={20} /> Přejít do shopu
          </Link>
        </section>

        {/* HOW TO GET POINTS TUTORIAL */}
        <section style={{ width: "100%", marginTop: "4rem" }}>
          <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <Info size={24} color="var(--accent-primary)" /> Jak získávat body?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", transition: "var(--transition)" }}>
              <div style={{ background: "rgba(138, 43, 226, 0.15)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(138, 43, 226, 0.3)" }}>
                <Tv size={32} color="var(--accent-secondary)" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Aktivita v chatu</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>Piš do chatu na streamu a získávej <strong style={{ color: "var(--text-primary)" }}>5 bodů každých 5 minut</strong>. Napiš <strong style={{ color: "var(--accent-primary)" }}>!points</strong> pro zjištění bodů.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", transition: "var(--transition)" }}>
              <div style={{ background: "rgba(255, 215, 0, 0.1)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(255, 215, 0, 0.2)" }}>
                <Crown size={32} color="#FFD700" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Aktivní Sub</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>Subové získávají <strong style={{ color: "var(--text-primary)" }}>10 bodů / 5 min</strong> za aktivitu v chatu + <strong style={{ color: "var(--text-primary)" }}>500 bodů</strong> za sub!</p>
            </div>
            
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", transition: "var(--transition)" }}>
              <div style={{ background: "rgba(76, 175, 80, 0.1)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(76, 175, 80, 0.2)" }}>
                <Gift size={32} color="#4CAF50" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Darování Suba</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>Za darování suba získáš okamžitě <strong style={{ color: "var(--text-primary)" }}>500 bodů</strong>.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", transition: "var(--transition)" }}>
              <div style={{ background: "rgba(0, 229, 255, 0.1)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(0, 229, 255, 0.2)" }}>
                <Zap size={32} color="#00e5ff" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Poslání Kicks</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>Za zaslání Kicks tě čeká jednorázový bonus <strong style={{ color: "var(--text-primary)" }}>500 bodů</strong>.</p>
            </div>
          </div>
        </section>

        {/* YOUTUBE SECTION */}
        <section style={{ width: "100%", marginTop: "5rem" }}>
          <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <PlayCircle size={24} color="#ff0000" /> Nejnovější video
          </h2>
          <div className="glass-panel" style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", padding: 0 }}>
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${latestVideoId}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen>
            </iframe>
          </div>
        </section>

        {/* SOCIAL LINKS SECTION */}
        <section style={{ width: "100%", marginTop: "3rem", paddingBottom: "4rem" }}>
          <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            Sleduj mě
          </h2>
          <div className="social-links" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.instagram.com/realezyyk/" target="_blank" rel="noreferrer" className="social-link instagram" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
            </a>
            <a href="https://www.youtube.com/@Ezyyk" target="_blank" rel="noreferrer" className="social-link youtube" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>

            <a href="https://www.tiktok.com/@realezyyk_" target="_blank" rel="noreferrer" className="social-link tiktok" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.34-5.17 1.92-7.07 1.21-1.49 3.01-2.45 4.93-2.61.1-.01.21-.01.32-.01v4.06c-1.05.02-2.1.37-2.92 1.04-1.19.98-1.74 2.57-1.5 4.1.25 1.5 1.44 2.72 2.91 3.09 1.38.35 2.92-.02 3.86-1.06.66-.72 1.02-1.69 1.06-2.68.04-4.04.01-8.08.02-12.11z"/></svg>
            </a>
            <a href="https://discord.gg/39UKmCuaDg" target="_blank" rel="noreferrer" className="social-link discord" aria-label="Discord">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
          </div>
        </section>

        {/* FLOATING KICK PLAYER */}
        <KickPlayer channelName={channelName} onPing={handlePing} />
      </main>
    </div>
  );
}
