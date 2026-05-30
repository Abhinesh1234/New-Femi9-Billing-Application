import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PartyAuthUser } from "../services/partyAuthApi";

interface PartyAuthState {
  user:            PartyAuthUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

const storedToken = localStorage.getItem("party_auth_token");

const initialState: PartyAuthState = {
  user:            null,
  token:           storedToken,
  isAuthenticated: false,
  isLoading:       !!storedToken,
};

const partyAuthSlice = createSlice({
  name: "partyAuth",
  initialState,
  reducers: {
    setPartyAuth(state, action: PayloadAction<{ user: PartyAuthUser; token: string }>) {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading       = false;
    },
    setPartyUser(state, action: PayloadAction<PartyAuthUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.isLoading       = false;
    },
    clearPartyAuth(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
    },
    setPartyAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setPartyAuth, setPartyUser, clearPartyAuth, setPartyAuthLoading } = partyAuthSlice.actions;
export default partyAuthSlice.reducer;
