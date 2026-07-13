// app/(marketing)/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Cpu, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5 text-[hsl(var(--accent))]" />,
    title: "GraphQL Yoga Engine",
    desc: "Pre-compiled edge schemas with full subscriptions stream capability.",
  },
  {
    icon: <Cpu className="h-5 w-5 text-[hsl(var(--accent))]" />,
    title: "Turbopack Bundled",
    desc: "Blazing fast server operations under next-gen incremental compilation.",
  },
  {
    icon: <Shield className="h-5 w-5 text-[hsl(var(--accent))]" />,
    title: "Role-Based Guards",
    desc: "Secure middleware interceptors checking Admin, Editor and View privileges.",
  },
  {
    icon: <Activity className="h-5 w-5 text-[hsl(var(--accent))]" />,
    title: "Real-time Matrix",
    desc: "Apollo global client sync engine pushing mutation states immediately.",
  },
];

// Fixed node positions for the topology backdrop — deterministic, not random,
// so server and client render identically (avoids hydration mismatches).
const NODES = [
  { x: 120, y: 60 }, { x: 340, y: 30 }, { x: 560, y: 80 }, { x: 780, y: 40 },
  { x: 980, y: 90 }, { x: 220, y: 180 }, { x: 480, y: 200 }, { x: 700, y: 170 },
  { x: 900, y: 210 }, { x: 60, y: 260 },
];
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 6], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8], [5, 9],
];

export default function MarketingHomePage() {
  return (
    <div className="relative overflow-hidden py-20 lg:py-32">
      {/* Topology backdrop — replaces the generic gradient blur sphere with the
          same node/edge motif used in the header + footer */}
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[320px] w-full opacity-[0.18]"
        viewBox="0 0 1000 280"
        preserveAspectRatio="xMidYMin slice"
      >
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="hsl(var(--accent))"
            strokeWidth="1"
          />
        ))}
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="3" fill="hsl(var(--accent))" />
        ))}
      </svg>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-muted-foreground shadow-2xs"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] motion-safe:animate-pulse" />
          <span>Nexus Architecture v4.0 is now live</span>
        </motion.div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            The full-stack control plane for{" "}
            <span className="text-[hsl(var(--accent))]">GraphQL pipelines</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto sm:text-xl"
          >
            Deploy zero-latency node clusters, automate telemetry feeds, and
            orchestrate server instances with production-level monitoring.
          </motion.p>
        </div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center pt-4"
        >
          <Link
            href="/signup"
            className="rounded-md bg-[hsl(var(--accent))] px-8 py-4 text-base font-semibold text-[hsl(var(--accent-foreground))] shadow-md transition-all hover:bg-[hsl(var(--accent)/90%)]"
          >
            Initialize free cluster
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-border/60 bg-card px-8 py-4 text-base font-semibold transition-all hover:border-[hsl(var(--accent)/50%)] hover:text-[hsl(var(--accent))]"
          >
            View enterprise plans
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="pt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left max-w-6xl mx-auto">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xs transition-colors hover:border-[hsl(var(--accent)/50%)]"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[hsl(var(--accent)/10%)] p-3">
                {feat.icon}
              </div>
              <h3 className="mb-1 flex items-center gap-2 text-lg font-bold">
                <span aria-hidden className="inline-block h-1.5 w-1.5 border border-[hsl(var(--accent))]" />
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}