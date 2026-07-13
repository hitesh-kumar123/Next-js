// graphql/schema/index.ts
import { createSchema } from "graphql-yoga";

export const typeDefs = `
  type Analytics {
    views: Int!
    clicks: Int!
    revenue: Float!
    timestamp: String!
  }

  type Notification {
    id: ID!
    message: String!
    type: String!
    createdAt: String!
  }

  type Query {
    getAnalytics: Analytics!
  }

  type Subscription {
    liveAlerts: String!
    notificationAdded: Notification!
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
    notificationAdded: {
      subscribe: async function* () {
        const types = ["info", "success", "warning", "error"];
        const messages = [
          "Unauthorized Token Handshake Detected",
          "Database Thread Execution Threshold reached",
          "Production Cache Successfully Purged",
          "Operational metrics synced successfully"
        ];
        let id = 1;
        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 15000));
          const randomType = types[Math.floor(Math.random() * types.length)];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          yield {
            notificationAdded: {
              id: String(id++),
              message: randomMessage,
              type: randomType,
              createdAt: new Date().toISOString(),
            }
          };
        }
      }
    }
  }
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});
