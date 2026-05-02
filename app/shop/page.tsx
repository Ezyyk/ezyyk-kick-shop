"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import ShopItem from "@/components/ShopItem";
import Header from "@/components/Header";
import { ShoppingBag, ShoppingCart, Gamepad2, Pickaxe, Package, Info } from "lucide-react";

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
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");

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

  const handleBuy = async (id: string, cost: number, userMessage?: string) => {
    if (!session) return;
    setMessage("");

    // Optimistic update
    const previousPoints = points;
    setPoints(prev => prev - cost);
    
    // Notify Header of the update
    window.dispatchEvent(new CustomEvent('points-update', { detail: { points: points - cost } }));

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId: id, 
          cost, 
          title: shopItems.find(i => i.id === id)?.title || id,
          userMessage 
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setPoints(data.points);
        setMessage(data.message);
        // Sync header again with actual value from server
        window.dispatchEvent(new CustomEvent('points-update', { detail: { points: data.points } }));
      } else {
        // Rollback on error
        setPoints(previousPoints);
        window.dispatchEvent(new CustomEvent('points-update', { detail: { points: previousPoints } }));
        setMessage(data.error || "Došlo k chybě");
      }
    } catch (e) {
      setPoints(previousPoints);
      window.dispatchEvent(new CustomEvent('points-update', { detail: { points: previousPoints } }));
      setMessage("Došlo k chybě při nákupu");
    }
    
    setTimeout(() => setMessage(""), 5000);
  };


  const currentItems = shopItems
    .filter(item => item.category === activeCategory)
    .sort((a, b) => sortBy === "desc" ? b.cost - a.cost : a.cost - b.cost);

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        
        <section className="hero-section" style={{ width: "100%", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "300px", height: "100px", background: "var(--accent-primary)", filter: "blur(100px)", opacity: 0.1, zIndex: -1 }}></div>
          <h1 className="hero-title" style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>
            <ShoppingBag size={42} color="var(--accent-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.75rem", filter: "drop-shadow(0 0 10px var(--accent-glow))" }} />
            Shop
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: 500 }}>
            Utrácej nasbírané body za exkluzivní odměny
          </p>
        </section>


        {!session && status !== "loading" ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", width: "100%" }}>
            <ShoppingBag size={48} color="var(--text-secondary)" style={{ opacity: 0.5, margin: "0 auto 1rem auto" }} />

            <h2 style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 500 }}>Pro zobrazení shopu se musíš přihlásit</h2>
          </div>
        ) : session ? (
          <>
            {/* CATEGORY TABS & SORTING */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "1rem" }}>
              <div className="shop-category-tabs" style={{ width: "auto", padding: 0, flex: "1 1 auto" }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Seřadit:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as "asc" | "desc")}
                  style={{ 
                    background: "var(--glass-bg)", 
                    border: "1px solid var(--glass-border)", 
                    color: "var(--text-primary)",
                    padding: "0.5rem 1rem",
                    borderRadius: "50px",
                    outline: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  <option value="desc" style={{ background: "#1a1a1a" }}>Nejdražší</option>
                  <option value="asc" style={{ background: "#1a1a1a" }}>Nejlevnější</option>
                </select>
              </div>
            </div>

            <section style={{ width: "100%" }}>
              {message && (
                <div style={{ 
                  position: "fixed",
                  bottom: "2rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "1rem 2rem", 
                  background: "rgba(138, 43, 226, 0.9)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid var(--accent-primary)",
                  borderRadius: "50px",
                  color: "white",
                  textAlign: "center",
                  zIndex: 1000,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px var(--accent-glow)",
                  animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
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
                    stock={item.stock}
                    imageScale={item.image_scale}
                    requiresMessage={item.requires_message}
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
