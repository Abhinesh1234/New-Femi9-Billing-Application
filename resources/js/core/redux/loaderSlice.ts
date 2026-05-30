import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
  activeSources: string[];
}

const initialState: LoaderState = {
  activeSources: [],
};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    startLoading: (state, action: PayloadAction<string>) => {
      if (!state.activeSources.includes(action.payload)) {
        state.activeSources.push(action.payload);
      }
    },
    stopLoading: (state, action: PayloadAction<string>) => {
      state.activeSources = state.activeSources.filter(
        (s) => s !== action.payload
      );
    },
  },
});

export const { startLoading, stopLoading } = loaderSlice.actions;

export const selectIsLoading = (state: { loader: LoaderState }) =>
  state.loader.activeSources.length > 0;

export default loaderSlice.reducer;
