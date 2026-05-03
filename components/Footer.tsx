"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  
  if (pathname?.startsWith("/widget")) return null;
  
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-left">
          <p className="copyright">© {currentYear} ezyyk.com</p>
        </div>
        <div className="footer-right">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
