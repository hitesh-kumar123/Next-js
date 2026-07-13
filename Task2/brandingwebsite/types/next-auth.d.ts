import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "Admin" | "Editor" | "Viewer";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "Admin" | "Editor" | "Viewer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "Admin" | "Editor" | "Viewer";
  }
}
