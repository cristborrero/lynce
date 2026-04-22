"use client";

import { motion, useAnimation, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, ShieldCheck, Lock, Globe, FileKey, XCircle, FileText, CheckCircle2, Crown, AlertTriangle, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Navbar } from "@/components/Navbar";

interface ResultsUIProps {
  scan: any;
  findings: any[];
  user: any;
  accessToken?: string;
  apiUrl: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "var(--critical)";
    case "high": return "var(--fail)";
    case "medium": return "var(--warning)";
    case "low": return "var(--pass)";
    case "pass": return "var(--pass)";
    default: return "var(--muted)";
  }
};

function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0E14]/90 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#0D1117] border border-accent/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.15)]"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 blur-[80px] pointer-events-none" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="h-12 w-12 bg-accent/10 border border-accent/30 flex items-center justify-center rounded-xl">
              <Crown className="h-6 w-6 text-accent shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-muted hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 font-mono tracking-tight uppercase">
            Unlock Premium Reports
          </h2>
          
          <p className="text-muted text-sm leading-relaxed mb-10 font-sans">
            Detailed PDF audits are an <span className="text-accent font-bold">Enterprise-grade</span> feature. 
            Upgrade to LYNCE Pro to generate white-label reports, access deeper vulnerability data, and verify SSL Lab scores.
          </p>

          <div className="space-y-4 mb-10">
            {[
              "Professional White-label PDF Export",
              "Unlimited High-Performance Scans",
              "Advanced SSL Lab Deep-Dive Analysis",
              "Dedicated API Key for Automations",
              "Priority Infrastructure & Support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                </div>
                <span className="text-xs text-foreground/80 font-mono tracking-tight">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/pricing"
              className="btn-scan-now w-full h-14 flex items-center justify-center gap-2 group relative overflow-hidden"
              onClick={onClose}
            >
              <span className="relative z-10 font-bold tracking-widest text-xs">UPGRADE TO LYNCE PRO</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-center text-[10px] text-muted/40 font-mono tracking-widest uppercase">
              Secure checkout via Stripe • Instant access
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = getSeverityColor(severity);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={{ scale: shouldReduceMotion ? 1 : 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-current font-mono"
      style={{ color, borderColor: `rgba(255,255,255,0.1)` }}
    >
      {severity}
    </motion.span>
  );
}

function AnimatedScore({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value, shouldReduceMotion]);

  const radius = 64;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  let color = "text-pass";
  if (value < 50) color = "text-fail";
  else if (value < 90) color = "text-warning";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset: 0 }}
          className="text-card-border"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="currentColor"
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`shadow-[0_0_15px_rgba(0,245,255,0.3)] ${color}`}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute flex flex-col items-center">
        <span className="text-5xl font-mono font-bold leading-none text-white tracking-tighter">{displayValue}</span>
      </span>
    </div>
  );
}

export function ResultsUI({ scan, findings, user, accessToken, apiUrl }: ResultsUIProps) {
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDownloadPDF = async () => {
    // If not logged in, they are definitely free/guest
    if (!user) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Attempt to download. If it fails with 403, show modal.
    // We could also check user metadata if tier info is synced there.
    const pdfUrl = `${apiUrl}/scan/${scan.scan_id}/pdf`;
    
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const checkRes = await fetch(pdfUrl, { 
        method: 'GET',
        headers
      });
      
      if (checkRes.status === 403 || checkRes.status === 401 || checkRes.status === 405) {
        setIsUpgradeModalOpen(true);
      } else if (checkRes.ok) {
        const blob = await checkRes.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        // Handle other errors
        console.error("PDF download failed", checkRes.status);
      }
    } catch (err) {
      console.error("Error checking PDF permissions", err);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto py-40 px-6 space-y-16">
        {!user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-accent/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_30px_rgba(0,245,255,0.05)]"
          >
            <div className="max-w-xl">
              <h3 className="card-title mb-2 !text-accent">✦ Save your scan history</h3>
              <p className="body-text">Create a free account to track your site's security score over time and unlock pro features like White-label PDF reports.</p>
            </div>
            <Link 
              href="/auth" 
              className="btn-scan-now whitespace-nowrap"
            >
              CREATE FREE ACCOUNT →
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 border-b border-card-border pb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="hero-headline !text-4xl mb-4">Site Audit Report</h1>
              <p className="code-text text-xl">/ {scan.target_url}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleDownloadPDF}
                className="btn-scan-now !py-3 !px-6 text-xs h-12 flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                DOWNLOAD PDF REPORT
              </button>
              <Link 
                href="/"
                className="flex items-center h-12 px-6 text-[10px] font-bold uppercase tracking-widest bg-transparent border border-card-border text-white hover:border-accent hover:text-accent rounded-md transition-all font-mono"
              >
                Scan Another Site
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-6 p-8 bg-card border border-card-border rounded-2xl min-w-[200px]"
          >
            <AnimatedScore value={scan.score} />
            <span className="card-title opacity-60">Security Score</span>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {findings.map((finding) => (
            <motion.div 
              key={finding.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex flex-col h-full bg-card border border-card-border rounded-xl p-8 hover:border-accent transition-all duration-200 hover:bg-card-hover group relative overflow-hidden"
            >
              <div className="flex flex-row items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${finding.severity === 'pass' ? 'status-shimmer' : (['critical', 'high'].includes(finding.severity.toLowerCase()) ? 'status-pulse-red' : '')}`}
                    style={{ color: getSeverityColor(finding.severity), backgroundColor: 'currentColor' }}
                  />
                  <h3 className="card-title opacity-80">{finding.category}</h3>
                </div>
                <SeverityBadge severity={finding.severity} />
              </div>
              
              <div className="flex-1 flex flex-col">
                <h4 className="text-white font-bold mb-4 uppercase tracking-tight font-mono">{finding.title}</h4>
                <p className="body-text mb-8 flex-1 leading-relaxed">
                  {finding.description}
                </p>
                
                {finding.recommendation && (
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-accent mb-3 font-mono">✦ Recommendation</span>
                    <p className="text-sm text-foreground/90 leading-relaxed font-sans">{finding.recommendation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {findings.length === 0 && (
            <motion.div 
              className="col-span-1 md:col-span-2 text-center py-32 bg-card border border-accent/20 rounded-2xl shadow-[0_0_40px_rgba(0,245,255,0.05)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div 
                className="mx-auto w-4 h-4 rounded-full bg-pass mb-8 shadow-[0_0_20px_rgba(0,245,255,0.5)] status-shimmer" 
              />
              <h3 className="text-2xl font-mono font-bold text-white uppercase tracking-[0.2em]">Perfect Security</h3>
              <p className="body-text mt-4">No vulnerabilities detected in this environment. System is secure.</p>
            </motion.div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {isUpgradeModalOpen && (
          <UpgradeModal 
            isOpen={isUpgradeModalOpen} 
            onClose={() => setIsUpgradeModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
