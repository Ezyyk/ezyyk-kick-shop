"use client";
import React from "react";
import Header from "@/components/Header";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

const SOCIAL_LINKS = [
  {
    name: "Kick",
    url: "https://kick.com/ezyyk",
    svgIcon: (
      <img src="/images/kick-logo.png" alt="Kick" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
    ),
    color: "#53fc18",
    description: "Kde streamuju skoro každý den!"
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@realezyyk_",
    svgIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.14-1.32-.09-.07-.17-.13-.25-.21a10.04 10.04 0 0 1-.58-.58V15.5c0 1.27-.31 2.5-.89 3.6a8.51 8.51 0 0 1-5.18 4.6c-1.12.37-2.31.5-3.5.38a8.53 8.53 0 0 1-6.1-4.04 8.52 8.52 0 0 1-.95-7.14 8.51 8.51 0 0 1 4.6-5.18c1.1-.58 2.33-.89 3.6-.89.01 0 .01 0 .02 0v4.03c-1.22 0-2.4.45-3.26 1.3-.85.86-1.3 2.03-1.3 3.26 0 1.23.45 2.41 1.31 3.27.86.85 2.03 1.3 3.26 1.3 1.23 0 2.4-.45 3.26-1.31.85-.86 1.3-2.03 1.3-3.26V0l.01.02z"/>
      </svg>
    ),
    color: "#ff0050",
    description: "Krátké klipy a highlighty ze streamů."
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@Ezyyk",
    svgIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: "#FF0000",
    description: "Herní videa a highlighty."
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/realezyyk/",
    svgIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947C23.731 2.617 21.312.196 16.953.072 15.674.014 15.265 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
    color: "#E1306C",
    description: "Fotky ze života a info o streamech."
  },
  {
    name: "Discord",
    url: "https://discord.gg/39UKmCuaDg",
    svgIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
      </svg>
    ),
    color: "#5865F2",
    description: "Moje komunita, kde se dozvíš vše jako první."
  },
  {
    name: "Steam Trade",
    url: "https://steamcommunity.com/tradeoffer/new/?partner=1313277636&token=dy9kuPJg",
    svgIcon: (
      <img src="/images/steam-logo.png" alt="Steam" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
    ),
    color: "#00adee",
    description: "Můj Steam trade link pro nabídky."
  }
];

export default function SocialsPage() {
  return (
    <div className="container">
      <Header />
      
      <main className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "2rem" }}>
        
        {/* PROFILE INFO */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            borderRadius: "50%", 
            border: "3px solid var(--accent-primary)",
            padding: "5px",
            margin: "0 auto 1.5rem auto",
            boxShadow: "0 0 30px rgba(138, 43, 226, 0.3)"
          }}>
            <img 
              src="https://img.kick.com/v1/user_assets/users/25633/profile_image/27a9b0c0-6d9b-4e1b-b2d8-2c1dc7d045b8-1777648305685.png" 
              alt="Ezyyk" 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <h1 className="hero-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Ezyyk</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "400px", margin: "0 auto" }}>
            Vítej na mých sociálních sítích! Klikni na odkaz a sleduj mě všude.
          </p>
        </div>

        {/* SOCIAL LINKS GRID */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.2rem", 
          width: "100%", 
          maxWidth: "500px",
          marginBottom: "3rem"
        }}>
          {SOCIAL_LINKS.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel social-link-card"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1.5rem", 
                padding: "1.2rem 1.5rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div className="social-icon-box" style={{ 
                background: `${link.color}20`, 
                color: link.color,
                padding: "0.8rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${link.color}40`,
                transition: "all 0.3s ease"
              }}>
                {link.svgIcon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem" }}>{link.name}</h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{link.description}</p>
              </div>
              
              <ExternalLink size={18} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            </a>
          ))}
        </div>

        <Link href="/">
          <Button variant="secondary" style={{ padding: "0.8rem 2rem" }}>
            Zpět do Shopu
          </Button>
        </Link>

        <footer style={{ marginTop: "4rem", color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.6, paddingBottom: "2rem" }}>
          © {new Date().getFullYear()} Ezyyk Kick Shop
        </footer>

      </main>
    </div>
  );
}
