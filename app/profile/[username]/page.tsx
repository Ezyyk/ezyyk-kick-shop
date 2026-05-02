"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User as UserIcon, Gem, ShoppingBag, Gift, Calendar, ExternalLink, Trophy, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPoints } from "@/lib/format";
import GemIcon from "@/components/GemIcon";



export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (username) {
      fetch(`/api/profile/${username}`)
        .then(res => {
          if (!res.ok) throw new Error("Uživatel nenalezen");
          return res.json();
        })
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [username]);

  if (loading) {
    return (
      <div className="container">
        <Header />
        <div style={{ padding: "10rem 0", textAlign: "center" }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Načítání profilu...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <Header />
        <main className="main-content" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", borderRadius: "24px" }}>
            <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
            <h2 style={{ color: "var(--text-primary)", marginBottom: "2rem" }}>{error || "Uživatel nenalezen"}</h2>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/" className="hero-shop-btn" style={{ marginTop: 0 }}>
                Domovská stránka
              </Link>
              <Link href="/leaderboard" className="nav-tab active" style={{ borderRadius: "50px" }}>
                Žebříček
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, purchases, giveawayHistory, redeemedCodesCount } = data;

  return (
    <div className="container">
      <Header />
      
      <main className="main-content" style={{ maxWidth: "800px", margin: "4rem auto" }}>
        {/* PROFILE HEADER */}
        <div className="glass-panel" style={{ padding: "3rem", borderRadius: "24px", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            borderRadius: "50%", 
            background: "var(--accent-primary)", 
            margin: "0 auto 1.5rem",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            overflow: "hidden",
            border: "4px solid var(--glass-border)",
            boxShadow: "0 0 30px rgba(138, 43, 226, 0.3)"
          }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <UserIcon size={60} color="white" />
            )}
          </div>
          
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>{user.name}</h1>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
            {user.is_sub && (
              <span style={{ background: "rgba(76, 175, 80, 0.15)", color: "#4CAF50", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                KICK SUB
              </span>
            )}
            <span style={{ background: "rgba(138, 43, 226, 0.15)", color: "var(--accent-primary)", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <GemIcon size={14} /> {formatPoints(user.points)} bodů
            </span>
            <span style={{ background: "rgba(255, 152, 0, 0.15)", color: "#FF9800", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid rgba(255, 152, 0, 0.3)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              ⚡ {redeemedCodesCount || 0} kódů
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "left" }}>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.2rem", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Steam Trade URL</div>
              {user.trade_url ? (
                <a href={user.trade_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ExternalLink size={14} /> Otevřít na Steamu
                </a>
              ) : (
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Nenastaveno</span>
              )}
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.2rem", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Poslední aktivita</div>
              <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={14} />
                {user.last_ping ? new Date(user.last_ping.replace(" ", "T") + (user.last_ping.includes("T") ? "" : "Z")).toLocaleString("cs-CZ") : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVITY SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* PURCHASES */}
          <section>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <ShoppingBag size={20} color="var(--accent-primary)" /> Historie nákupů
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {purchases.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--glass-bg)", borderRadius: "16px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Žádné nákupy</div>
              ) : (
                purchases.map((p: any) => (
                  <div key={p.id} style={{ background: "var(--glass-bg)", padding: "1rem", borderRadius: "16px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.95rem" }}>{p.item_title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Calendar size={12} /> {new Date(p.purchased_at.replace(" ", "T") + (p.purchased_at.includes("T") ? "" : "Z")).toLocaleDateString("cs-CZ")}
                      </div>
                    </div>
                    {p.is_sent ? (
                      <span style={{ fontSize: "0.7rem", color: "#4CAF50", background: "rgba(76, 175, 80, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px", border: "1px solid rgba(76, 175, 80, 0.2)" }}>DORUČENO</span>
                    ) : (
                      <span style={{ fontSize: "0.7rem", color: "var(--accent-secondary)", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>ČEKÁ</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* GIVEAWAYS */}
          <section>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Trophy size={20} color="#FFD700" /> Giveaways
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {giveawayHistory.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--glass-bg)", borderRadius: "16px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Žádná účast</div>
              ) : (
                giveawayHistory.map((g: any) => {
                  const isWinner = g.winner_name === user.name;
                  return (
                    <div key={g.id} style={{ 
                      background: isWinner ? "rgba(255, 215, 0, 0.05)" : "var(--glass-bg)", 
                      padding: "1rem", 
                      borderRadius: "16px", 
                      border: "1px solid", 
                      borderColor: isWinner ? "rgba(255, 215, 0, 0.4)" : "var(--glass-border)",
                      boxShadow: isWinner ? "0 0 20px rgba(255, 215, 0, 0.1)" : "none",
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      position: "relative",
                      transition: "all 0.3s ease"
                    }}>
                      <div>
                        <div style={{ fontWeight: "700", color: isWinner ? "#FFD700" : "var(--text-primary)", fontSize: "1rem" }}>
                          {g.title}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{g.tickets_bought} ticketů</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {isWinner ? (
                          <div style={{ color: "#FFD700", fontWeight: "800", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Trophy size={14} /> VÝHRA
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {g.status === "ended" ? "Bez výhry" : "Probíhá"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <style jsx>{`
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(138, 43, 226, 0.1);
          border-top-color: #8A2BE2;
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
