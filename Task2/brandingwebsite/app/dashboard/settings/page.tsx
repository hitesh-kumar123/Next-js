// app/dashboard/settings/page.tsx
"use client";

import React from "react";
import { Sliders, Key, Bell } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { SettingsForm } from "../../../components/forms/SettingsForm";

export default function SettingsPage() {
  const { isViewer } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-black tracking-tight">
          Node Configuration & Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage organizational security rules, authorization interceptors, and
          platform interfaces.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Navigation Sidebar Sub-Links Tabs Simulated */}
        <div className="space-y-1 md:col-span-1">
          {[
            {
              label: "Cluster Profile",
              icon: <Sliders className="h-4 w-4" />,
              active: true,
            },
            { label: "Security & Keys", icon: <Key className="h-4 w-4" /> },
            { label: "Notification Slugs", icon: <Bell className="h-4 w-4" /> },
          ].map((tab, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                tab.active
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configurations Forms Matrix */}
        <div className="md:col-span-2 rounded-2xl border bg-card p-6 shadow-2xs">
          <SettingsForm isViewer={isViewer} />
        </div>
      </div>
    </div>
  );
}
