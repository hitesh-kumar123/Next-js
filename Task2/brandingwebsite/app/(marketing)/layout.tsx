// app/(marketing)/layout.tsx
import React from "react";
import { Navbar } from "../../components/marketing/Navbar";
import { Footer } from "../../components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-[hsl(var(--accent)/30%)] selection:text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}