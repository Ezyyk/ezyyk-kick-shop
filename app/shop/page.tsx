"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import ShopItem from "@/components/ShopItem";
import Header from "@/components/Header";
import { LogIn, ShieldAlert, Gamepad2, Pickaxe, Package } from "lucide-react";
import Button from "@/components/Button";

type Category = "cs2" | "minecraft" | "other";

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "cs2", label: "Counter Strike 2", icon: <Gamepad2 size={16} /> },
  { key: "minecraft", label: "Minecraft", icon: <Pickaxe size={16} /> },
  { key: "other", label: "Ostatní", icon: <Package size={16} /> },
];

export default function ShopPage() {
  const { data: session, status } = useSession();
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("cs2");
  const [shopItems, setShopItems] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
    if (session) {
      fetchPoints();
    }
  }, [session]);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/shop/items");
      if (res.ok) {
        const data = await res.json();
        setShopItems(data);
      }
    } catch (e) {
      console.error("Chyba při načítání itemů z databáze", e);
    }
  };

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/points/ping");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
      }
    } catch (e) {
      console.error("Chyba při načítání bodů", e);
    }
  };

  const handleBuy = async (id: string, cost: number) => {
    if (!session) return;
    setMessage("");
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, cost, title: shopItems.find(i => i.id === id)?.title || id }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setPoints(data.points);
        setMessage(data.message);
      } else {
        setMessage(data.error || "Došlo k chybě");
      }
    } catch (e) {
      setMessage("Došlo k chybě při nákupu");
    }
    
    setTimeout(() => setMessage(""), 5000);
  };

  const currentItems = shopItems.filter(item => item.category === activeCategory);

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        
        <section className="hero-section">
          <h1 className="hero-title" style={{ fontSize: "2.8rem" }}>
            <ShieldAlert size={36} color="var(--accent-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            Shop
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Utrácej nasbírané body za odměny
          </p>
        </section>

        {!session && status !== "loading" ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", width: "100%" }}>
            <ShieldAlert size={48} color="var(--text-secondary)" style={{ opacity: 0.5, margin: "0 auto 1rem auto" }} />
            <h2 style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 500 }}>Pro zobrazení shopu se musíš přihlásit</h2>
          </div>
        ) : session ? (
          <>
            {/* CATEGORY TABS */}
            <div className="shop-category-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  className={`shop-cat-tab ${activeCategory === cat.key ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <section style={{ width: "100%" }}>
              {message && (
                <div style={{ 
                  padding: "1rem", 
                  marginBottom: "1.5rem", 
                  background: "rgba(138, 43, 226, 0.2)", 
                  border: "1px solid var(--accent-primary)",
                  borderRadius: "var(--radius-sm)",
                  color: "white",
                  textAlign: "center"
                }}>
                  {message}
                </div>
              )}

              <div className="shop-grid">
                {currentItems.map((item) => (
                  <ShopItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    cost={item.cost}
                    userPoints={points}
                    imageUrl={item.image_url}
                    onBuy={handleBuy}
                  />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
