// lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        if (password !== "password") {
          return null; // Require 'password' for credentials
        }

        if (email === "admin@platform.com" || email === "hiteesh@platform.com") {
          return {
            id: "1",
            name: "Hiteesh Kumar",
            email: "admin@platform.com",
            role: "Admin",
          };
        } else if (email === "editor@platform.com" || email === "sarah@platform.com" || email === "sarah@nexus.io") {
          return {
            id: "2",
            name: "Sarah Connor",
            email: "editor@platform.com",
            role: "Editor",
          };
        } else if (email === "viewer@platform.com" || email === "john@platform.com" || email === "john@nexus.io") {
          return {
            id: "3",
            name: "John Doe",
            email: "viewer@platform.com",
            role: "Viewer",
          };
        }

        // Fallback for any other valid email to avoid blocking the user
        return {
          id: "mock-user-id-" + Math.floor(Math.random() * 1000),
          name: "Guest Operator",
          email: email,
          role: "Viewer",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role || "Admin";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.role = token.role || "Admin";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
