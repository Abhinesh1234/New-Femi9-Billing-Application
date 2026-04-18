import { configureStore } from '@reduxjs/toolkit';
import sidebarSlice from './sidebarSlice';
import themeReducer from './themeSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    sidebarSlice: sidebarSlice,
    theme:        themeReducer,
    auth:         authReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
