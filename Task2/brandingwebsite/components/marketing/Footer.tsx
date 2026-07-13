"use client";

import React from "react";
import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const FOOTER_COLUMNS = [
  {
    label: "Engine",
    links: [
      { href: "/features", label: "Core Features" },
      { href: "/pricing", label: "Cluster Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    label: "Resources",
    links: [
      { href: "/blog", label: "Platform Blog" },
      { href: "/contact", label: "Support Center" },
      { href: "/docs", label: "Documentation" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/legal", label: "Legal" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://github.com", label: "gh" },
  { href: "https://x.com", label: "x" },
  { href: "https://linkedin.com", label: "in" },
];

const UPTIME_PERCENT = "99.98%";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-muted/10 pt-20 pb-8">
      {/* node-map: horizontal bus + a node/drop-line above each of the 4 columns */}
      <svg
        aria-hidden
        className="absolute top-0 left-0 hidden h-16 w-full md:block"
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
      >
        <line
          x1="60"
          y1="14"
          x2="1140"
          y2="14"
          stroke="hsl(var(--accent))"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        {[150, 470, 790, 1080].map((x) => (
          <g key={x}>
            <circle cx={x} cy="14" r="3" fill="hsl(var(--accent))" />
            <line x1={x} y1="14" x2={x} y2="46" stroke="hsl(var(--accent))" strokeOpacity="0.5" strokeWidth="1" />
          </g>
        ))}
      </svg>

      <div className="container relative mx-auto grid grid-cols-2 gap-x-8 gap-y-10 px-4 sm:px-6 lg:px-8 md:grid-cols-5">
        <div className="col-span-2 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold">
            <span aria-hidden className="inline-block h-2 w-2 rounded-[2px] bg-[hsl(var(--accent))]" />
            Nexus.io
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Next-generation server clustering and GraphQL data pipeline
            automation platforms.
          </p>
          <div className="flex gap-4 font-[family-name:var(--font-mono)] text-[11px] text-muted-foreground">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[hsl(var(--accent))]"
              >
                [{s.label}]
              </a>
            ))}
          </div>
          <div className="max-w-xs space-y-1.5 pt-1">
            <p className="text-[11px] text-muted-foreground">Get infra updates in your inbox.</p>
            <NewsletterForm />
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.label} className="space-y-3">
            <h4 className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-wider text-foreground">
              <span aria-hidden className="inline-block h-1.5 w-1.5 border border-[hsl(var(--accent))]" />
              {col.label}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[hsl(var(--accent))]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* status bar */}
      <div className="container mx-auto mt-14 flex flex-col items-center justify-between gap-3 border-t border-border/60 px-4 pt-6 text-[11.5px] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p className="text-muted-foreground/60">
          © 2026 Nexus Enterprise Engine. All architectural rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-5 font-[family-name:var(--font-mono)]">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] motion-safe:animate-pulse"
            />
            {UPTIME_PERCENT} uptime
          </span>
          <button type="button" className="transition-colors hover:text-foreground">
            EN / US
          </button>
          <a href="#top" className="transition-colors hover:text-[hsl(var(--accent))]">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
