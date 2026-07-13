// app/dashboard/teams/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Users2, Plus } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import { TeamsGrid } from "../../../components/tables/TeamsGrid";
import { CreateTeamModal } from "../../../components/forms/CreateTeamModal";

interface Team {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  role: "Admin" | "Editor" | "Viewer";
  createdAt: string;
}

export default function TeamsPage() {
  const { isViewer } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    const storedTeams = localStorage.getItem("nexus_teams");
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    } else {
      const defaultTeams: Team[] = [
        {
          id: "team-default-1",
          name: "Security auditing crew",
          description: "Focuses on monitoring cluster handshake parameters and threat logs.",
          membersCount: 4,
          role: "Admin",
          createdAt: new Date().toLocaleDateString(),
        },
        {
          id: "team-default-2",
          name: "Web platform editors",
          description: "Maintains blog channels, release logs, and marketing layouts.",
          membersCount: 3,
          role: "Editor",
          createdAt: new Date().toLocaleDateString(),
        }
      ];
      setTeams(defaultTeams);
      localStorage.setItem("nexus_teams", JSON.stringify(defaultTeams));
    }
  }, []);

  const handleCreateTeamSubmit = (
    name: string,
    desc: string,
    role: "Admin" | "Editor" | "Viewer",
    membersCount: number
  ) => {
    if (isViewer) {
      toast.error("Permission denied: viewers can't create teams.");
      return;
    }
    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }

    const newTeam: Team = {
      id: "team-" + Date.now(),
      name: name.trim(),
      description: desc.trim(),
      role: role,
      membersCount: Number(membersCount),
      createdAt: new Date().toLocaleDateString(),
    };

    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    localStorage.setItem("nexus_teams", JSON.stringify(updatedTeams));
    setIsModalOpen(false);

    toast.success(`Team "${newTeam.name}" created.`);
  };

  const handleDeleteTeam = (id: string, name: string) => {
    if (isViewer) {
      toast.error("Permission denied: viewers can't delete teams.");
      return;
    }
    const updatedTeams = teams.filter((t) => t.id !== id);
    setTeams(updatedTeams);
    localStorage.setItem("nexus_teams", JSON.stringify(updatedTeams));
    toast.success(`Team "${name}" deleted.`);
  };

  if (!isMounted) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight font-[family-name:var(--font-display)]">
            <span aria-hidden className="inline-block h-2 w-2 rounded-[2px] bg-[hsl(var(--accent))]" />
            Team management
          </h2>
          <p className="text-sm text-muted-foreground">
            Invite teammates and manage shared cluster access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isViewer) {
              toast.error("Permission denied: viewers can't create teams.");
            } else {
              setIsModalOpen(true);
            }
          }}
          disabled={isViewer}
          className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent)/90%)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Create team
        </button>
      </div>

      {/* Main teams list */}
      {teams.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-card p-8 text-center">
          <Users2 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h4 className="text-sm font-semibold font-[family-name:var(--font-display)]">Start your first team</h4>
          <p className="mx-auto max-w-xs text-xs text-muted-foreground">
            You're currently the only member on this account. Create a team to
            share cluster access with teammates.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isViewer}
            className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent)/90%)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create team
          </button>
        </div>
      ) : (
        <TeamsGrid
          teams={teams}
          isViewer={isViewer}
          onDeleteTeam={handleDeleteTeam}
        />
      )}

      {/* Creation modal */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTeamSubmit}
      />
    </div>
  );
}