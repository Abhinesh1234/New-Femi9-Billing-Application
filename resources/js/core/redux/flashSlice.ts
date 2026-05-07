import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FlashState {
  message: string | null;
  type: "success" | "danger" | "warning" | null;
}

const initialState: FlashState = {
  message: null,
  type:    null,
};

const flashSlice = createSlice({
  name: "flash",
  initialState,
  reducers: {
    showFlash(state, action: PayloadAction<{ message: string; type: "success" | "danger" | "warning" }>) {
      state.message = action.payload.message;
      state.type    = action.payload.type;
    },
    clearFlash(state) {
      state.message = null;
      state.type    = null;
    },
  },
});

export const { showFlash, clearFlash } = flashSlice.actions;
export default flashSlice.reducer;
