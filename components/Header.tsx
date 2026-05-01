"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Gem, LogOut, LogIn, Home, ShoppingBag, Trophy, Gift, Ticket } from "lucide-react";
import Link from "next/link";
import Button from "./Button";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/giveaways", label: "Giveaways", icon: Gift },
  { href: "/leaderboard", label: "Žebříček", icon: Trophy },
];

export default function Header() {
  const { data: session, status } = useSession();
  const [points, setPoints] = useState(0);
  const pathname = usePathname();

  const fetchPoints = () => {
    if (session) {
      fetch("/api/points/ping")
        .then((res) => res.json())
        .then((data) => {
          if (data.points !== undefined) setPoints(data.points);
        })
        .catch((e) => console.error("Chyba při načítání bodů", e));
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [session]);

  return (
    <header className="header" style={{ padding: "1.5rem 0" }}>
      <div className="header-left">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="ezyyk.com logo" style={{ width: "36px", height: "36px" }} />
          <span>ezyyk.com</span>
        </Link>
        
        <nav className="header-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`header-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="user-nav">
        {status === "loading" ? (
          <div>Načítání...</div>
        ) : session ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/codes">
              <Button 
                variant="secondary" 
                className="header-activate-btn"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", gap: "0.5rem" }}
              >
                <Ticket size={16} /> Aktivovat kód
              </Button>
            </Link>

            <div className="points-display">
              <Gem size={18} />
              <span>{points}</span> bodů
            </div>
            
            <Link 
              href="/profile" 
              className="header-user-profile"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", background: "var(--glass-bg)", padding: "0.4rem 1rem 0.4rem 0.4rem", borderRadius: "50px", border: "1px solid var(--glass-border)" }}
            >
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{session.user?.name}</span>
            </Link>

            <Button 
              variant="secondary" 
              className="header-logout-btn" 
              onClick={() => { if(confirm("Ještě se fakt chceš odhlásit?")) signOut() }} 
              style={{ padding: "0.5rem" }} 
              title="Odhlásit"
            >
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <Button onClick={() => signIn("kick")} style={{ fontSize: "0.9rem", padding: "0.5rem 1.2rem" }}>
            <LogIn size={16} /> Přihlásit přes Kick
          </Button>
        )}
      </div>
    </header>
  );
}
