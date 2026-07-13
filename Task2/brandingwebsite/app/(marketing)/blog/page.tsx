// app/(marketing)/blog/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const mockBlogs = [
  {
    id: "nextjs-15-graphql-yoga",
    title: "Orchestrating Next.js 15 App Routers with GraphQL Yoga pipelines",
    desc: "Deep dive into standard compilation vectors, caching resolvers performance metrics and token authorization guards.",
    date: "July 5, 2026",
    readTime: "5 min read",
  },
  {
    id: "preventing-n-plus-1",
    title: "Preventing N+1 queries inside production MongoDB collections",
    desc: "How to implement batching array operations seamlessly via clean infrastructure dataloader scripts.",
    date: "June 28, 2026",
    readTime: "8 min read",
  },
];

export default function BlogListingPage() {
  return (
    <div className="py-20 container mx-auto px-4 max-w-4xl space-y-12">
      <div>
        <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[hsl(var(--accent))]" />
          Nexus architecture insights
        </h1>
        <p className="mt-2 text-muted-foreground">
          Production architecture engineering breakdowns, framework tutorials,
          and full-stack telemetry advice.
        </p>
      </div>

      <div className="space-y-6">
        {mockBlogs.map((post) => (
          <article
            key={post.id}
            className="group rounded-2xl border border-border/60 bg-card p-6 shadow-2xs transition-colors hover:border-[hsl(var(--accent)/50%)] sm:p-8"
          >
            <div className="flex gap-4 font-[family-name:var(--font-mono)] text-xs text-muted-foreground">
              <span>{post.date}</span>
              <span aria-hidden>•</span>
              <span>{post.readTime}</span>
            </div>
            <Link href={`/blog/${post.id}`} className="mt-3 block">
              <h2 className="text-2xl font-bold transition-colors group-hover:text-[hsl(var(--accent))]">
                {post.title}
              </h2>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {post.desc}
            </p>
            <Link
              href={`/blog/${post.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
            >
              Read article
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}