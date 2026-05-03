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
        
        <div className={styles.header}>
          <div className={styles.iconTitleWrapper}>
            <div className={styles.iconContainer}>
              <GemIcon />
            </div>
            <div className={styles.titleGroup}>
              <h3 className={styles.title}>Soukromí a Cookies</h3>
              <div className={styles.subtitle}>
                <svg
                  className={styles.shieldIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Chráníme vaše data</span>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.description}>
          Používáme nezbytné cookies pro správné fungování webu a analytické cookies ke zlepšení vašeho zážitku. Žádná osobní data neprodáváme ani nesdílíme s třetími stranami.{" "}
          <Link href="/privacy" className={styles.privacyLink}>
            Privacy Policy
          </Link>
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.acceptButton} onClick={handleAcceptAll}>
            Jasně, beru vše!
          </button>
          <button className={styles.secondaryButton} onClick={handleEssentialOnly}>
            Jen to nejnutnější
          </button>
        </div>

        <div className={styles.footer}>
          Přečtěte si naše{" "}
          <Link href="/terms" className={styles.footerLink}>
            Terms of Service
          </Link>
          {" "}a{" "}
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>.
        </div>

      </div>
    </div>
  );
}
