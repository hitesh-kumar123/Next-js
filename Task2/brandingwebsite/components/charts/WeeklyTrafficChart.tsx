"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface WeeklyTrafficChartProps {
  heights?: number[];
}

export function WeeklyTrafficChart({
  heights = [45, 60, 35, 80, 95, 55, 70],
}: WeeklyTrafficChartProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-2xs">
      <div className="flex flex-col space-y-1.5 pb-6">
        <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" /> Node Traffic Distribution (Weekly Context)
        </h3>
      </div>
      <div className="h-[240px] flex items-end gap-3 pt-4 px-2">
        {heights.map((height, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
            <div 
              style={{ height: `${height}%` }} 
              className="w-full bg-indigo-600/90 rounded-t-lg transition-all group-hover:bg-indigo-500 relative"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 font-mono transition-opacity shadow-xs border">
                {height * 120} reqs
              </div>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              {days[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
