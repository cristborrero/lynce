"use client";

import { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { Logo } from "./ui/Logo";

export default function BadgeGenerator() {
  const [copied, setCopied] = useState(false);
  const badgeCode = `<a href="https://lynce.io" target="_blank" rel="noopener noreferrer">
  <img src="https://lynce.io/badge-secured.svg" alt="Secured by LYNCE" width="160" height="40" />
</a>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(badgeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-10 border border-card-border rounded-2xl bg-card max-w-2xl mx-auto shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4 mb-8">
        <ShieldCheck className="h-6 w-6 text-accent shadow-[0_0_10px_rgba(0,245,255,0.4)]" />
        <h3 className="text-xl font-bold uppercase tracking-tight font-mono">Embed Your Trust Badge</h3>
      </div>
      
      <p className="body-text mb-10">
        Show your visitors that security is your top priority. Embed this badge on your site to signify it has been scanned and secured by LYNCE.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
        <div className="p-6 bg-background border border-card-border rounded-lg">
          {/* Badge Preview */}
          <div className="flex items-center gap-3 bg-background px-5 py-2.5 rounded border border-accent/40 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
            <span className="text-accent text-lg">✦</span>
            <span className="text-[11px] font-bold tracking-[0.2em] font-mono text-white uppercase">LYNCE SECURED</span>
          </div>
        </div>
        
        <div className="flex-1 w-full">
          <div className="relative">
            <pre className="p-5 bg-background border border-card-border rounded-lg text-[10px] text-muted overflow-x-auto font-mono leading-relaxed">
              {badgeCode}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 p-2 rounded-md hover:bg-white/5 transition-colors group"
            >
              {copied ? <Check className="h-4 w-4 text-pass" /> : <Copy className="h-4 w-4 text-muted group-hover:text-white" />}
            </button>
          </div>
        </div>
      </div>
      
      <p className="code-text !text-[10px] opacity-40 italic">
        * Pro & Agency users can customize the badge colors and styles in their dashboard settings.
      </p>
    </div>
  );
}
