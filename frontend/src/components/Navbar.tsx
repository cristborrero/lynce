"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { UserNav } from "@/components/UserNav";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = transparent && !scrolled;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      !isTransparent 
        ? "bg-[#0A0E14]/80 backdrop-blur-[12px] border-b border-white/10" 
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <Logo className="text-xl" />
        </Link>
        
        <nav className="hidden md:flex gap-8 text-[11px] font-medium text-muted uppercase tracking-[0.2em] font-mono">
          <Link href="/#features" className="hover:text-accent transition-colors">
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-accent transition-colors"
          >
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-accent transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-accent transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex gap-4 items-center">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
