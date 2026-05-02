"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Gem, LogOut, LogIn, Home, ShoppingBag, Trophy, Gift, Ticket, Package } from "lucide-react";
import Link from "next/link";
import Button from "./Button";
import { formatPoints } from "@/lib/format";
import GemIcon from "./GemIcon";

function RollingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;
    
    const duration = 800; // ms
    const startTime = performance.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const ease = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + diff * ease);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{formatPoints(displayValue)}</span>;
}





const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/giveaways", label: "Giveaways", icon: Gift },
  { href: "/leaderboard", label: "Žebříček", icon: Trophy },
  { href: "/odeslane-odmeny", label: "Odeslané odměny", icon: Package },
];

function PointsChange({ points }: { points: number }) {
  const [prevPoints, setPrevPoints] = useState(points);
  const [change, setChange] = useState<number | null>(null);

  useEffect(() => {
    if (points < prevPoints) {
      setChange(points - prevPoints);
      const timer = setTimeout(() => setChange(null), 2000);
      setPrevPoints(points);
      return () => clearTimeout(timer);
    }
    setPrevPoints(points);
  }, [points]);

  if (!change) return null;

  return (
    <div 
      style={{ 
        position: "absolute", 
        top: "-25px", 
        right: "10px", 
        color: "#ff4444", 
        fontWeight: "900",
        fontSize: "1.1rem",
        animation: "floatOut 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pointerEvents: "none",
        textShadow: "0 0 10px rgba(255, 68, 68, 0.5)"
      }}
    >
      {change.toLocaleString()}
    </div>

  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const [points, setPoints] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevPoints, setPrevPoints] = useState(0);
  const pathname = usePathname();


  const fetchPoints = () => {
    if (session) {
      fetch("/api/points/ping")
        .then((res) => res.json())
        .then((data) => {
          if (data.points !== undefined) {
            setPoints(data.points);
            setPrevPoints(data.points);
          }
        })
        .catch((e) => console.error("Chyba při načítání bodů", e));
    }
  };


  useEffect(() => {
    fetchPoints();
    
    const handleUpdate = (e: any) => {
      if (e.detail?.points !== undefined) {
        if (e.detail.points < points) {
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 600);
        }
        setPoints(e.detail.points);
      }
    };

    window.addEventListener('points-update', handleUpdate);
    return () => window.removeEventListener('points-update', handleUpdate);
  }, [session, points]);



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

            <Link 
              href="/#how-to-get-points" 
              className="points-display-link"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  const el = document.getElementById('how-to-get-points');
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetTop = scrollTop + rect.top - (window.innerHeight / 2) + (rect.height / 2);
                    
                    // Custom gradual smooth scroll animation
                    const startY = window.pageYOffset;
                    const distance = targetTop - startY;
                    const duration = 1200; // 1.2 seconds for a nice gradual feel
                    let startTime: number | null = null;

                    const animation = (currentTime: number) => {
                      if (startTime === null) startTime = currentTime;
                      const timeElapsed = currentTime - startTime;
                      const progress = Math.min(timeElapsed / duration, 1);
                      
                      // EaseInOutQuad function
                      const ease = progress < 0.5 
                        ? 2 * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                      window.scrollTo(0, startY + (distance * ease));
                      
                      if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                      }
                    };

                    requestAnimationFrame(animation);
                  }
                }
              }}
            >
              <div className={`points-display ${isFlashing ? "flash-red" : ""}`} style={{ position: "relative" }}>

                <GemIcon size={20} />

                <RollingNumber value={points} /> bodů

                
                {/* Points Change Animation */}
                <PointsChange points={points} />
              </div>

            </Link>
            
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
