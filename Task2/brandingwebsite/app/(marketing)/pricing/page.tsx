// app/(marketing)/pricing/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Viewer node",
    price: "$0",
    desc: "Perfect for local pipeline analysis and testing operations.",
    features: [
      "Single cluster endpoint",
      "Standard GraphQL queries",
      "Basic UI light mode access",
    ],
  },
  {
    name: "Enterprise Pro",
    price: "$79",
    desc: "Designed for production workloads running heavy subscriptions threads.",
    features: [
      "Unlimited node clusters",
      "Real-time WebSocket subscriptions",
      "Admin & editor privilege control",
      "AI integration suite access",
      "24/7 priority SLA routing",
    ],
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 container mx-auto px-4 max-w-5xl space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
          Flexible scaling options
        </h1>
        <p className="text-muted-foreground">
          No lock-in contracts. Upgrade cluster pipelines instantly as your data
          metrics grow.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between space-y-6 rounded-2xl border bg-card p-8 ${
              plan.popular
                ? "border-2 border-[hsl(var(--accent))] shadow-md"
                : "border-border/60 shadow-2xs"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-4 rounded-md bg-[hsl(var(--accent))] px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[hsl(var(--accent-foreground))]">
                Most provisioned
              </span>
            )}
            <div className="space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 border border-[hsl(var(--accent))]" />
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              </div>
              <div className="text-4xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <ul className="space-y-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/signup"
              className={`w-full rounded-md py-3 text-center text-sm font-semibold transition-all ${
                plan.popular
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent)/90%)]"
                  : "bg-muted hover:bg-accent"
              }`}
            >
              Initialize plan
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}