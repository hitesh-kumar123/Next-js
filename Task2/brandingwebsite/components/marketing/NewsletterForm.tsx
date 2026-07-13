"use client";

import React, { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <p className="text-xs font-medium text-[hsl(var(--accent))]">
        Subscribed — check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex overflow-hidden rounded-md border border-border/60">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="whitespace-nowrap bg-[hsl(var(--accent))] px-3 py-2 text-xs font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent)/90%)] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Subscribe"}
      </button>
    </form>
  );
}
