"use client";

import { motion } from "framer-motion";

export function TypographyDemo() {
  return (
    <div className="space-y-12 p-8 border border-white/5 rounded-2xl bg-[#0D1117]">
      <div>
        <h3 className="section-label mb-4 opacity-50 font-mono tracking-[0.3em]">GEIST MONO EXAMPLES</h3>
        <div className="space-y-4">
          <h1 className="text-6xl font-bold font-mono tracking-tighter uppercase">LYNCE SCANNER</h1>
          <h2 className="text-4xl font-semibold font-mono tracking-tight uppercase">Security Engine v1.0</h2>
          <p className="text-xl font-medium font-mono text-accent">0x7F4A [CRITICAL VULNERABILITY DETECTED]</p>
          <p className="text-sm font-normal font-mono text-muted uppercase tracking-widest">Scanning network interfaces... OK</p>
        </div>
      </div>

      <div>
        <h3 className="section-label mb-4 opacity-50 font-mono tracking-[0.3em]">GEIST SANS EXAMPLES</h3>
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">Modern Security Infrastructure</h1>
          <p className="text-xl text-muted leading-relaxed max-w-2xl">
            The advanced vulnerability scanner for WordPress professionals. Identify misconfigurations, outdated plugins, and exposed sensitive files with absolute precision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-white/10 rounded-lg">
              <span className="block text-xs font-bold uppercase text-accent mb-1 font-mono tracking-widest">Small Text</span>
              <p className="text-sm text-foreground/80">Standard accessibility-friendly interface text.</p>
            </div>
            <div className="p-4 border border-white/10 rounded-lg">
              <span className="block text-xs font-bold uppercase text-accent mb-1 font-mono tracking-widest">System Label</span>
              <p className="text-xs text-muted">Technical metadata and status indicator styles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
