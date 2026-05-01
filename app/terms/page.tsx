import React from "react";
import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <div className="container">
      <Header />
      <main className="main-content" style={{ maxWidth: "900px", textAlign: "left", alignItems: "flex-start", paddingBottom: "6rem" }}>
        <h1 className="hero-title" style={{ fontSize: "2.5rem", textAlign: "left" }}>Podmínky služby (Terms of Service)</h1>
        
        <div className="glass-panel" style={{ padding: "2.5rem", width: "100%", lineHeight: "1.7" }}>
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>Poslední aktualizace: 1. května 2026</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>1. Přijetí podmínek</h2>
          <p>Vstupem na web ezyyk.com a používáním našich služeb (včetně bodového systému a obchodu) souhlasíte s těmito Podmínkami služby. Pokud s jakoukoli částí těchto podmínek nesouhlasíte, prosíme, službu nepoužívejte.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>2. Bodový systém a virtuální měna</h2>
          <p>Body získané na ezyyk.com (dále jen "Body") jsou virtuální odměnou za aktivitu na streamu a nemají žádnou reálnou peněžní hodnotu. Body nelze směnit za skutečné peníze ani převádět na jiné uživatele mimo systém ezyyk.com.</p>
          <ul>
            <li>Body jsou vázány na váš Kick účet.</li>
            <li>Vyhrazujeme si právo body kdykoli upravit, resetovat nebo odebrat v případě zneužití systému (např. botování, exploity).</li>
          </ul>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>3. Obchod a odměny</h2>
          <p>Předměty v obchodě jsou digitální nebo fyzické odměny, které lze získat výměnou za Body.</p>
          <ul>
            <li>Všechny nákupy v obchodě jsou konečné. Body za zakoupené předměty se nevracejí.</li>
            <li>Dostupnost předmětů v obchodě není garantována a může se kdykoli změnit.</li>
            <li>U fyzických odměn nebo digitálních klíčů odpovídá uživatel za poskytnutí správných kontaktních údajů.</li>
          </ul>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>4. Autentizace přes Kick</h2>
          <p>ezyyk.com využívá k přihlášení API platformy Kick.com. Nejsme s platformou Kick.com oficiálně spojeni a neneseme odpovědnost za jakékoli výpadky nebo změny na straně Kick.com, které by mohly ovlivnit funkčnost našich služeb.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>5. Zakázané chování</h2>
          <p>Je přísně zakázáno:</p>
          <ul>
            <li>Používat automatizované systémy (boty) k umělému získávání bodů.</li>
            <li>Zneužívat chyby v systému k vlastnímu prospěchu.</li>
            <li>Pokoušet se o neoprávněný přístup k cizím účtům nebo databázi.</li>
          </ul>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>6. Omezení odpovědnosti</h2>
          <p>Služba ezyyk.com je poskytována "tak, jak je". Neneseme odpovědnost za ztrátu bodů v důsledku technických chyb, výpadků serverů nebo smazání dat.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>7. Změny podmínek</h2>
          <p>Vyhrazujeme si právo tyto podmínky kdykoli změnit. O zásadních změnách budeme informovat prostřednictvím streamu nebo oznámení na tomto webu.</p>
        </div>
      </main>
    </div>
  );
}
