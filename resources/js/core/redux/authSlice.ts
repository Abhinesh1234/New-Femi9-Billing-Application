import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  user_type: "super_admin" | "admin" | "staff";
  permissions: Record<string, Record<string, boolean>> | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** true while we're verifying a stored token via /api/auth/me on page load */
  isLoading: boolean;
}

const storedToken = localStorage.getItem("auth_token");

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isLoading: !!storedToken, // show spinner while we verify the stored token
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called after successful login or session restore */
    setAuth(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading       = false;
    },
    /** Called after /api/auth/me restores session (token already in storage) */
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.isLoading       = false;
    },
    /** Called on logout or 401 */
    clearAuth(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setAuth, setUser, clearAuth, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
