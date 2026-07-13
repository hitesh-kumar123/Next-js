// lib/apollo-client.ts
"use client";

import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

// 1. Setup Standard HTTP Link for Queries & Mutations
const httpLink = new HttpLink({
  uri:
    typeof window !== "undefined"
      ? "/api/graphql"
      : process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
        "http://localhost:3000/api/graphql",
});

// 2. Setup Isomorphic WebSocket link (Strict Client-side verification)
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url:
            process.env.NEXT_PUBLIC_WS_API_URL ||
            "ws://localhost:3000/api/websocket",
          connectionParams: async () => {
            return {
              authToken: localStorage.getItem("token"),
            };
          },
        }),
      )
    : null;

// 3. Split queries/mutations to HTTP, Subscriptions to WS channel routing
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink,
      )
    : httpLink;

// 4. Unified Client Instance Export
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Automatic caching key strategies can be initialized here
        },
      },
    },
  }),
});
