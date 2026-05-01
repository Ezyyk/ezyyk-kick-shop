import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { Home, Gamepad2, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container">
      <Header />
      <main className="main-content" style={{ minHeight: "70vh", justifyContent: "center", gap: "2rem" }}>
        <div style={{ textAlign: "center", position: "relative" }}>
          <h1 style={{ 
            fontSize: "12rem", 
            fontWeight: 900, 
            margin: 0, 
            lineHeight: 1,
            background: "linear-gradient(to bottom, #ffffff 30%, var(--accent-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: 0.8
          }}>404</h1>
          <div style={{ 
            position: "absolute", 
            top: "20px", 
            right: "-20px",
            background: "var(--accent-primary)",
            borderRadius: "50%",
            padding: "1rem",
            boxShadow: "0 0 20px var(--accent-glow)"
          }}>
            <AlertCircle size={48} color="white" />
          </div>
        </div>

        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Stránka neexistuje</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2.5rem" }}>
            Stránka, kterou hledáš, pravděpodobně neexistuje nebo byla přesunuta do jiné herní zóny.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/" className="hero-shop-btn" style={{ marginTop: 0 }}>
              <Home size={20} /> Vrátit domů
            </Link>
            <Link href="/shop" style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              padding: "0.8rem 2rem", 
              borderRadius: "50px", 
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
              color: "white",
              fontWeight: 700,
              transition: "var(--transition)"
            }} className="secondary-btn">
              <Gamepad2 size={20} /> Přejít do shopu
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "4rem", opacity: 0.3, fontSize: "0.8rem", letterSpacing: "2px", fontWeight: 600 }}>
          ERROR_CODE: PAGE_NOT_FOUND • STATUS: DISCONNECTED
        </div>
      </main>
    </div>
  );
}
