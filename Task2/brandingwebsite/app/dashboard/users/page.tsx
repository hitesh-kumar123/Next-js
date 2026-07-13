// app/dashboard/users/page.tsx
"use client";

import React from "react";
import { UsersTable } from "@/components/tables/UsersTable";

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Identity & Access Control (RBAC)
        </h2>
        <p className="text-sm text-muted-foreground">
          Provision user seats, revoke dynamic auth tokens, and assign cluster
          management capabilities.
        </p>
      </div>

      <UsersTable />
    </div>
  );
}
