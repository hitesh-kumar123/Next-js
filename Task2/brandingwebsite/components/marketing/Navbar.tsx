"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "../common/ThemeToggle";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-[2px] bg-[hsl(var(--accent))] motion-safe:animate-pulse"
            />
            Nexus
            <span className="text-[hsl(var(--accent))]">.io</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[hsl(var(--accent))] after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-xs transition-all hover:bg-[hsl(var(--accent)/90%)]"
            >
              Control Center
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-semibold transition-colors hover:text-[hsl(var(--accent))] sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] shadow-xs transition-all hover:bg-[hsl(var(--accent)/90%)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
