// graphql/context.ts
import { NextRequest } from "next/server";

export interface GraphQLContext {
  req: NextRequest;
  user: {
    id: string;
    email: string;
    role: "Admin" | "Editor" | "Viewer";
  } | null;
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  // Note: Auth.js session extraction yahan headers ya cookies se hogi.
  // Abhi ke liye fallback structure ready kar rahe hain.
  const authHeader = req.headers.get("authorization") || "";

  // TODO: Implement actual JWT decode or token verification here
  let user = null;

  if (authHeader.startsWith("Bearer ")) {
    // Mock user decoding logic for architecture setup
    user = {
      id: "mock-user-id",
      email: "admin@platform.com",
      role: "Admin" as const,
    };
  }

  return {
    req,
    user,
  };
}
