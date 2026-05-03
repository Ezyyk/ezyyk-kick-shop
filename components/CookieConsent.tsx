"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CookieConsent.module.css";
import GemIcon from "./GemIcon";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Zkontroluje, zda uživatel již cookies potvrdil
    const consent = localStorage.getItem("ezyyk-cookies-accepted");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("ezyyk-cookies-accepted", "all");
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("ezyyk-cookies-accepted", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.consentWrapper}>
      <div className={styles.consentCard}>
        <div className={styles.topSection}>
          <div className={styles.iconContainer}>
            <GemIcon />
          </div>
          <button
            className={styles.closeButton}
            onClick={handleEssentialOnly}
            aria-label="Zavřít"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h3 className={styles.title}>Vylepšujeme Ezyyk pomocí Cookies</h3>
        
        <p className={styles.description}>
          Abychom vám mohli nabídnout co nejlepší zážitek, používáme cookies. Některé jsou nutné k tomu, aby web vůbec běžel, a další nám pomáhají analyzovat návštěvnost. Žádná vaše data nikomu neprodáváme!
        </p>

        <div className={styles.actions}>
          <button className={styles.acceptButton} onClick={handleAcceptAll}>
            Jasně, beru vše!
          </button>
          <button className={styles.secondaryButton} onClick={handleEssentialOnly}>
            Jen to nejnutnější
          </button>
        </div>

        <div className={styles.footer}>
          Přečtěte si naše{" "}
          <Link href="/privacy" className={styles.footerLink}>
            Zásady soukromí
          </Link>{" "}
          a{" "}
          <Link href="/terms" className={styles.footerLink}>
            Podmínky
          </Link>.
        </div>
      </div>
    </div>
  );
}
