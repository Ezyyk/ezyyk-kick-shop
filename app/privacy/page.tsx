import React from "react";
import Header from "@/components/Header";

export default function PrivacyPage() {
  return (
    <div className="container">
      <Header />
      <main className="main-content" style={{ maxWidth: "900px", textAlign: "left", alignItems: "flex-start", paddingBottom: "6rem" }}>
        <h1 className="hero-title" style={{ fontSize: "2.5rem", textAlign: "left" }}>Zásady ochrany osobních údajů (Privacy Policy)</h1>
        
        <div className="glass-panel" style={{ padding: "2.5rem", width: "100%", lineHeight: "1.7" }}>
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>Poslední aktualizace: 1. května 2026</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>1. Jaké údaje sbíráme?</h2>
          <p>Při používání webu ezyyk.com o vás sbíráme pouze nezbytně nutné údaje pro fungování bodového systému:</p>
          <ul>
            <li><strong>Veřejné údaje z Kick.com:</strong> Uživatelské jméno, uživatelské ID a profilový obrázek. Tyto údaje získáváme při vašem přihlášení přes Kick OAuth.</li>
            <li><strong>Herní údaje:</strong> Pokud si v obchodě zakoupíte předměty vyžadující doručení (např. Steam Trade URL), uložíme si vámi poskytnuté údaje pro účely doručení odměny.</li>
            <li><strong>Aktivita na streamu:</strong> Sledujeme vaši aktivitu v chatu pro účely automatického připisování bodů.</li>
          </ul>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>2. Jak údaje používáme?</h2>
          <p>Vaše údaje používáme výhradně pro:</p>
          <ul>
            <li>Provozování věrnostního systému (připisování bodů).</li>
            <li>Zobrazení vašeho jména v žebříčku nejlepších uživatelů.</li>
            <li>Doručení odměn zakoupených v obchodě.</li>
            <li>Zabezpečení webu a ochranu před zneužitím (např. detekce botů).</li>
          </ul>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>3. Sdílení údajů se třetími stranami</h2>
          <p>Vaše údaje neprodáváme ani nesdílíme s žádnými třetími stranami, s výjimkou případů vyžadovaných zákonem nebo nezbytných pro doručení fyzické odměny (např. dopravci).</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>4. Cookies a místní úložiště</h2>
          <p>Tento web používá soubory cookies a místní úložiště (local storage) k udržení vašeho přihlášení a pro základní funkčnost platformy. Tyto soubory neobsahují citlivé osobní údaje.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>5. Vaše práva</h2>
          <p>Máte právo kdykoli požádat o výpis údajů, které o vás uchováváme, nebo požádat o jejich smazání. Uvědomte si však, že smazáním údajů dojde ke ztrátě všech vašich nasbíraných bodů bez náhrady.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>6. Zabezpečení</h2>
          <p>Snažíme se vaše údaje chránit pomocí moderních šifrovacích metod a zabezpečených serverů. Přesto mějte na paměti, že žádný přenos dat po internetu není 100% bezpečný.</p>
          
          <h2 style={{ marginTop: "2rem", color: "var(--accent-secondary)" }}>7. Kontakt</h2>
          <p>V případě dotazů ohledně ochrany soukromí mě můžete kontaktovat prostřednictvím zpráv na Discordu nebo Instagramu.</p>
        </div>
      </main>
    </div>
  );
}
