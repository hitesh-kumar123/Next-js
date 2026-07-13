// app/api/graphql/route.ts
import { NextRequest } from "next/server";
import { createYoga } from "graphql-yoga";
import { schema } from "../../../graphql/schema/index"; // Explicit filename pointing
import { createContext } from "../../../graphql/context";
import connectDB from "../../../lib/mongodb";

// Only ONE single instantiation
const { handleRequest: yogaHandler } = createYoga<any>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  context: async ({ request }: { request: any }) => {
    try {
      await connectDB();
    } catch (e) {
      console.error("Database connection check bypassed.");
    }
    return createContext(request);
  },
});

export async function GET(request: NextRequest) {
  return yogaHandler(request, { request });
}

export async function POST(request: NextRequest) {
  return yogaHandler(request, { request });
}

export async function OPTIONS(request: NextRequest) {
  return yogaHandler(request, { request });
}
