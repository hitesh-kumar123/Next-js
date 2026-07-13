// components/dashboard/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleSidebar } from "../../store/slices/uiSlice";
import { resetLiveFeedCounter } from "../../store/slices/dashboardSlice";
import { ThemeToggle } from "../common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { liveFeedCounter } = useAppSelector((state) => state.dashboard);
  const { user, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNotificationClick = () => {
    if (liveFeedCounter > 0) {
      dispatch(resetLiveFeedCounter());
    }
    router.push("/dashboard/notifications");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-md p-2 hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Core Workspace</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Real-Time Pulse Indicator alert button */}
        <button
          onClick={handleNotificationClick}
          className="relative rounded-md p-2 hover:bg-accent border text-muted-foreground cursor-pointer"
          title="System Alerts & Notifications"
        >
          <Bell className="h-5 w-5" />
          {liveFeedCounter > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-bounce">
              {liveFeedCounter}
            </span>
          )}
        </button>

        {user && (
          <div className="relative" ref={dropdownRef}>
            {/* Profile Avatar Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border overflow-hidden relative group cursor-pointer focus:outline-hidden hover:border-foreground/30 transition-all"
              title="Open User Menu"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-xs font-bold text-muted-foreground select-none">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : user.email?.slice(0, 2).toUpperCase() || "OP"}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border bg-card p-2 text-card-foreground shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                {/* User info section */}
                <div className="px-3 py-2.5 flex flex-col gap-1 border-b border-border/80 mb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[140px]">
                      {user.name || "Operator"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider ${
                        role === "Admin"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : role === "Editor"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}
                    >
                      {role || "Viewer"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                    {user.email}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Exit / Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
