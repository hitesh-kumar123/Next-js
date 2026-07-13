// app/(auth)/layout.tsx
import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft design accents */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-8 bg-background border p-8 rounded-2xl shadow-xs">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-foreground"
          >
            Nexus<span className="text-indigo-600">.io</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
