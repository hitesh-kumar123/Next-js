// app/(marketing)/blog/[slug]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// Single source of truth shared in spirit with the listing page —
// move this to a shared lib/blog.ts and import from both once you
// wire up real content.
const POSTS: Record<
  string,
  { title: string; date: string; readTime: string }
> = {
  "nextjs-15-graphql-yoga": {
    title: "Orchestrating Next.js 15 App Routers with GraphQL Yoga pipelines",
    date: "July 5, 2026",
    readTime: "5 min read",
  },
  "preventing-n-plus-1": {
    title: "Preventing N+1 queries inside production MongoDB collections",
    date: "June 28, 2026",
    readTime: "8 min read",
  },
};

export default async function BlogDetailPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <article className="py-20 container mx-auto px-4 max-w-3xl space-y-8">
      <Link
        href="/blog"
        className="text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
      >
        ← Back to insights
      </Link>

      <div className="space-y-4 border-b border-border/60 pb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="flex gap-4 font-[family-name:var(--font-mono)] text-xs text-muted-foreground">
          <span>Core Platform Team</span>
          <span aria-hidden>•</span>
          <span>{post.date}</span>
          <span aria-hidden>•</span>
          <span>{post.readTime}</span>
        </div>
      </div>

      <div className="prose dark:prose-invert space-y-6 text-base leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">
          This deep-dive covers implementation strategies running on our
          modern cluster stack framework.
        </p>
        <p>
          When running heavily concurrent operational schemas inside next
          generation application proxies, managing memory heap parameters
          becomes top priority. By combining standard incremental static
          compilation structures alongside active GraphQL Yoga servers, memory
          limits remain optimized.
        </p>
        <h3 className="pt-4 text-xl font-bold text-foreground">
          Core system implementation paradigm
        </h3>
        <p>
          By enforcing a strict separation between client layout modules and
          state machine triggers, Next.js hydration cycles execute under
          optimized millisecond parameters. This delivers predictable behavior
          across highly fragmented network node connections.
        </p>
      </div>
    </article>
  );
}