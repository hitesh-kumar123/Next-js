// graphql/schema/index.ts
import { createSchema } from "graphql-yoga";

export const typeDefs = `
  type Analytics {
    views: Int!
    clicks: Int!
    revenue: Float!
    timestamp: String!
  }
  
  type Query {
    getAnalytics: Analytics!
  }

  type Subscription {
    liveAlerts: String!
  }
`;

export const resolvers = {
  Query: {
    getAnalytics: () => ({
      views: 12450,
      clicks: 3420,
      revenue: 45231.89,
      timestamp: new Date().toISOString(),
    }),
  },
  Subscription: {
    liveAlerts: {
      subscribe: async function* () {
        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 8000));
          yield {
            liveAlerts: `System Alert: Updated at ${new Date().toLocaleTimeString()}`,
          };
        }
      },
    },
  },
};

// Next.js compiler is explicit name ko dhund raha hai
export const schema = createSchema({
  typeDefs,
  resolvers,
});
  