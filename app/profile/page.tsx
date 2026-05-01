"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Save, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tradeUrl, setTradeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }

    if (session) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.tradeUrl) {
            setTradeUrl(data.tradeUrl);
          }
          if (data.purchases) {
            setPurchases(data.purchases);
          }
        })
        .catch((e) => console.error("Chyba při načítání profilu", e));
    }
  }, [session, status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Uloženo.");
      } else {
        setMessage(data.error || "Došlo k chybě");
      }
    } catch (e) {
      setMessage("Došlo k chybě při ukládání");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (status === "loading") {
    return <div className="container" style={{ padding: "5rem", textAlign: "center" }}>Načítání...</div>;
  }

  return (
    <div className="container">
      <Header />

      <main className="main-content" style={{ maxWidth: "600px", marginTop: "2rem" }}>
        <section className="glass-panel" style={{ width: "100%", padding: "3rem", textAlign: "left" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1.5rem" }}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-primary)" }} />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "2rem", fontWeight: "bold" }}>
                <User size={40} />
              </div>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: "2rem", color: "var(--text-primary)" }}>{session?.user?.name}</h1>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>Kick Profil</p>
            </div>
          </div>

          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Nastavení odměn</h2>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label htmlFor="tradeUrl" style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                Steam Trade URL
              </label>
              <input
                id="tradeUrl"
                type="url"
                value={tradeUrl}
                onChange={(e) => setTradeUrl(e.target.value)}
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
              />
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Potřebné pro odesílání CS2 skinů z obchodu. Můžeš to najít ve svém Steam inventáři v{" "}
                <a
                  href="https://steamcommunity.com/profiles/76561199273543364/tradeoffers/privacy#trade_offer_access_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "underline" }}
                >
                  "Kdo mi může poslat návrhy na obchod?"
                </a>.
              </p>
            </div>

            <Button type="submit" disabled={saving} style={{ alignSelf: "flex-start", padding: "1rem 2rem" }}>
              <Save size={18} /> {saving ? "Ukládání..." : "Uložit změny"}
            </Button>

            {message && (
              <div style={{
                padding: "1rem",
                background: "rgba(138, 43, 226, 0.2)",
                border: "1px solid var(--accent-primary)",
                borderRadius: "var(--radius-sm)",
                color: "white"
              }}>
                {message}
              </div>
            )}
          </form>

        </section>

        <section className="glass-panel" style={{ width: "100%", padding: "3rem", textAlign: "left", marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Historie nákupů</h2>
          {purchases.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>Zatím žádné nákupy.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {purchases.map(p => (
                <div key={p.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--glass-border)"
                }}>
                  <div>
                    <strong style={{ display: "block", color: "var(--text-primary)" }}>{p.item_title}</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {new Date(p.purchased_at.replace(" ", "T") + "Z").toLocaleString("cs-CZ")}
                    </span>
                  </div>
                  <div style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>
                    -{p.cost.toLocaleString()} bodů
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
