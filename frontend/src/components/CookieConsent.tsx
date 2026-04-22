"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 animate-in fade-in slide-in-from-bottom-5">
      <div className="container mx-auto max-w-4xl bg-card border border-card-border p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="body-text !text-xs">
          <p className="leading-relaxed">
            LYNCE uses cookies to optimize infrastructure and analyze traffic. By continuing, you consent to our security-first data processing. 
            Review our <Link href="/privacy" className="text-accent underline hover:brightness-110 transition-all">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={declineCookies} 
            className="w-full md:w-auto px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-all font-mono"
          >
            Decline
          </button>
          <button 
            onClick={acceptCookies} 
            className="btn-scan-now !py-2.5 !px-8 !text-[10px] w-full md:w-auto"
          >
            ACCEPT ALL
          </button>
        </div>
      </div>
    </div>
  );
}
