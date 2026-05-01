"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Gift, Gem, Clock, Trophy, LogIn, Ticket, User, Minus, Plus } from "lucide-react";

interface Giveaway {
  id: string;
  title: string;
  description: string;
  image_url: string;
  ticket_cost: number;
  ends_at: string;
  winner_name: string | null;
  status: string;
  total_tickets: number;
  my_tickets: number;
}

export default function GiveawaysPage() {
  const { data: session, status } = useSession();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetchGiveaways();
    if (session) fetchPoints();
    // Refresh every 30 seconds for auto-draw
    const interval = setInterval(fetchGiveaways, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchGiveaways = async () => {
    try {
      const res = await fetch("/api/giveaways");
      if (res.ok) {
        const data = await res.json();
        setGiveaways(data.giveaways);
      }
    } catch {}
    setLoading(false);
  };

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/points/ping");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
      }
    } catch {}
  };

  const buyTickets = async (giveawayId: string) => {
    const qty = ticketCounts[giveawayId] || 1;
    setMessage("");
    try {
      const res = await fetch("/api/giveaways/buy-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giveawayId, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.points);
        setMessage(data.message);
        fetchGiveaways();
      } else {
        setMessage(data.error || "Chyba");
      }
    } catch {
      setMessage("Chyba při nákupu");
    }
    setTimeout(() => setMessage(""), 4000);
  };

  const getTimeLeft = (endsAt: string) => {
    const date = endsAt.includes("T") && !endsAt.endsWith("Z") ? endsAt + "Z" : endsAt;
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return "Vylosováno";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const setQty = (id: string, delta: number) => {
    setTicketCounts(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(100, (prev[id] || 1) + delta))
    }));
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title" style={{ fontSize: "2.8rem" }}>
            <Gift size={36} color="var(--accent-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            Giveaways
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Kup si tickety a vyhraj odměny
          </p>
        </section>

        {message && (
          <div className="gw-message">{message}</div>
        )}

        {!session && status !== "loading" ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <Gift size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            </div>
            <h2 style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 500 }}>Pro zobrazení giveaways se musíš přihlásit</h2>
          </div>
        ) : session ? (
          loading ? (
            <div style={{ color: "var(--text-secondary)", padding: "3rem" }}>Načítání...</div>
          ) : giveaways.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", width: "100%" }}>
              <Gift size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <h2 style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Žádné aktivní giveaways</h2>
              <p style={{ color: "var(--text-secondary)" }}>Sleduj stránku, brzy přibudou!</p>
            </div>
          ) : (
            <div className="gw-grid">
              {giveaways.map(gw => {
                const dateStr = gw.ends_at.includes("T") && !gw.ends_at.endsWith("Z") ? gw.ends_at + "Z" : gw.ends_at;
                const isActive = gw.status === "active" && new Date(dateStr).getTime() > Date.now();
                const qty = ticketCounts[gw.id] || 1;
                const totalCost = gw.ticket_cost * qty;

                return (
                  <div key={gw.id} className={`gw-card glass-panel ${!isActive ? "gw-ended" : ""}`}>
                    {/* Icon area */}
                    <div className="gw-icon-area">
                      <Gift size={32} color="var(--accent-secondary)" />
                    </div>

                    <h3 className="gw-title">{gw.title}</h3>
                    {gw.description && <p className="gw-desc">{gw.description}</p>}

                    {/* Timer / Winner */}
                    {isActive ? (
                      <div className="gw-timer">
                        <Clock size={16} /> {getTimeLeft(gw.ends_at)}
                      </div>
                    ) : gw.winner_name ? (
                      <div className="gw-winner">
                        <Trophy size={18} color="#FFD700" />
                        <span>Výherce: <strong>{gw.winner_name}</strong></span>
                      </div>
                    ) : (
                      <div className="gw-timer" style={{ color: "var(--text-secondary)" }}>Bez výherce</div>
                    )}

                    {/* Ticket info */}
                    <div className="gw-info">
                      <div className="gw-info-item">
                        <Ticket size={14} /> {gw.total_tickets} ticketů
                      </div>
                      <div className="gw-info-item">
                        <Gem size={14} color="#00e5ff" /> {gw.ticket_cost} / ticket
                      </div>
                    </div>

                    {session?.user?.name && gw.my_tickets > 0 && (
                      <div className="gw-my-tickets">
                        <User size={14} /> Tvých ticketů: {gw.my_tickets}
                      </div>
                    )}

                    {/* Buy section */}
                    {isActive && (
                      session ? (
                        <div className="gw-buy">
                          <div className="gw-qty">
                            <button className="gw-qty-btn" onClick={() => setQty(gw.id, -1)}><Minus size={14} /></button>
                            <span className="gw-qty-num">{qty}</span>
                            <button className="gw-qty-btn" onClick={() => setQty(gw.id, 1)}><Plus size={14} /></button>
                          </div>
                          <Button
                            onClick={() => buyTickets(gw.id)}
                            disabled={points < totalCost}
                            style={{ flex: 1, fontSize: "0.85rem" }}
                          >
                            <Ticket size={16} /> Koupit ({totalCost.toLocaleString("cs-CZ")} bodů)
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => signIn("kick")} style={{ width: "100%", marginTop: "auto" }}>
                          <LogIn size={16} /> Přihlásit se
                        </Button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : null}
      </main>
    </div>
  );
}
