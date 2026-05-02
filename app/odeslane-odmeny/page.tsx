"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Gift, ShoppingBag, ExternalLink, Calendar, User, Trophy, Gem } from "lucide-react";
import Link from "next/link";

interface SentReward {
  id: string | number;
  user_name: string;
  title: string;
  date: string;
  type: 'shop' | 'giveaway';
  image_url: string | null;
  avatar_url: string | null;
}

export default function SentRewardsPage() {
  const [rewards, setRewards] = useState<SentReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rewards/sent")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRewards(data);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error("Chyba při načítání odeslaných odměn", e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        <div style={{ textAlign: "center", marginBottom: "4rem", marginTop: "2rem" }}>
          <h1 className="hero-title" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
            Odeslané <span className="text-gradient">Odměny</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto" }}>
            Transparentní přehled všech doručených odměn z našeho obchodu a giveaway soutěží. 
            Gratulujeme všem výhercům! 🏆
          </p>
        </div>

        <section className="glass-panel" style={{ padding: "0", overflow: "hidden", borderRadius: "24px" }}>
          {loading ? (
            <div style={{ padding: "5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <div className="loading-spinner" style={{ marginBottom: "1rem" }}></div>
              Načítání historie odesílání...
            </div>
          ) : rewards.length === 0 ? (
            <div style={{ padding: "5rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: "1.5rem" }} />
              <p>Zatím zde nejsou žádné záznamy o odeslaných odměnách.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--glass-border)" }}>
                    <th style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Odměna</th>
                    <th style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Typ</th>
                    <th style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Příjemce</th>
                    <th style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Datum doručení</th>
                    <th style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", textAlign: "right" }}>Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward, i) => (
                    <tr key={`${reward.type}-${reward.id}`} style={{ 
                      borderBottom: i === rewards.length - 1 ? "none" : "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.3s ease",
                      cursor: "default"
                    }} className="reward-row">
                      <td style={{ padding: "1.5rem 2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                          <div style={{ 
                            width: "50px", 
                            height: "50px", 
                            borderRadius: "12px", 
                            background: "rgba(0,0,0,0.4)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            border: "1px solid var(--glass-border)",
                            overflow: "hidden"
                          }}>
                            {reward.image_url ? (
                              <img src={reward.image_url} alt={reward.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                              reward.type === 'shop' ? <ShoppingBag size={20} style={{ opacity: 0.5 }} /> : <Gift size={20} style={{ opacity: 0.5 }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "1.05rem" }}>{reward.title}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>ID: {reward.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem 2rem" }}>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.5rem", 
                          padding: "0.4rem 0.8rem", 
                          borderRadius: "50px", 
                          fontSize: "0.85rem",
                          background: reward.type === 'shop' ? "rgba(138, 43, 226, 0.15)" : "rgba(255, 215, 0, 0.1)",
                          color: reward.type === 'shop' ? "#8A2BE2" : "#FFD700",
                          border: "1px solid",
                          borderColor: reward.type === 'shop' ? "rgba(138, 43, 226, 0.3)" : "rgba(255, 215, 0, 0.2)"
                        }}>
                          {reward.type === 'shop' ? <ShoppingBag size={14} /> : <Trophy size={14} />}
                          {reward.type === 'shop' ? 'Nákup v shopu' : 'Giveaway výhra'}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem 2rem" }}>
                        <Link 
                          href={`/profile/${reward.user_name}`} 
                          className="recipient-link"
                          style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-primary)", fontWeight: "500", textDecoration: "none", transition: "color 0.2s" }}
                        >
                          <div style={{ 
                            width: "28px", 
                            height: "28px", 
                            borderRadius: "50%", 
                            background: "var(--accent-primary)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: "0.8rem", 
                            color: "white",
                            overflow: "hidden",
                            border: "1px solid var(--glass-border)"
                          }}>
                            {reward.avatar_url ? (
                              <img src={reward.avatar_url} alt={reward.user_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              reward.user_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          {reward.user_name}
                        </Link>
                      </td>
                      <td style={{ padding: "1.5rem 2rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Calendar size={14} />
                          {new Date(reward.date.replace(" ", "T") + (reward.date.includes("T") ? "" : "Z")).toLocaleDateString("cs-CZ")}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem 2rem", textAlign: "right" }}>
                        <div style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.4rem", 
                          color: "#4CAF50", 
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          background: "rgba(76, 175, 80, 0.1)",
                          padding: "0.4rem 1rem",
                          borderRadius: "50px",
                          border: "1px solid rgba(76, 175, 80, 0.2)"
                        }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4CAF50" }}></div>
                          ODESLÁNO
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <style jsx>{`
          .reward-row:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }
          .recipient-link:hover {
            color: var(--accent-primary) !important;
          }
          .text-gradient {
            background: linear-gradient(135deg, #8A2BE2 0%, #FFD700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(138, 43, 226, 0.1);
            border-top-color: #8A2BE2;
            border-radius: 50%;
            display: inline-block;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>

      <Footer />
    </div>
  );
}
