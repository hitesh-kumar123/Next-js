// hooks/useAuth.ts
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const isAuthenticated = !!session;
  const user = session?.user || null;

  // Quick role access matrices
  const isAdmin = session?.user?.role === "Admin";
  const isEditor = session?.user?.role === "Editor";
  const isViewer = session?.user?.role === "Viewer";

  return {
    loading,
    isAuthenticated,
    user,
    role: user?.role || null,
    isAdmin,
    isEditor,
    isViewer,
  };
}
