import { configureStore } from '@reduxjs/toolkit';
import sidebarSlice from './sidebarSlice';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import partyAuthReducer from './partyAuthSlice';
import productSettingsReducer from './productSettingsSlice';
import flashReducer from './flashSlice';
import loaderReducer from './loaderSlice';

const store = configureStore({
  reducer: {
    sidebarSlice:    sidebarSlice,
    theme:           themeReducer,
    auth:            authReducer,
    partyAuth:       partyAuthReducer,
    productSettings: productSettingsReducer,
    flash:           flashReducer,
    loader:          loaderReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
