// app/not-found.tsx
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-4">
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        404 - Node Offline
      </h1>
      <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto">
        The requesting module string coordinates do not exist on the secure
        cluster routing pipeline.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
        >
          Return to Control Center
        </Link>
      </div>
    </div>
  );
}
