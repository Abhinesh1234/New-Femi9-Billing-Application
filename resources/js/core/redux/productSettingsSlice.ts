import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductSettingsState {
  isLoaded: boolean;
  enableCompositeItems: boolean;
  enablePriceLists: boolean;
}

const initialState: ProductSettingsState = {
  isLoaded: false,
  enableCompositeItems: false,
  enablePriceLists: false,
};

const productSettingsSlice = createSlice({
  name: "productSettings",
  initialState,
  reducers: {
    setProductSettings(
      state,
      action: PayloadAction<{ enableCompositeItems: boolean; enablePriceLists: boolean }>
    ) {
      state.enableCompositeItems = action.payload.enableCompositeItems;
      state.enablePriceLists     = action.payload.enablePriceLists;
      state.isLoaded             = true;
    },
    clearProductSettings(state) {
      state.isLoaded             = false;
      state.enableCompositeItems = false;
      state.enablePriceLists     = false;
    },
  },
});

export const { setProductSettings, clearProductSettings } = productSettingsSlice.actions;
export default productSettingsSlice.reducer;
