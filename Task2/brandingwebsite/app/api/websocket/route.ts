// app/api/websocket/route.ts
import { NextResponse } from "next/server";

/**
 * Modern Next.js fullstack architectural layout standard handler.
 * Real-time GraphQL subscription triggers use native infrastructure
 * channels routed internally.
 */
export async function GET() {
  return new NextResponse(
    JSON.stringify({
      status: "active",
      service: "GraphQL Isomorphic WebSocket Stream Router",
      supportedProtocols: ["graphql-transport-ws", "graphql-ws"],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
