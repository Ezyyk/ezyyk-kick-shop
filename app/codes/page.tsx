"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Ticket, Info, Tv, Crown, Gift, Zap, MessageSquare } from "lucide-react";

export default function CodesPage() {
  const { data: session, status } = useSession();
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '']);
  const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    const uppercaseValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newDigits = [...codeDigits];
    
    // Allow replacing current character or just setting it
    newDigits[index] = uppercaseValue.slice(-1); 
    setCodeDigits(newDigits);

    // Auto focus next input
    if (uppercaseValue && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (!pastedData) return;
    
    const newDigits = [...codeDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setCodeDigits(newDigits);
    
    // Focus next empty or last input
    const nextIndex = Math.min(pastedData.length, 4);
    inputsRef.current[nextIndex === 5 ? 4 : nextIndex]?.focus();
  };

  const fullCode = codeDigits.join('');

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length < 5 || isSubmitting) return;

    setIsSubmitting(true);
    setRedeemStatus(null);

    try {
      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setRedeemStatus({ type: 'success', msg: data.message });
        setCodeDigits(['', '', '', '', '']);
        inputsRef.current[0]?.focus();
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

                <div className="otp-container" onPaste={handlePaste}>
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputsRef.current[index] = el; }}
                      type="text"
                      className="otp-input"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <Button 
                  type="submit" 
                  style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
                  disabled={isSubmitting || fullCode.length < 5}
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
