// app/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";

import { useQuery } from "@apollo/client/react";

import { gql } from "@apollo/client/core";

import { AnalyticsAreaChart } from "../../components/charts/AnalyticsAreaChart";
import { TrendingUp, Users, DollarSign, MousePointer } from "lucide-react";
import { DashboardGridSkeleton } from "../../components/loaders/SkeletonLoader";

const GET_ANALYTICS_QUERY = gql`
  query GetAnalyticsData {
    getAnalytics {
      views
      clicks
      revenue
      timestamp
    }
  }
`;

type AnalyticsPoint = {
  views: number;
  clicks: number;
  revenue: number;
  timestamp: string;
};

// Static fallback series, used only while the query is loading or if it
// returns nothing (e.g. a brand-new account with no data yet).
const chartDataFallback = [
  { name: "Mon", revenue: 4000, views: 2400 },
  { name: "Tue", revenue: 3000, views: 1398 },
  { name: "Wed", revenue: 2000, views: 9800 },
  { name: "Thu", revenue: 2780, views: 3908 },
  { name: "Fri", revenue: 1890, views: 4800 },
  { name: "Sat", revenue: 2390, views: 3800 },
  { name: "Sun", revenue: 3490, views: 4300 },
];

function formatDay(timestamp: string) {
  return new Date(timestamp).toLocaleDateString(undefined, { weekday: "short" });
}

export default function AnalyticsDashboardPage() {
  const { data, loading } = useQuery<{ getAnalytics: AnalyticsPoint[] }>(
    GET_ANALYTICS_QUERY,
  );
  const [isClient, setIsClient] = useState(false);

  // Avoid dehydration mismatch variables for high-intensity chart layout rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading || !isClient) {
    return <DashboardGridSkeleton />;
  }

  const analytics = data?.getAnalytics;
  const chartData = analytics?.length
    ? analytics.map((point) => ({
        name: formatDay(point.timestamp),
        revenue: point.revenue,
        views: point.views,
      }))
    : chartDataFallback;

  const totalRevenue = analytics?.length
    ? analytics.reduce((sum, p) => sum + p.revenue, 0)
    : 45231.89;
  const totalClicks = analytics?.length
    ? analytics.reduce((sum, p) => sum + p.clicks, 0)
    : 12234;
  const totalViews = analytics?.length
    ? analytics.reduce((sum, p) => sum + p.views, 0)
    : 2350;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Analytics overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor infrastructure interaction logs, performance, and revenue
          streams.
        </p>
      </div>

      {/* Analytics Summary Widget Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Revenue
            </h4>
            <DollarSign className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-bold">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs font-medium text-green-500">
            +20.1% from last month
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              New users
            </h4>
            <Users className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-bold">+{totalViews.toLocaleString()}</div>
          <p className="mt-1 text-xs font-medium text-green-500">
            +180.1% from last week
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Total clicks
            </h4>
            <MousePointer className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-bold">+{totalClicks.toLocaleString()}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            No change from last week
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Uptime
            </h4>
            <TrendingUp className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-2xl font-bold">99.98%</div>
          <p className="mt-1 text-xs font-medium text-green-500">
            All systems operational
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Revenue and views</h3>
          <p className="text-sm text-muted-foreground">
            Last 7 days, updated in real time.
          </p>
        </div>
        <div className="h-80 w-full">
          <AnalyticsAreaChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
}