"use client";
import React from "react";
import Header from "@/components/Header";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  MessageSquare, 
  ExternalLink,
  Gamepad2,
  Tv,
  Music2
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "Kick",
    url: "https://kick.com/ezyyk",
    icon: <Tv size={24} />,
    color: "#53fc18",
    description: "Kde streamuju skoro každý den!"
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@ezyykk",
    icon: <Music2 size={24} />,
    color: "#ff0050",
    description: "Krátké klipy a highlighty ze streamů."
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/ezyykk/",
    icon: <Instagram size={24} />,
    color: "#E1306C",
    description: "Fotky ze života a info o streamech."
  },
  {
    name: "Discord",
    url: "https://discord.gg/ezyyk",
    icon: <MessageSquare size={24} />,
    color: "#5865F2",
    description: "Moje komunita, kde se dozvíš vše jako první."
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ezyykk",
    icon: <Youtube size={24} />,
    color: "#FF0000",
    description: "Vlogy a delší videa."
  },
  {
    name: "Steam",
    url: "https://steamcommunity.com/id/ezyykk/",
    icon: <Gamepad2 size={24} />,
    color: "#00adee",
    description: "Můj Steam profil a trade link."
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
          maxWidth: "500px" 
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
                {link.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem" }}>{link.name}</h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{link.description}</p>
              </div>
              
              <ExternalLink size={18} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            </a>
          ))}
        </div>

        <footer style={{ marginTop: "4rem", color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.6 }}>
          © {new Date().getFullYear()} Ezyyk Kick Shop
        </footer>

      </main>
    </div>
  );
}
