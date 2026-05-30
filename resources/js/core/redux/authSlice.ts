import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PartyCategory {
  party_user_id: number;
  party_id:      number;
  party_name:    string | null;
  category_id:   number | null;
  category_name: string | null;
  last_login_at: string | null;
  is_active:     boolean;
}

export interface AuthUser {
  id:       number;
  name:     string;
  phone:    string | null;
  email:    string | null;
  avatar:   string | null;
  user_type: "super_admin" | "admin" | "staff" | "party";
  role_id:   number | null;
  role_name?: string | null;
  /** null = super_admin (full access). {} = no access. { module: {...} } = explicit perms. */
  permissions: Record<string, {
    view:        boolean;
    create:      boolean;
    edit:        boolean;
    delete:      boolean;
    others:      boolean;
    others_data?: { party_category_ids?: number[] | null } | null;
  }> | null;
  settings?: { enable_composite_items: boolean; enable_price_lists: boolean };
  // Party-specific fields (only present when user_type === 'party')
  mobile?:        string | null;
  party_id?:      number;
  party_code?:    string | null;
  party_name?:    string | null;
  category_id?:   number | null;
  category_name?: string | null;
  last_login_at?:   string | null;
  account_number?:  string | null;
  ifsc_code?:       string | null;
  upi_number?:      string | null;
  locations?:       {
    id: number; name: string; type: string | null; is_primary: boolean;
    logo_type: string | null; logo_path: string | null; logo_url: string | null;
    address: Record<string, string | null> | null;
    shipping_address: Record<string, string | null> | null;
  }[];
  categories?:      PartyCategory[];
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
