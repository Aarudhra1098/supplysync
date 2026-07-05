import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { IntroShell } from "@/components/layout/IntroShell";

export const metadata: Metadata = {
  title: "SupplySync AI — B2B Marketplace for MSMEs",
  description:
    "Real-time B2B demand-supply marketplace connecting small business buyers with verified local suppliers, powered by predictive AI agents.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SupplySync AI" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        style={{
          backgroundColor: "var(--paper)",
          color: "var(--graphite-900)",
          fontFamily: "var(--font-body)",
        }}
      >
        <IntroShell />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

