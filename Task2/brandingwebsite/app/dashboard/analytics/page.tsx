// app/dashboard/analytics/page.tsx
'use client';

import React from 'react';
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { WeeklyTrafficChart } from "../../../components/charts/WeeklyTrafficChart";

const metricsSummary = [
  { label: 'Total Node Traffic', value: '1.2M reqs', change: '+14.2%', dynamic: true, icon: <Activity className="h-4 w-4 text-indigo-500" /> },
  { label: 'Active Session Footprint', value: '3,420 users', change: '+28.4%', dynamic: true, icon: <Users className="h-4 w-4 text-emerald-500" /> },
  { label: 'Cluster Resource Burn Rate', value: '94.2%', change: '-4.1%', dynamic: false, icon: <TrendingUp className="h-4 w-4 text-amber-500" /> }
];

export default function AnalyticsDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground">System Analytics Engine</h2>
        <p className="text-sm text-muted-foreground">Monitor real-time data ingestion pipelines, query latencies, and edge server health logs.</p>
      </div>

      {/* Grid Layout Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricsSummary.map((item, idx) => (
          <div key={idx} className="rounded-2xl border bg-card p-6 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
              <div className="p-2 bg-muted rounded-xl">{item.icon}</div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight">{item.value}</span>
              <span className={`inline-flex items-center text-xs font-bold ${item.dynamic ? 'text-emerald-500' : 'text-amber-500'}`}>
                {item.dynamic ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly traffic chart component */}
      <WeeklyTrafficChart />
    </div>
  );
}