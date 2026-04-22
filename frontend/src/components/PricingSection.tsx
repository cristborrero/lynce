"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PricingSection({ currentTier = "free" }: { currentTier?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpgrade = async (tier: string) => {
    setLoading(tier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/auth";
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ tier })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.detail || "Checkout failed");
      }
    } catch (err) {
      alert("Failed to initiate checkout");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      id: "free",
      price: "0",
      features: ["3 Scans / month", "Basic Security Check", "Community Support"],
      cta: "Current Plan",
      disabled: true
    },
    {
      name: "Pro",
      id: "pro",
      price: "29",
      features: ["Unlimited Scans", "Real-time Monitoring", "Native PDF Generator", "Priority Support"],
      cta: "Get Pro",
      disabled: false
    },
    {
      name: "Agency",
      id: "agency",
      price: "99",
      features: ["Everything in Pro", "White-label PDFs", "Dedicated API Key", "Webhooks & Automation"],
      cta: "Go Agency",
      disabled: false
    }
  ];

  return (
    <section id="pricing" className="w-full bg-background border-y border-card-border py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl mb-6">
            Clear, transparent pricing.
          </h2>
          <p className="subheadline max-w-xl mx-auto">
            Start instantly for free, then scale precisely as your agency demands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`p-10 rounded-2xl border ${plan.id === 'pro' ? 'border-accent bg-card shadow-[0_0_30px_rgba(0,245,255,0.1)]' : 'border-card-border bg-card'} flex flex-col relative`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-background px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                  Most Pro
                </div>
              )}
              <h3 className="card-title mb-4 opacity-60">{plan.name}</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-mono font-bold tracking-tight text-white">${plan.price}</span>
                <span className="text-muted ml-2 font-mono text-sm">/MO</span>
              </div>
              <ul className="mb-10 space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80 font-sans">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => plan.id !== 'free' && handleUpgrade(plan.id)}
                disabled={plan.disabled || currentTier === plan.id || loading !== null}
                className={`w-full h-12 rounded-md transition-all text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center ${
                  plan.id === 'pro' 
                    ? 'bg-accent text-background hover:brightness-110 shadow-[0_0_15px_rgba(0,245,255,0.2)]' 
                    : 'border border-card-border hover:border-accent hover:text-accent text-white'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : currentTier === plan.id ? "ACTIVE" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
