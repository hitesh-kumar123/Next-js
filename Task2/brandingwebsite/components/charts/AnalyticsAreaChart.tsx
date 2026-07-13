"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface AnalyticsAreaChartProps {
  chartData: Array<{
    name: string;
    revenue: number;
    views: number;
  }>;
}

export function AnalyticsAreaChart({ chartData }: AnalyticsAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          stroke="currentColor"
          className="text-[12px] opacity-50"
        />
        <YAxis stroke="currentColor" className="text-[12px] opacity-50" />
        <Tooltip
          contentStyle={{
            background: "var(--background)",
            borderColor: "var(--border)",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--accent))"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
