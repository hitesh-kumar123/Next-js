// providers/index.tsx
"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
// Changed from "@apollo/client" to "@apollo/client/react" to isolate UI components
import { ApolloProvider } from "@apollo/client/react";
import { SessionProvider } from "next-auth/react";
import { store } from "../store";
import { apolloClient } from "../lib/apollo-client";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <ReduxProvider store={store}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Global Toaster for real-time notifications triggered from hooks */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                },
              }}
            />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
