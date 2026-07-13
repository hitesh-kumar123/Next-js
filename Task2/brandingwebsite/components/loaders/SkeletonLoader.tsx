// components/loaders/SkeletonLoader.tsx
import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SkeletonLoader({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", className)}
      {...props}
    />
  );
}

export function DashboardGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6 bg-card space-y-3">
          <SkeletonLoader className="h-4 w-[40%]" />
          <SkeletonLoader className="h-8 w-[70%]" />
          <SkeletonLoader className="h-3 w-[50%]" />
        </div>
      ))}
    </div>
  );
}
