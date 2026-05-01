"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Ticket, Info, Tv, Crown, Gift, Zap, MessageSquare } from "lucide-react";

export default function CodesPage() {
  const { data: session, status } = useSession();
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setRedeemStatus(null);

    try {
      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setRedeemStatus({ type: 'success', msg: data.message });
        setRedeemCode("");
      } else {
        setRedeemStatus({ type: 'error', msg: data.error || "Něco se nepovedlo" });
      }
    } catch (e) {
      setRedeemStatus({ type: 'error', msg: "Chyba sítě" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        <section className="hero-section" style={{ maxWidth: "600px" }}>
          <h1 className="hero-title">Aktivovat kód</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Zadej 5místný kód z chatu a získej okamžitě 10 bodů!
          </p>

          <div className="glass-panel" style={{ padding: "2rem", width: "100%" }}>
            {status === "loading" ? (
              <p>Načítání...</p>
            ) : session ? (
              <form onSubmit={handleRedeem}>
                {redeemStatus && (
                  <div className={`redeem-status ${redeemStatus.type}`} style={{ marginBottom: "1.5rem" }}>
                    {redeemStatus.msg}
                  </div>
                )}

                <input 
                  type="text" 
                  className="redeem-input" 
                  placeholder="ABCDE" 
                  maxLength={5}
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  autoFocus
                  style={{ marginBottom: "1.5rem" }}
                />

                <Button 
                  type="submit" 
                  style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
                  disabled={isSubmitting || redeemCode.length < 5}
                >
                  {isSubmitting ? "Ověřování..." : "Aktivovat"}
                </Button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <p style={{ marginBottom: "1.5rem" }}>Pro aktivaci kódu se musíš nejdříve přihlásit.</p>
                <Button onClick={() => signIn("kick")} style={{ gap: "0.5rem" }}>
                  Přihlásit přes Kick
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* EXPLANATION SECTION */}
        <section style={{ width: "100%", marginTop: "4rem" }}>
          <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <Info size={24} color="var(--accent-primary)" /> Jak získávat kódy?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
            <div className="glass-panel tutorial-card code-drop">
              <div style={{ background: "rgba(255, 152, 0, 0.15)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
                <Ticket size={32} color="#FF9800" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Code Drop</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>
                Sleduj stream a počkej na kód. První kdo ho zadá zde na webu, získá <strong style={{ color: "var(--text-primary)" }}>10 bodů</strong>. Kód se deaktivuje s příchodem dalšího.
              </p>
            </div>

            <div className="glass-panel tutorial-card activity">
              <div style={{ background: "rgba(138, 43, 226, 0.15)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(138, 43, 226, 0.3)" }}>
                <MessageSquare size={32} color="var(--accent-secondary)" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Kde kód najdu?</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>
                Bot náhodně vyhodí kód přímo do <strong style={{ color: "var(--text-primary)" }}>Kick chatu</strong>. Buď rychlý, kód může aktivovat vždy jen <strong style={{ color: "var(--accent-primary)" }}>jeden nejrychlejší</strong>!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
