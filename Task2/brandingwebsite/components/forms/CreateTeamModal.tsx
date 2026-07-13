"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    desc: string,
    role: "Admin" | "Editor" | "Viewer",
    members: number
  ) => void;
}

export function CreateTeamModal({ isOpen, onClose, onSubmit }: CreateTeamModalProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<"Admin" | "Editor" | "Viewer">("Viewer");
  const [newTeamMembers, setNewTeamMembers] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newTeamName, newTeamDesc, newTeamRole, newTeamMembers);
    // Reset state
    setNewTeamName("");
    setNewTeamDesc("");
    setNewTeamRole("Viewer");
    setNewTeamMembers(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-team-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal title */}
        <div className="mb-4">
          <h3 id="create-team-title" className="flex items-center gap-2 text-lg font-bold font-[family-name:var(--font-display)]">
            <span aria-hidden className="inline-block h-1.5 w-1.5 border border-[hsl(var(--accent))]" />
            Create team
          </h3>
          <p className="text-xs text-muted-foreground">
            Set up a new team and choose its access level.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team name */}
          <div>
            <label htmlFor="team-name" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-mono)] block mb-1">
              Team name
            </label>
            <input
              id="team-name"
              type="text"
              placeholder="e.g. Frontend engineers"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-[hsl(var(--accent))] focus:outline-hidden focus:ring-2 focus:ring-[hsl(var(--accent)/30%)]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="team-desc" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-mono)] block mb-1">
              Description
            </label>
            <textarea
              id="team-desc"
              placeholder="Summarize the core capabilities..."
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-[hsl(var(--accent))] focus:outline-hidden focus:ring-2 focus:ring-[hsl(var(--accent)/30%)] min-h-[70px] resize-y"
            />
          </div>

          {/* Access level */}
          <div>
            <label htmlFor="team-role" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-mono)] block mb-1">
              Access level
            </label>
            <select
              id="team-role"
              value={newTeamRole}
              onChange={(e) => setNewTeamRole(e.target.value as "Admin" | "Editor" | "Viewer")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-[hsl(var(--accent))] focus:outline-hidden focus:ring-2 focus:ring-[hsl(var(--accent)/30%)]"
            >
              <option value="Viewer">Viewer — read-only</option>
              <option value="Editor">Editor — read and write</option>
              <option value="Admin">Admin — full control</option>
            </select>
          </div>

          {/* Member count */}
          <div>
            <label htmlFor="team-members" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-mono)] block mb-1">
              Number of teammates
            </label>
            <input
              id="team-members"
              type="number"
              min="1"
              max="50"
              value={newTeamMembers}
              onChange={(e) => setNewTeamMembers(Number(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-[hsl(var(--accent))] focus:outline-hidden focus:ring-2 focus:ring-[hsl(var(--accent)/30%)]"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-xs font-semibold text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent)/90%)] transition-colors cursor-pointer"
            >
              Create team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
