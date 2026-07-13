"use client";

import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UsersTableProps {
  users?: User[];
}

const defaultUsers: User[] = [
  {
    id: "1",
    name: "Hiteesh Kumar",
    email: "admin@platform.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "2",
    name: "Sarah Connor",
    email: "editor@platform.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: "3",
    name: "John Doe",
    email: "viewer@platform.com",
    role: "Viewer",
    status: "Provisioning",
  },
];

export function UsersTable({ users = defaultUsers }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b text-muted-foreground font-semibold uppercase tracking-wider">
            <th className="p-4">Operator</th>
            <th className="p-4">Assigned Role Privileges</th>
            <th className="p-4">Pipeline Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/20 transition-colors">
              <td className="p-4 font-medium">
                <div>{user.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {user.email}
                </div>
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    user.role === "Admin"
                      ? "bg-red-500/10 text-red-500"
                      : user.role === "Editor"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {user.role === "Admin" ? (
                    <ShieldAlert className="h-2.5 w-2.5" />
                  ) : (
                    <ShieldCheck className="h-2.5 w-2.5" />
                  )}
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                    user.status === "Active"
                      ? "text-emerald-500"
                      : "text-muted-foreground animate-pulse"
                  }`}
                >
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
