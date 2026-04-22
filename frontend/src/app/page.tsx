"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Globe,
  FileKey,
  XCircle,
  FileText,
  CheckCircle2,
  Server,
  LayoutDashboard,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/ui/Logo";
import { ScanProgress } from "@/components/ScanProgress";
import { useReducedMotion } from "framer-motion";

// Brand logos as SVGs
const BRAND_LOGOS = [
  {
    name: "Vercel",
    path: "M13 1L26 25H0L13 1Z",
    viewBox: "0 0 26 26"
  },
  {
    name: "Supabase",
    path: "M10.1,21.9L1.9,13.7c-0.2-0.2-0.2-0.5,0-0.7l0.7-0.7c0.2-0.2,0.5-0.2,0.7,0l6.8,6.8l16.1-16.1c0.2-0.2,0.5-0.2,0.7,0l0.7,0.7c0.2,0.2,0.2,0.5,0,0.7L10.5,21.9C10.3,22.1,10.1,22.1,10.1,21.9z", // Placeholder lightning
    viewBox: "0 0 24 24"
  },
  {
    name: "Stripe",
    path: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921",
    viewBox: "0 0 24 24"
  }
];

// Character animation variants
const letterVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
    },
  }),
};

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${apiUrl}/scan/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || "Scan failed");
      }

      const data = await res.json();
      router.push(`/results/${data.scan_id}`);
    } catch (err) {
      let message = err instanceof Error ? err.message : "An unexpected error occurred";
      
      if (message.includes("Authentication required")) {
        message = "Please log in to scan your site. It's free!";
      }
      
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-foreground selection:bg-accent selection:text-background font-sans">
      <ScanProgress isOpen={loading} />
      
      {/* Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A0E14]/80 backdrop-blur-[12px] border-b border-white/10" : "bg-transparent border-b border-transparent"
      }`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Logo className="text-xl" />
          </Link>
          <nav className="hidden md:flex gap-8 text-[11px] font-medium text-muted uppercase tracking-[0.2em] font-mono">
            <a href="#features" className="hover:text-accent transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-accent transition-colors"
            >
              How it works
            </a>
            <a href="#pricing" className="hover:text-accent transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-accent transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex gap-4 items-center">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[11px] font-bold text-background bg-accent hover:brightness-110 px-6 py-2.5 rounded-md transition-all font-mono uppercase tracking-[0.2em]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-[11px] font-medium text-muted hover:text-white transition-colors uppercase tracking-[0.2em] font-mono"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden border-b border-white/5 bg-[#0A0E14]">
          <div className="absolute inset-0 hero-glow pointer-events-none" />
          <div className="hero-pulse" />
          
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 pt-48 pb-32 text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center"
            >
              <div className="mb-4 flex">
                {"LYNCE".split("").map((char, i) => (char === " " ? (
                  <span key={i}>&nbsp;</span>
                ) : (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={letterVariant}
                    className="text-[48px] md:text-[64px] font-bold text-white font-mono tracking-widest uppercase"
                  >
                    {char}
                  </motion.span>
                )))}
              </div>

              <motion.div
                variants={fadeUp}
                className="flex items-center mb-8"
              >
                <span className="logo-accent">✦</span>
                <span className="section-label">Site Security Audit Engine</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="hero-headline mb-6 max-w-3xl"
              >
                Absolute Visibility. <br className="hidden md:block" /> Seamless Security.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="tagline max-w-[600px] mb-12"
              >
                The advanced vulnerability scanner for WordPress professionals. 
                Full audits for security headers, SSL, and sensitive files. 
              </motion.p>

              <motion.div 
                variants={fadeUp} 
                initial={{ scale: shouldReduceMotion ? 1 : 1.02, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl"
              >
                <form
                  onSubmit={handleScan}
                  className="flex flex-col sm:flex-row gap-4 p-2 bg-[#0D1117] border border-white/5 rounded-xl focus-within:border-accent/40 transition-colors"
                >
                  <div className="flex-1 flex items-center px-4 gap-3">
                    <Globe className="h-4 w-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Enter website URL..."
                      aria-label="Target URL to scan"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full h-12 bg-transparent text-white placeholder-muted focus:outline-none text-sm font-mono uppercase tracking-tight"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading || !url}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    className={`btn-scan-now h-14 whitespace-nowrap min-w-[200px] flex items-center justify-center gap-2 group relative overflow-hidden ${!loading && "scan-btn-pulse"}`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 font-mono">
                        <Loader2 className="h-4 w-4 animate-spin text-background" />
                        <span>SCANNING</span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >.</motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        >.</motion.span>
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        >.</motion.span>
                      </div>
                    ) : (
                      <>
                        <span>SCAN NOW</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        {/* Ripple effect simplified with absolute positioned div */}
                        <motion.div
                          className="absolute inset-0 bg-white/20 pointer-events-none"
                          initial={{ scale: 0, opacity: 0 }}
                          whileTap={{ 
                            scale: 2, 
                            opacity: [0, 1, 0],
                            transition: { duration: 0.6 } 
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                </form>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-[13px] text-fail font-normal font-mono uppercase tracking-tight"
                  >
                    [ Error: {error} ]
                  </motion.p>
                )}
                <p className="mt-6 text-[11px] text-muted/50 font-mono tracking-[0.2em] uppercase">
                  100% Free • No signup required
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full border-b border-white/5 bg-[#0A0E14] py-16"
        >
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="section-label mb-10 opacity-40">
              Trusted by 10,000+ top security teams globally
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale contrast-[200%] transition-opacity hover:opacity-100 duration-500">
              <div className="flex items-center gap-2 font-bold text-sm tracking-[0.2em] font-mono" role="img" aria-label="Cloudflare">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M2.5 16.5c-0.8 0-1.5-0.7-1.5-1.5s0.7-1.5 1.5-1.5c0.1 0 0.2 0 0.3 0C3.4 11 5.3 9.3 7.8 9.3c0.3 0 0.5 0 0.7 0.1C9.6 7.2 12.2 6 15.3 6c2.8 0 5.2 1.1 6.8 2.8 0.6-0.3 1.3-0.5 2-0.5 2.3 0 4.2 1.9 4.2 4.2 0 0.4-0.1 0.8-0.2 1.1 1.7 1.2 2.8 3.1 2.8 5.3 0 3.6-2.9 6.5-6.5 6.5l-22 0C1.1 23 0 21.9 0 20.5S1.1 18 2.5 18c0.1 0 0.2 0 0.3 0C2.6 17.5 2.5 17 2.5 16.5z"/>
                </svg>
                CLOUDFLARE
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-[0.2em] font-mono" role="img" aria-label="Vercel">
                <svg viewBox="0 0 26 26" fill="currentColor" className="h-5 w-5">
                  <path d="M13 1L26 25H0L13 1Z" />
                </svg>
                VERCEL
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-[0.2em] font-mono" role="img" aria-label="Okta">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0zm0 18c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"/>
                </svg>
                OKTA
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-[0.2em] font-mono" role="img" aria-label="Stripe">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                   <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921" />
                </svg>
                STRIPE
              </div>
              <div className="flex items-center gap-2 font-bold text-sm tracking-[0.2em] font-mono" role="img" aria-label="Supabase">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M21.36 11.23L13.14 2c-.18-.2-.5-.2-.68 0L4.24 11.23c-.12.14-.12.36 0 .5l8.22 9.23c.18.2.5.2.68 0l8.22-9.23c.12-.14.12-.36 0-.5z" />
                </svg>
                SUPABASE
              </div>
            </div>
          </div>
        </motion.section>

        {/* FEATURES GRID */}
        <section id="features" className="w-full bg-[#0A0E14] py-32 border-b border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-24 text-center">
              <div className="text-[11px] font-bold text-accent mb-4 tracking-[0.2em] font-mono uppercase">Features</div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Full Spectrum Audit.
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                We check the parameters that matter, delivering actionable
                intelligence straight to you and your clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              {[
                { icon: Lock, title: "SSL Configuration", desc: "Analyzes certificate validity, protocols, and encryption strength against modern standards." },
                { icon: Globe, title: "Security Headers", desc: "Checks for missing protections like CSP, HSTS, and X-Content-Type-Options to prevent XSS." },
                { icon: ShieldCheck, title: "WordPress Safety", desc: "Detects outdated core installations, vulnerable plugins, and unnecessarily exposed admin portals." },
                { icon: FileKey, title: "Sensitive Files", desc: "Scans for exposed environmental (.env) files, hidden Git repositories, and accessible server logs." },
                { icon: XCircle, title: "Blacklist Check", desc: "Verifies your domain reputation against major security blocklists like Google Safe Browsing." },
                { icon: FileText, title: "PDF Reporting", desc: "Generate executive-ready, branded PDF reports to share findings easily with your stakeholders." },
              ].map((item, i) => (
                <div key={i} className="p-12 flex flex-col items-start bg-[#0A0E14] hover:bg-[#0D1117] transition-colors group">
                  <div className="h-10 w-10 border border-white/10 flex items-center justify-center bg-white/5 mb-10 group-hover:border-accent/40 transition-colors">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4 group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="w-full bg-[#0A0E14] py-32 border-b border-white/5"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-24">
              <div className="text-[11px] font-bold text-accent mb-4 tracking-[0.2em] font-mono uppercase">Workflow</div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Three steps to safety.
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Our rigorous infrastructure runs entirely in the background,
                giving you actionable results in just seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Input URL",
                  desc: "Enter your target domain or IP. No internal access or credentials required on your end.",
                },
                {
                  step: "02",
                  title: "Deep Analysis",
                  desc: "Our engine executes a rapid, non-disruptive black-box audit across multiple attack vectors.",
                },
                {
                  step: "03",
                  title: "Actionble Report",
                  desc: "Instantly view scored findings and clear remediation steps, exported securely as a PDF.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 border border-white/5 rounded-2xl bg-[#0D1117] relative group hover:border-accent/40 transition-colors"
                >
                  <div className="text-[11px] font-bold text-accent mb-10 font-mono tracking-[0.2em]">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="w-full bg-[#0A0E14] py-32 border-b border-white/5"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-24">
              <div className="text-[11px] font-bold text-accent mb-4 tracking-[0.2em] font-mono uppercase">Pricing</div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Clear, transparent pricing.
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Start instantly for free, then scale precisely as your agency demands.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free */}
              <div className="p-10 border border-white/5 bg-[#0D1117] flex flex-col rounded-2xl">
                <div className="text-[11px] font-bold text-muted mb-2 uppercase tracking-widest font-mono opacity-50">Hobby</div>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-semibold text-white tracking-tight">$0</span>
                  <span className="text-muted ml-2 text-sm">/mo</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> 1 Full Scan / day
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> Basic Security Check
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> Community Support
                  </li>
                </ul>
                <button className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-bold uppercase tracking-[0.2em] font-mono transition-colors">
                  Start for free
                </button>
              </div>

              {/* Pro */}
              <div className="p-10 border border-accent/20 bg-[#0D1117] flex flex-col relative overflow-hidden shadow-[0_0_40px_-15px_rgba(0,245,255,0.09)] rounded-2xl">
                <div className="absolute top-0 right-0 bg-accent text-[#0A0E14] text-[10px] font-bold py-1 px-3 uppercase tracking-widest font-mono">POPULAR</div>
                <div className="text-[11px] font-bold text-accent mb-2 uppercase tracking-widest font-mono">Pro</div>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-semibold text-white tracking-tight">$29</span>
                  <span className="text-muted ml-2 text-sm">/mo</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Unlimited Scans
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Real-time Monitoring
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Premium PDF Reports
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Priority Support
                  </li>
                </ul>
                <button className="btn-scan-now w-full h-12">
                  Get Pro
                </button>
              </div>

              {/* Agency */}
              <div className="p-10 border border-white/5 bg-[#0D1117] flex flex-col rounded-2xl">
                <div className="text-[11px] font-bold text-muted mb-2 uppercase tracking-widest font-mono opacity-50">Agency</div>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-semibold text-white tracking-tight">$99</span>
                  <span className="text-muted ml-2 text-sm">/mo</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> Everything in Pro
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> White-label PDFs
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> Dedicated API Key
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/20" /> Webhooks & Automations
                  </li>
                </ul>
                <button className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-bold uppercase tracking-[0.2em] font-mono transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="w-full bg-[#0A0E14] py-32">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-16">
              <div className="text-[11px] font-bold text-accent mb-4 tracking-[0.2em] font-mono uppercase">FAQ</div>
              <h2 className="text-3xl md:text-4xl font-semibold">Frequently asked questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "What exactly does LYNCE scan for?", a: "We perform passive and active checks including SSL configurations, missed security headers, exposed sensitive files like .env or configuration files, and critical CMS vulnerabilities, specifically focused on WordPress installations." },
                { q: "Is it really free?", a: "Yes, our starter plan is fully free for basic, single-use scans each day. Pro and Agency tiers are available when you need advanced features, higher quotas, API access, and branded PDF reporting." },
                { q: "Do you need server access or credentials?", a: "No. Our scanner operates externally resembling standard black-box testing methodologies. We do not require FTP, SSH, or WP-Admin credentials to detect major vulnerabilities and server misconfigurations." },
                { q: "How long does a typical scan take?", a: "For an average domain, a complete routine audit takes between 15 to 30 seconds. Large domains with significant delays or complex blocking may take up to a minute." },
                { q: "Can I rebrand the PDF reports?", a: "Absolutely. Users on our Agency plan can generate beautiful, fully white-labelled PDF reports containing only their own branding, perfect for directly forwarding to clients." },
                { q: "Will scanning affect my site's performance?", a: "No, LYNCE uses rate-limited requests that have almost zero overhead. It is completely safe to run against production websites without disrupting regular traffic." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline hover:text-white transition-colors py-6 uppercase tracking-wider font-mono">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted text-[14px] pb-6 leading-relaxed font-sans">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0A0E14] border-t border-white/5 pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-32 gap-16">
            <div className="max-w-xs">
              <Logo className="text-xl mb-8" />
              <p className="text-muted text-sm leading-relaxed">
                Absolute Visibility. Seamless Security. <br />
                The advanced vulnerability scanner for WordPress professionals.
              </p>
            </div>

            <div className="flex gap-24 gap-y-12 flex-wrap">
              <div className="flex flex-col gap-5">
                <span className="section-label text-white opacity-40">Product</span>
                <a href="#features" className="text-sm text-muted hover:text-accent transition-colors">Features</a>
                <a href="#pricing" className="text-sm text-muted hover:text-accent transition-colors">Pricing</a>
                <a href="#" className="text-sm text-muted hover:text-accent transition-colors">Changelog</a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="section-label text-white opacity-40">Company</span>
                <Link href="/about" className="text-sm text-muted hover:text-accent transition-colors">About</Link>
                <Link href="/blog" className="text-sm text-muted hover:text-accent transition-colors">Blog</Link>
                <Link href="/contact" className="text-sm text-muted hover:text-accent transition-colors">Contact</Link>
              </div>
              <div className="flex flex-col gap-5">
                <span className="section-label text-white opacity-40">Legal</span>
                <Link href="/privacy" className="text-sm text-muted hover:text-accent transition-colors">Privacy</Link>
                <Link href="/terms" className="text-sm text-muted hover:text-accent transition-colors">Terms</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5">
            <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] opacity-40">
              © {new Date().getFullYear()} LYNCE SECURITY. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8 mt-6 md:mt-0 font-mono text-[10px] tracking-[0.2em] uppercase">
              <a href="#" className="text-muted hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-muted hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-muted hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
