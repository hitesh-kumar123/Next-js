// app/dashboard/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { DashboardHeader } from "../../components/dashboard/Header";
import { useNotificationListener } from "../../hooks/useNotificationListener";
import { cn } from "../../lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAVIGATION = [
  { name: "Analytics overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "User management", href: "/dashboard/users", icon: Users },
  { name: "Team access", href: "/dashboard/teams", icon: Shield },
  { name: "System settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const pathname = usePathname();

  // Initialize unified isomorphic subscription pipeline for real-time alerts
  useNotificationListener();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile backdrop — closes the drawer on tap, dims the page behind it */}
      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border/60 bg-background transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold hover:text-[hsl(var(--accent))] transition-colors"
            title="Go to main website homepage"
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-[hsl(var(--accent))]" />
            Control center
          </Link>
        </div>
        <nav className="space-y-1 px-4 py-4">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (sidebarOpen) dispatch(toggleSidebar());
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--accent)/10%)] text-[hsl(var(--accent))]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}