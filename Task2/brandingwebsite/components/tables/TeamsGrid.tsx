"use client";

import React from "react";
import { Users2, Trash2, ShieldAlert, ShieldCheck, Shield, Calendar } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  role: "Admin" | "Editor" | "Viewer";
  createdAt: string;
}

interface TeamsGridProps {
  teams: Team[];
  isViewer: boolean;
  onDeleteTeam: (id: string, name: string) => void;
}

export function TeamsGrid({ teams, isViewer, onDeleteTeam }: TeamsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-2xs hover:shadow-xs hover:border-[hsl(var(--accent)/50%)] transition-all relative"
        >
          <div>
            {/* Header: role badge and delete button */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono font-semibold text-[10px] uppercase tracking-wide ${
                  team.role === "Admin"
                    ? "bg-red-500/10 text-red-500"
                    : team.role === "Editor"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {team.role === "Admin" ? (
                  <ShieldAlert className="h-3 w-3" />
                ) : team.role === "Editor" ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <Shield className="h-3 w-3" />
                )}
                {team.role}
              </span>

              {!isViewer && (
                <button
                  type="button"
                  onClick={() => onDeleteTeam(team.id, team.name)}
                  className="text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                  title="Delete team"
                  aria-label={`Delete ${team.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Team info */}
            <h3 className="text-base font-semibold leading-tight mb-1 text-card-foreground font-[family-name:var(--font-display)]">
              {team.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {team.description || "No description provided."}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Users2 className="h-3.5 w-3.5" />
              {team.membersCount} {team.membersCount === 1 ? "member" : "members"}
            </span>
            <span className="flex items-center gap-1 font-[family-name:var(--font-mono)] text-[10px]">
              <Calendar className="h-3.5 w-3.5" />
              {team.createdAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
