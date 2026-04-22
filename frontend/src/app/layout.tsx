import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "LYNCE — Free WordPress Security Audit & Vulnerability Scanner",
  description: "Identify vulnerabilities, check security headers, and scan for exposed files. The best free WordPress security checker for agencies and developers.",
  keywords: ["WordPress security audit", "scan WordPress vulnerabilities free", "WordPress security checker", "CMS security scan", "website security auditor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning prevents false hydration mismatches
          caused by browser extensions injecting attributes into <body> */}
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <PageTransition>
          {children}
        </PageTransition>
        <CookieConsent />
      </body>
    </html>
  );
}
