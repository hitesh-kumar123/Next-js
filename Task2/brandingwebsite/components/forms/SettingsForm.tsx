"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface SettingsFormProps {
  isViewer: boolean;
}

export function SettingsForm({ isViewer }: SettingsFormProps) {
  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      toast.error("Permission Denied: Viewer role cannot modify system configurations!");
      return;
    }
    toast.success(
      "System configuration parameters synced to cluster environment variable blocks!",
    );
  };

  return (
    <form onSubmit={handleConfigSave} className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          Cluster Call Sign
        </label>
        <input
          type="text"
          disabled={isViewer}
          defaultValue="Nexus-Production-Node-01"
          className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden font-mono disabled:opacity-50"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          Default Access Tier Guard
        </label>
        <select 
          disabled={isViewer}
          className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden disabled:opacity-50"
        >
          <option>Role-Based Authentication (Admin/Editor/Viewer)</option>
          <option>Global Viewer Bypass Strict Mode</option>
        </select>
      </div>

      <div className="pt-2 border-t flex justify-end">
        <button
          type="submit"
          disabled={isViewer}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="h-3 w-3" />
          Commit Configurations
        </button>
      </div>
    </form>
  );
}
