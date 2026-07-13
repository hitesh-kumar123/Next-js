// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  themeMode: "light" | "dark";
}

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  themeMode: "light",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setThemeMode: (state, action: PayloadAction<"light" | "dark">) => {
      state.themeMode = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebar,
  openModal,
  closeModal,
  setThemeMode,
} = uiSlice.actions;
export default uiSlice.reducer;
