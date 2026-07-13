// graphql/resolvers/index.ts
import { createPubSub } from "graphql-yoga";
import { GraphQLContext } from "../context";

const pubSub = createPubSub<{
  NOTIFICATION_ADDED: [any];
  ANALYTICS_UPDATED: [any];
}>();

export const resolvers = {
  Query: {
    me: (_parent: any, _args: any, context: GraphQLContext) => {
      return context.user;
    },
    getAnalytics: () => {
      return [
        {
          views: 1200,
          clicks: 340,
          revenue: 450.5,
          timestamp: new Date().toISOString(),
        },
      ];
    },
    getNotifications: () => {
      return [];
    },
  },

  Mutation: {
    updateRole: (
      _parent: any,
      { userId, role }: { userId: string; role: string },
    ) => {
      return {
        id: userId,
        name: "Updated User",
        email: "user@test.com",
        role,
        createdAt: new Date().toISOString(),
      };
    },
    createNotification: (
      _parent: any,
      { message, type }: { message: string; type: string },
    ) => {
      const newNotification = {
        id: Math.random().toString(),
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      };
      // PubSub channel pr broadcast karein
      pubSub.publish("NOTIFICATION_ADDED", newNotification);
      return newNotification;
    },
    triggerAIResponse: async (_parent: any, { prompt }: { prompt: string }) => {
      return `AI Response to: ${prompt}. (Streaming feature configuration setup ready)`;
    },
  },

  Subscription: {
    notificationAdded: {
      subscribe: () => pubSub.subscribe("NOTIFICATION_ADDED"),
      resolve: (payload: any) => payload,
    },
    liveAnalyticsUpdated: {
      subscribe: () => pubSub.subscribe("ANALYTICS_UPDATED"),
      resolve: (payload: any) => payload,
    },
  },
};
