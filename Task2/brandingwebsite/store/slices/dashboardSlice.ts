// store/slices/dashboardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  selectedTimeframe: "24h" | "7d" | "30d" | "12m";
  activeWorkspaceId: string | null;
  liveFeedCounter: number;
}

const initialState: DashboardState = {
  selectedTimeframe: "7d",
  activeWorkspaceId: null,
  liveFeedCounter: 0,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTimeframe: (
      state,
      action: PayloadAction<"24h" | "7d" | "30d" | "12m">,
    ) => {
      state.selectedTimeframe = action.payload;
    },
    setWorkspace: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },
    incrementLiveFeed: (state) => {
      state.liveFeedCounter += 1;
    },
    resetLiveFeedCounter: (state) => {
      state.liveFeedCounter = 0;
    },
  },
});

export const {
  setTimeframe,
  setWorkspace,
  incrementLiveFeed,
  resetLiveFeedCounter,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
