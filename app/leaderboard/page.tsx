"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Trophy, Gem, ChevronLeft, ChevronRight, Crown, Medal, Award } from "lucide-react";

interface LeaderboardUser {
  name: string;
  points: number;
  avatar_url?: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page]);

  const fetchLeaderboard = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Chyba při načítání žebříčku", e);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="rank-icon rank-gold" />;
    if (rank === 2) return <Medal size={20} className="rank-icon rank-silver" />;
    if (rank === 3) return <Award size={20} className="rank-icon rank-bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return "lb-row-gold";
    if (rank === 2) return "lb-row-silver";
    if (rank === 3) return "lb-row-bronze";
    return "";
  };

  return (
    <div className="container">
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title" style={{ fontSize: "2.8rem" }}>
            <Trophy size={36} color="var(--accent-primary)" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            Žebříček
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Top uživatelé podle bodů
          </p>
        </section>

        <section className="lb-section" style={{ width: "100%" }}>
          <div className="lb-table glass-panel">
            {loading ? (
              <div className="lb-loading">Načítání žebříčku...</div>
            ) : users.length === 0 ? (
              <div className="lb-empty">Žádní uživatelé v žebříčku</div>
            ) : (
              <>
                {users.map((user, index) => {
                  const rank = (page - 1) * 20 + index + 1;
                  return (
                    <div key={user.name + rank} className={`lb-row ${getRankClass(rank)}`}>
                      <div className="lb-rank">
                        {getRankIcon(rank)}
                      </div>
                      <div className="lb-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="lb-name">{user.name}</div>
                      <div className="lb-points">
                        <Gem size={16} />
                        <span>{user.points.toLocaleString("cs-CZ")}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="lb-pagination">
              <button
                className="lb-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={18} /> Předchozí
              </button>
              
              <div className="lb-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`lb-page-num ${page === p ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              <button
                className="lb-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Další <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
