// hooks/useNotificationListener.ts
import { useEffect } from "react";

// React hooks ko explicit '/react' sub-path se import karein
import { useSubscription } from "@apollo/client/react";

// GraphQL compiler strings tag ko core library se hi aane dein
import { gql } from "@apollo/client/core";

import { useAppDispatch } from "../store";
import { incrementLiveFeed } from "../store/slices/dashboardSlice";
import toast from "react-hot-toast";

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      message
      type
      createdAt
    }
  }
`;

export function useNotificationListener() {
  const dispatch = useAppDispatch();
  const { data, error, loading } = useSubscription<any>(NOTIFICATION_SUBSCRIPTION);

  useEffect(() => {
    if (data?.notificationAdded) {
      const { message, type } = data.notificationAdded;

      // Real-time counter metrics upscaling
      dispatch(incrementLiveFeed());

      // Dynamic Toast invocation based on server responses
      if (type === "error") {
        toast.error(message);
      } else if (type === "success") {
        toast.success(message);
      } else {
        toast(message, { icon: "🔔" });
      }
    }
  }, [data, dispatch]);

  return {
    activeIncomingData: data,
    subscriptionLoading: loading,
    subscriptionError: error,
  };
}
