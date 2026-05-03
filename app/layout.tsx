// Corrected Git configuration for Vercel tracking
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ezyyk.com",
  description: "Sleduj stream ezyyk na Kicku, sbírej body a vyměň je za skvělé odměny!",
};

import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={inter.variable}>
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
// Deployment trigger with correct git email
