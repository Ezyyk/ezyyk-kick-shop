"use client";
import "./admin.css";
import React, { useState, useEffect } from "react";
import { Lock, Users, ShoppingCart, Package, Trash2, Plus, ExternalLink, ArrowLeft, Search, Edit3, Save, X, Gift, Trophy, Ticket, MessageSquare } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface User {
  id: string;
  name: string;
  points: number;
  is_sub: boolean;
  last_ping: string;
  trade_url: string;
}

interface Purchase {
  id: number;
  user_id: string;
  user_name: string;
  item_id: string;
  item_title: string;
  cost: number;
  purchased_at: string;
  trade_url: string;
  current_points: number;
}

interface ShopItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  image_url: string;
  category: string;
  stock: number;
}

interface AdminGiveaway {
  id: string;
  title: string;
  description: string;
  image_url: string;
  ticket_cost: number;
  ends_at: string;
  winner_name: string | null;
  status: string;
  total_tickets: number;
  ticket_holders: { user_name: string; count: number }[];
}

type Tab = "purchases" | "users" | "items" | "giveaways" | "bot";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("purchases");

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [giveaways, setGiveaways] = useState<AdminGiveaway[]>([]);

  // New / Edit item form
  const [newItem, setNewItem] = useState({ id: "", title: "", description: "", cost: 0, imageUrl: "", category: "other", stock: -1 });
  const [showForm, setShowForm] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);

  // New giveaway form
  const [newGiveaway, setNewGiveaway] = useState({ id: "", title: "", description: "", ticketCost: 100, endsAt: "", imageUrl: "" });
  const [showGwForm, setShowGwForm] = useState(false);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingPoints, setEditingPoints] = useState(false);
  const [editPointsValue, setEditPointsValue] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/verify");
      if (res.ok) {
        setAuthenticated(true);
        loadData();
      }
    } catch {}
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword("");
        loadData();
      } else {
        setError("Nesprávné heslo");
      }
    } catch {
      setError("Chyba připojení");
    }
  };

  const loadData = async () => {
    try {
      const [usersRes, purchasesRes, itemsRes, gwRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/purchases"),
        fetch("/api/admin/items"),
        fetch("/api/admin/giveaways"),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
      if (purchasesRes.ok) {
        const data = await purchasesRes.json();
        setPurchases(data.purchases);
      }
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setShopItems(data.items);
      }
      if (gwRes.ok) {
        const data = await gwRes.json();
        setGiveaways(data);
      }
    } catch (e) {
      console.error("Chyba při načítání dat", e);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/items", {
        method: isEditingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const data = await res.json();
        setShopItems(data.items);
        setNewItem({ id: "", title: "", description: "", cost: 0, imageUrl: "", category: "other", stock: -1 });
        setShowForm(false);
        setIsEditingItem(false);
      } else {
        const data = await res.json();
        alert("Chyba: " + (data.error || "Nepodařilo se uložit item"));
      }
    } catch (e) {
      console.error("Chyba při ukládání itemu", e);
      alert("Chyba připojení");
    }
  };

  const handleEditItemClick = (item: ShopItem) => {
    setNewItem({
      id: item.id,
      title: item.title,
      description: item.description || "",
      cost: item.cost,
      imageUrl: item.image_url || "",
      category: item.category || "other",
      stock: item.stock ?? -1
    });
    setIsEditingItem(true);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Opravdu smazat tento item?")) return;
    try {
      const res = await fetch("/api/admin/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        setShopItems(data.items);
      } else {
        const data = await res.json();
        alert("Chyba: " + (data.error || "Nepodařilo se smazat item"));
      }
    } catch (e) {
      console.error("Chyba při mazání itemu", e);
      alert("Chyba připojení");
    }
  };


  const handleUpdatePoints = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, points: editPointsValue }),
      });
      if (res.ok) {
        setEditingPoints(false);
        loadData();
        setSelectedUser({ ...selectedUser, points: editPointsValue });
      }
    } catch (e) {
      console.error("Chyba při úpravě bodů", e);
    }
  };

  const openUserDetail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditPointsValue(user.points);
      setEditingPoints(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  );

  const filteredPurchases = purchases.filter(p =>
    (p.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.item_title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Načítání...</div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login-card">
          <div className="admin-login-icon">
            <Lock size={48} />
          </div>
          <h1>Admin Panel</h1>
          <p>ezyyk.com</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Zadej heslo..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              autoFocus
            />
            <button type="submit" className="admin-btn admin-btn-primary">
              <Lock size={16} /> Přihlásit
            </button>
            {error && <div className="admin-error">{error}</div>}
          </form>
          <a href="/" className="admin-back-link">
            <ArrowLeft size={14} /> Zpět na hlavní stránku
          </a>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="admin-container">
      <div className="admin-dashboard">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title">⚡ Admin Panel</h1>
            <span className="admin-badge">ezyyk.com</span>
          </div>
          <a href="/" className="admin-back-link">
            <ArrowLeft size={14} /> Hlavní stránka
          </a>
        </header>

        {/* STATS */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <Users size={24} />
            <div>
              <div className="admin-stat-value">{users.length}</div>
              <div className="admin-stat-label">Uživatelů</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <ShoppingCart size={24} />
            <div>
              <div className="admin-stat-value">{purchases.length}</div>
              <div className="admin-stat-label">Nákupů</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <Package size={24} />
            <div>
              <div className="admin-stat-value">{shopItems.length}</div>
              <div className="admin-stat-label">Itemů v shopu</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "purchases" ? "active" : ""}`}
            onClick={() => setActiveTab("purchases")}
          >
            <ShoppingCart size={16} /> Historie nákupů
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} /> Uživatelé
          </button>
          <button
            className={`admin-tab ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
          >
            <Package size={16} /> Shop Itemy
          </button>
          <button
            className={`admin-tab ${activeTab === "giveaways" ? "active" : ""}`}
            onClick={() => setActiveTab("giveaways")}
          >
            <Gift size={16} /> Giveaways
          </button>
          <button
            className={`admin-tab ${activeTab === "bot" ? "active" : ""}`}
            onClick={() => setActiveTab("bot")}
          >
            <MessageSquare size={16} /> Bot & Kódy
          </button>
        </div>

        {/* SEARCH */}
        {activeTab !== "items" && (
          <div className="admin-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={activeTab === "users" ? "Hledat uživatele..." : "Hledat nákup..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        )}

        {/* PURCHASES TAB */}
        {activeTab === "purchases" && (
          <div className="admin-panel">
            {filteredPurchases.length === 0 ? (
              <div className="admin-empty">Zatím žádné nákupy</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Uživatel</th>
                      <th>Item</th>
                      <th>Cena</th>
                      <th>Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((p) => (
                      <tr key={p.id}>
                        <td className="admin-td-date">
                          {new Date(p.purchased_at.replace(" ", "T") + "Z").toLocaleString("cs-CZ")}
                        </td>
                        <td>
                          <button className="admin-link-btn" onClick={() => openUserDetail(p.user_id)}>
                            {p.user_name}
                          </button>
                        </td>
                        <td>{p.item_title}</td>
                        <td className="admin-td-cost">{p.cost.toLocaleString()} bodů</td>
                        <td>
                          <button className="admin-btn-small" onClick={() => openUserDetail(p.user_id)}>
                            Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="admin-panel">
            {filteredUsers.length === 0 ? (
              <div className="admin-empty">Žádní uživatelé</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Jméno</th>
                      <th>Body</th>
                      <th>Steam Trade URL</th>
                      <th>Poslední aktivita</th>
                      <th>Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="admin-td-name">{u.name}</td>
                        <td className="admin-td-points">{u.points.toLocaleString()}</td>
                        <td>
                          {u.trade_url ? (
                            <a href={u.trade_url} target="_blank" rel="noreferrer" className="admin-trade-link">
                              <ExternalLink size={12} /> Otevřít
                            </a>
                          ) : (
                            <span className="admin-td-empty">—</span>
                          )}
                        </td>
                        <td className="admin-td-date">
                          {u.last_ping ? new Date(u.last_ping.replace(" ", "T") + "Z").toLocaleString("cs-CZ") : "—"}
                        </td>
                        <td>
                          <button className="admin-btn-small" onClick={() => openUserDetail(u.id)}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === "items" && (
          <div className="admin-panel">
            <div className="admin-items-header">
              <h3>Vlastní itemy</h3>
              <button className="admin-btn admin-btn-primary" onClick={() => {
                if (!showForm) {
                  setNewItem({ id: "", title: "", description: "", cost: 0, imageUrl: "", category: "other", stock: -1 });
                  setIsEditingItem(false);
                }
                setShowForm(!showForm);
              }}>
                <Plus size={16} /> Přidat item
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSaveItem} className="admin-item-form" style={{ background: "var(--glass-bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "2rem" }}>
                <h4 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem", color: "var(--text-primary)" }}>
                  {isEditingItem ? "Upravit položku" : "Vytvořit novou položku"}
                </h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>ID (unikátní)</label>
                    <input
                      type="text"
                      placeholder="napr. mc_vip"
                      value={newItem.id}
                      onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Název</label>
                    <input
                      type="text"
                      placeholder="napr. Minecraft VIP"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Cena (body)</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={newItem.cost || ""}
                      onChange={(e) => setNewItem({ ...newItem, cost: parseInt(e.target.value) || 0 })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Kategorie</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="admin-input"
                    >
                      <option value="cs2">Counter Strike 2</option>
                      <option value="minecraft">Minecraft</option>
                      <option value="other">Ostatní</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Množství (Sklad)</label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="Počet kusů"
                        disabled={newItem.stock === -1}
                        value={newItem.stock === -1 ? "" : newItem.stock}
                        onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                        className="admin-input"
                        style={{ flex: 1 }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                        <input 
                          type="checkbox" 
                          checked={newItem.stock === -1} 
                          onChange={(e) => setNewItem({ ...newItem, stock: e.target.checked ? -1 : 10 })}
                        />
                        Neomezeno
                      </label>
                    </div>
                  </div>
                  <div className="admin-form-group admin-form-wide">
                    <label>Popis</label>
                    <input
                      type="text"
                      placeholder="Popis itemu..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <ImageUploader
                    label="Obrázek itemu"
                    value={newItem.imageUrl}
                    onChange={(url) => setNewItem({ ...newItem, imageUrl: url })}
                  />
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Save size={16} /> {isEditingItem ? "Uložit změny" : "Vytvořit"}
                  </button>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => { setShowForm(false); setIsEditingItem(false); }}>
                    Zrušit
                  </button>
                </div>
              </form>
            )}

            {shopItems.length === 0 ? (
              <div className="admin-empty">Zatím žádné vlastní itemy</div>
            ) : (
              <div className="admin-items-grid">
                {shopItems.map((item) => (
                  <div key={item.id} className="admin-item-card">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="admin-item-image" />
                    )}
                    <div className="admin-item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <div className="admin-item-meta">
                        <span className="admin-item-cost">{item.cost.toLocaleString()} bodů</span>
                        <span className="admin-item-category">{item.category}</span>
                        <span className="admin-item-stock" style={{ color: item.stock === 0 ? "#ff4444" : (item.stock === -1 ? "#00e5ff" : "#fff") }}>
                          {item.stock === -1 ? "Neomezeno" : `Sklad: ${item.stock} ks`}
                        </span>
                      </div>
                    </div>
                    <div className="admin-item-actions" style={{ display: "flex", gap: "0.5rem", position: "absolute", top: "1rem", right: "1rem" }}>
                      <button className="admin-btn-small" style={{ padding: "0.25rem 0.5rem" }} onClick={() => handleEditItemClick(item)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="admin-btn-delete" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GIVEAWAYS TAB */}
        {activeTab === "giveaways" && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h2><Gift size={20} /> Giveaways</h2>
              <button className="admin-btn admin-btn-primary" onClick={() => setShowGwForm(!showGwForm)}>
                <Plus size={16} /> Nový Giveaway
              </button>
            </div>

            {showGwForm && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch("/api/admin/giveaways", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newGiveaway),
                  });
                  if (res.ok) {
                    setNewGiveaway({ id: "", title: "", description: "", ticketCost: 100, endsAt: "", imageUrl: "" });
                    setShowGwForm(false);
                    loadData();
                  }
                } catch {}
              }} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>ID</label>
                    <input type="text" placeholder="gw_001" value={newGiveaway.id} onChange={(e) => setNewGiveaway({...newGiveaway, id: e.target.value})} className="admin-input" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Název</label>
                    <input type="text" placeholder="AWP Dragon Lore" value={newGiveaway.title} onChange={(e) => setNewGiveaway({...newGiveaway, title: e.target.value})} className="admin-input" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Cena ticketu (body)</label>
                    <input type="number" placeholder="100" value={newGiveaway.ticketCost || ""} onChange={(e) => setNewGiveaway({...newGiveaway, ticketCost: parseInt(e.target.value) || 0})} className="admin-input" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Konec (datum a čas)</label>
                    <input type="datetime-local" value={newGiveaway.endsAt} onChange={(e) => setNewGiveaway({...newGiveaway, endsAt: e.target.value})} className="admin-input" required />
                  </div>
                  <div className="admin-form-group admin-form-wide">
                    <label>Popis</label>
                    <input type="text" placeholder="Popis giveaway..." value={newGiveaway.description} onChange={(e) => setNewGiveaway({...newGiveaway, description: e.target.value})} className="admin-input" />
                  </div>
                  <ImageUploader
                    label="Obrázek giveaway"
                    value={newGiveaway.imageUrl}
                    onChange={(url) => setNewGiveaway({ ...newGiveaway, imageUrl: url })}
                  />
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn admin-btn-primary"><Save size={16} /> Vytvořit</button>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowGwForm(false)}>Zrušit</button>
                </div>
              </form>
            )}

            {giveaways.length === 0 ? (
              <div className="admin-empty">Žádné giveaways</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {giveaways.map((gw) => (
                  <div key={gw.id} className="admin-item-card" style={{ flexDirection: "column", alignItems: "stretch" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{gw.title}</h4>
                        <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#aaa" }}>{gw.description}</p>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ color: "#00e5ff" }}><Ticket size={14} style={{ verticalAlign: "middle" }} /> {gw.ticket_cost} bodů/ticket</span>
                          <span style={{ color: gw.status === "active" ? "#4CAF50" : "#ff9800" }}>{gw.status === "active" ? "🟢 Aktivní" : "🔴 Ukončený"}</span>
                          <span style={{ color: "#aaa" }}>📊 {gw.total_tickets} ticketů</span>
                          <span style={{ color: "#aaa" }}>⏰ {new Date(gw.ends_at).toLocaleString("cs-CZ")}</span>
                        </div>
                        {gw.winner_name && (
                          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "#FFD700" }}>
                            <Trophy size={16} /> Výherce: <strong>{gw.winner_name}</strong>
                          </div>
                        )}
                      </div>
                      <button className="admin-btn-delete" onClick={async () => {
                        if (!confirm("Opravdu smazat tento giveaway?")) return;
                        await fetch("/api/admin/giveaways", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: gw.id }) });
                        loadData();
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {gw.ticket_holders.length > 0 && (
                      <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem" }}>Držitelé ticketů:</div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {gw.ticket_holders.map(th => (
                            <span key={th.user_name} style={{ background: "rgba(138,43,226,0.15)", padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", color: "#ccc" }}>
                              {th.user_name} ({th.count}x)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* BOT TAB */}
        {activeTab === "bot" && (
          <div className="admin-panel">
            <div className="admin-section-header">
              <h2><MessageSquare size={20} /> Bot & Kódy</h2>
            </div>
            
            <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>Manual Code Drop</h3>
                <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  Tímto tlačítkem okamžitě vygeneruješ nový 5místný kód, odešleš ho do Kick chatu a deaktivuješ všechny předchozí kódy.
                </p>
                <button 
                  className="admin-btn admin-btn-primary" 
                  onClick={async () => {
                    if (!confirm("Opravdu chceš odeslat nový kód do chatu?")) return;
                    try {
                      const res = await fetch("/api/admin/bot/drop-code", { method: "POST" });
                      if (res.ok) {
                        const data = await res.json();
                        alert(`Kód [ ${data.code} ] byl úspěšně odeslán do chatu!`);
                      } else {
                        const data = await res.json();
                        alert("Chyba: " + (data.error || "Nepodařilo se odeslat kód"));
                      }
                    } catch (e) {
                      alert("Chyba připojení");
                    }
                  }}
                  style={{ padding: "1rem 2rem", fontSize: "1rem" }}
                >
                  <Ticket size={18} /> Odeslat náhodný kód do chatu
                </button>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>Ostatní nastavení</h3>
                <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                  V budoucnu zde přibudou další ovládací prvky pro bota.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USER DETAIL MODAL */}
        {selectedUser && (
          <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
              <h2>Profil uživatele</h2>
              <div className="admin-user-detail">
                <div className="admin-detail-row">
                  <label>Jméno:</label>
                  <span>{selectedUser.name}</span>
                </div>
                <div className="admin-detail-row">
                  <label>ID:</label>
                  <span className="admin-detail-id">{selectedUser.id}</span>
                </div>
                <div className="admin-detail-row">
                  <label>Body:</label>
                  {editingPoints ? (
                    <div className="admin-edit-points">
                      <input
                        type="number"
                        value={editPointsValue}
                        onChange={(e) => setEditPointsValue(parseInt(e.target.value) || 0)}
                        className="admin-input admin-input-sm"
                      />
                      <button className="admin-btn-small admin-btn-save" onClick={handleUpdatePoints}>
                        <Save size={14} />
                      </button>
                      <button className="admin-btn-small" onClick={() => setEditingPoints(false)}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span>
                      {selectedUser.points.toLocaleString()} bodů
                      <button className="admin-btn-icon" onClick={() => { setEditingPoints(true); setEditPointsValue(selectedUser.points); }}>
                        <Edit3 size={14} />
                      </button>
                    </span>
                  )}
                </div>
                <div className="admin-detail-row">
                  <label>Steam Trade URL:</label>
                  {selectedUser.trade_url ? (
                    <a href={selectedUser.trade_url} target="_blank" rel="noreferrer" className="admin-trade-link">
                      <ExternalLink size={14} /> {selectedUser.trade_url.substring(0, 50)}...
                    </a>
                  ) : (
                    <span className="admin-td-empty">Nenastaveno</span>
                  )}
                </div>
                <div className="admin-detail-row">
                  <label>Poslední aktivita:</label>
                  <span>{selectedUser.last_ping ? new Date(selectedUser.last_ping.replace(" ", "T") + "Z").toLocaleString("cs-CZ") : "—"}</span>
                </div>
              </div>

              <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>Historie nákupů</h3>
              <div className="admin-user-purchases">
                {purchases.filter(p => p.user_id === selectedUser.id).length === 0 ? (
                  <div className="admin-empty">Žádné nákupy</div>
                ) : (
                  purchases.filter(p => p.user_id === selectedUser.id).map(p => (
                    <div key={p.id} className="admin-purchase-item">
                      <span className="admin-purchase-title">{p.item_title}</span>
                      <span className="admin-purchase-cost">{p.cost.toLocaleString()} bodů</span>
                      <span className="admin-purchase-date">{new Date(p.purchased_at.replace(" ", "T") + "Z").toLocaleString("cs-CZ")}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
