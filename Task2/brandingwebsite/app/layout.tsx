// app/layout.tsx
import React from "react";
import { AppProviders } from "../providers";
import "./globals.css";

export const metadata = {
  title: "Nexus Enterprise Engine",
  description:
    "Production-ready stack running Next.js 15, GraphQL Yoga and MongoDB.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
