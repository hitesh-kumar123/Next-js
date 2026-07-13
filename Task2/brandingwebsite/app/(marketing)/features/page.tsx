// app/(marketing)/features/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Database } from "lucide-react";

const CAPABILITIES = [
  {
    icon: <Server />,
    title: "Edge-optimized GraphQL API",
    desc: "Multi-tenant Yoga integration schemas supporting dataloader aggregation layers to protect against the N+1 problem.",
  },
  {
    icon: <Database />,
    title: "Encrypted storage drivers",
    desc: "Direct pooling connectors to MongoDB Atlas clusters running transactional schema isolation parameters.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-20 bg-muted/10">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            Hyper-scale capabilities
          </h1>
          <p className="text-lg text-muted-foreground">
            Every component layer engineered specifically for large enterprise
            node configurations.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                  {cap.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{cap.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Code Blocks Visual Presenter */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-zinc-200 shadow-xl"
          >
            <div className="mb-4 flex gap-2 border-b border-zinc-800 pb-2 text-zinc-500">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--accent))]" />
              <span className="ml-2">nexus-cluster-config.ts</span>
            </div>
            <p className="text-[hsl(var(--accent))]">
              const<span className="text-zinc-200"> platformCluster = </span>
              NextGenerationEngine<span>({" {"}</span>
            </p>
            <p className="pl-4 text-emerald-400">
              transport:{" "}
              <span className="text-amber-300">
                "GraphQL WebSockets subscriptions"
              </span>
              ,
            </p>
            <p className="pl-4 text-emerald-400">
              caching:{" "}
              <span className="text-amber-300">"Redis memory layers"</span>,
            </p>
            <p className="pl-4 text-emerald-400">
              securityModule:{" "}
              <span className="text-amber-300">
                "Role-based access token control"
              </span>
            </p>
            <p className="text-[hsl(var(--accent))]">{"}"});</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}