"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Trophy, Gem, ChevronLeft, ChevronRight, Crown, Medal, Award } from "lucide-react";
import Link from "next/link";
import { formatPoints } from "@/lib/format";
import GemIcon from "@/components/GemIcon";

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

  const others = users.slice(3);
  const topThree = users.slice(0, 3);
  
  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree[1] ? { user: topThree[1], rank: 2 } : null,
    topThree[0] ? { user: topThree[0], rank: 1 } : null,
    topThree[2] ? { user: topThree[2], rank: 3 } : null,
  ].filter(Boolean) as { user: LeaderboardUser; rank: number }[];

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
          {loading ? (
            <div className="lb-loading">Načítání žebříčku...</div>
          ) : users.length === 0 ? (
            <div className="lb-empty">Žádní uživatelé v žebříčku</div>
          ) : (
            <>
              {/* PODIUM (Only on first page) */}
              {page === 1 && topThree.length > 0 && (
                <div className="lb-podium">
                  {podiumOrder.map((item) => (
                    <Link 
                      href={`/profile/${item.user.name}`} 
                      key={item.user.name + item.rank} 
                      className={`podium-item podium-item-${item.rank}`}
                    >
                      {item.rank === 1 && <Crown size={32} className="podium-crown" />}
                      <div className="podium-avatar">
                        {item.user.avatar_url ? (
                          <img src={item.user.avatar_url} alt={item.user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-primary)", color: "white", fontWeight: "bold", fontSize: "1.5rem" }}>
                            {item.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="podium-rank-box glass-panel">
                        <div className="podium-name">{item.user.name}</div>
                        <div className="podium-points">
                          <GemIcon size={18} />
                          <span>{formatPoints(item.user.points)}</span>
                        </div>
                        <div style={{ marginTop: "auto", fontWeight: "800", fontSize: "2rem", opacity: 0.2 }}>
                          {item.rank}.
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="lb-table glass-panel">
                {(page === 1 ? others : users).map((user, index) => {
                  const rank = (page - 1) * 20 + (page === 1 ? index + 4 : index + 1);
                  return (
                    <Link href={`/profile/${user.name}`} key={user.name + rank} className={`lb-row ${getRankClass(rank)}`} style={{ textDecoration: "none", cursor: "pointer" }}>
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
                        <GemIcon size={16} />
                        <span>{formatPoints(user.points)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

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
